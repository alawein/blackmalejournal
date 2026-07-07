/** @jest-environment node */
const mockGetAdminActor = jest.fn();
jest.mock('@/lib/admin-auth', () => ({
  getAdminActor: (...args: unknown[]) => mockGetAdminActor(...args),
}));

const mockUploadFile = jest.fn();
const mockGetPublicUrl = jest.fn();
jest.mock('@/lib/supabase/storage', () => ({
  uploadFile: (...args: unknown[]) => mockUploadFile(...args),
  getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
}));

const mockRateLimitCheck = jest.fn();
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => ({ check: (...args: unknown[]) => mockRateLimitCheck(...args) }),
}));

jest.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === 'x-forwarded-for' ? '127.0.0.1' : null),
    }),
}));

import { POST } from '@/app/api/admin/upload/route';

function makeRequest(fields: Record<string, string | File> = {}) {
  const formData = new FormData();
  formData.append('bucket', 'covers');
  formData.append('folder', 'articles');
  formData.append('file', new File(['hello'], 'test.jpg', { type: 'image/jpeg' }));
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return new Request('http://localhost:3000/api/admin/upload', {
    method: 'POST',
    body: formData,
  });
}

const validActor = {
  userId: 'user-123',
  member: { id: 'user-123', role: 'admin', tier: 'premium', email: 'admin@test.com' },
};

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAdminActor.mockResolvedValue(validActor);
    mockUploadFile.mockResolvedValue('covers/articles/test.jpg');
    mockGetPublicUrl.mockResolvedValue('https://example.com/covers/articles/test.jpg');
    mockRateLimitCheck.mockResolvedValue({ success: true, remaining: 19 });
  });

  it('returns 401 when not authenticated', async () => {
    mockGetAdminActor.mockResolvedValue({ userId: '', member: null });
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 403 when member not authorized', async () => {
    mockGetAdminActor.mockResolvedValue({ userId: 'user-123', member: null });
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockRateLimitCheck.mockResolvedValue({ success: false, remaining: 0 });
    const req = makeRequest();
    const res = await POST(req);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toBe('Too many requests');
    expect(mockRateLimitCheck).toHaveBeenCalledWith(20, '127.0.0.1');
  });

  it('returns 400 for invalid bucket', async () => {
    const res = await POST(makeRequest({ bucket: 'invalid-bucket' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty folder', async () => {
    const res = await POST(makeRequest({ folder: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing file', async () => {
    const formData = new FormData();
    formData.append('bucket', 'covers');
    formData.append('folder', 'articles');
    const req = new Request('http://localhost:3000/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when upload fails', async () => {
    mockUploadFile.mockResolvedValue(null);
    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });

  it('returns 200 with file metadata on success', async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.bucket).toBe('covers');
    expect(body.path).toBe('covers/articles/test.jpg');
    expect(body.url).toBe('https://example.com/covers/articles/test.jpg');
    expect(body.name).toBe('test.jpg');
    expect(body.contentType).toBe('image/jpeg');
  });

  it('omits url for downloads bucket', async () => {
    mockUploadFile.mockResolvedValue('downloads/articles/test.pdf');
    const res = await POST(
      makeRequest({
        bucket: 'downloads',
        file: new File(['data'], 'test.pdf', { type: 'application/pdf' }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeUndefined();
  });
});
