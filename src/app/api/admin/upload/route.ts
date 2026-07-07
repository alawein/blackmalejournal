import { NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { getAdminActor } from '@/lib/admin-auth';
import { getPublicUrl, uploadFile } from '@/lib/supabase/storage';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 100 });

const uploadSchema = z.object({
  bucket: z.enum(['covers', 'downloads', 'media']),
  folder: z
    .string()
    .trim()
    .min(1, 'Folder is required')
    .max(120, 'Folder is too long')
    .regex(/^[a-z0-9][a-z0-9/_-]*$/i, 'Folder contains invalid characters'),
});

function sanitizeFilename(filename: string): string {
  const [base, extension] = filename.split(/\.(?=[^.]+$)/);
  const safeBase = (base || 'file')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  const safeExtension = extension
    ? extension.toLowerCase().replace(/[^a-z0-9]+/g, '')
    : '';
  return safeExtension ? `${safeBase || 'file'}.${safeExtension}` : safeBase || 'file';
}

function normalizeFolder(folder: string): string {
  return folder.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
}

export async function POST(request: Request) {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  const { success } = await limiter.check(20, ip);
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const actor = await getAdminActor(['admin', 'editor']);
  if (!actor.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (!actor.member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const formData = await request.formData();
  const parsed = uploadSchema.safeParse({
    bucket: formData.get('bucket'),
    folder: formData.get('folder'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid upload request' },
      { status: 400 },
    );
  }

  const fileEntry = formData.get('file');
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return NextResponse.json({ error: 'Choose a file to upload' }, { status: 400 });
  }

  const folder = normalizeFolder(parsed.data.folder);
  const storedPath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(fileEntry.name)}`;
  const contentType = fileEntry.type || 'application/octet-stream';
  const buffer = Buffer.from(await fileEntry.arrayBuffer());

  const path = await uploadFile(parsed.data.bucket, storedPath, buffer, {
    contentType,
  });

  if (!path) {
    return NextResponse.json(
      { error: 'Upload failed. Check the file type and size, then try again.' },
      { status: 500 },
    );
  }

  const url =
    parsed.data.bucket === 'downloads'
      ? undefined
      : await getPublicUrl(parsed.data.bucket, path);

  return NextResponse.json({
    bucket: parsed.data.bucket,
    path,
    url,
    name: fileEntry.name,
    size: fileEntry.size,
    contentType,
  });
}
