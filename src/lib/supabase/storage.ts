// src/lib/supabase/storage.ts
//
// Utility helpers for Supabase Storage operations.
// Public buckets use the server client (respects RLS).
// Admin operations (upload, delete) use the service-role client.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type StorageBucket = 'covers' | 'downloads' | 'media' | 'avatars';

/**
 * Get a public URL for a file in a public bucket (covers, media, avatars).
 * Returns the URL synchronously from Supabase — no network call required.
 */
export async function getPublicUrl(bucket: StorageBucket, path: string): Promise<string> {
  const supabase = await createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed (time-limited) URL for a file in a private bucket (downloads).
 * Default expiry: 3600 seconds (1 hour).
 * Returns null on error.
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) {
    console.error(`[getSignedUrl] ${bucket}/${path}:`, error.message);
    return null;
  }
  return data.signedUrl;
}

/**
 * Upload a file using the admin (service-role) client. Bypasses RLS.
 * Returns the stored path on success, null on error.
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File | Buffer,
  options?: { contentType?: string; upsert?: boolean },
): Promise<string | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: options?.contentType,
    upsert: options?.upsert ?? false,
  });
  if (error) {
    console.error(`[uploadFile] ${bucket}/${path}:`, error.message);
    return null;
  }
  return data.path;
}

/**
 * Delete one or more files using the admin (service-role) client. Bypasses RLS.
 * Returns true on success, false on error.
 */
export async function deleteFile(
  bucket: StorageBucket,
  paths: string[],
): Promise<boolean> {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error(`[deleteFile] ${bucket}:`, error.message);
    return false;
  }
  return true;
}
