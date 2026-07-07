// ── Mock storage bucket interface ────────────────────────────────────────────

function createMockStorageBucket() {
  return {
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/covers/test.jpg' },
    }),
    createSignedUrl: jest.fn().mockResolvedValue({
      data: { signedUrl: 'https://example.supabase.co/storage/v1/object/sign/downloads/book.pdf?token=abc' },
      error: null,
    }),
    upload: jest.fn().mockResolvedValue({
      data: { path: 'articles/hero.jpg' },
      error: null,
    }),
    remove: jest.fn().mockResolvedValue({
      data: { message: 'Successfully deleted' },
      error: null,
    }),
  };
}

// ── Module-level mocks ──────────────────────────────────────────────────────

let mockStorageBucket = createMockStorageBucket();

const mockServerClient = {
  storage: {
    from: jest.fn().mockReturnValue(mockStorageBucket),
  },
};

const mockAdminClient = {
  storage: {
    from: jest.fn().mockReturnValue(mockStorageBucket),
  },
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockServerClient)),
}));

jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(() => mockAdminClient),
}));

// Suppress console.error noise from expected error paths
jest.spyOn(console, 'error').mockImplementation(() => {});

import { getPublicUrl, getSignedUrl, uploadFile, deleteFile } from '@/lib/supabase/storage';

// ── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  mockStorageBucket = createMockStorageBucket();
  mockServerClient.storage.from.mockReturnValue(mockStorageBucket);
  mockAdminClient.storage.from.mockReturnValue(mockStorageBucket);
});

// ── getPublicUrl ────────────────────────────────────────────────────────────

describe('getPublicUrl', () => {
  it('returns the public URL from supabase storage', async () => {
    const url = await getPublicUrl('covers', 'test.jpg');
    expect(url).toBe('https://example.supabase.co/storage/v1/object/public/covers/test.jpg');
    expect(mockServerClient.storage.from).toHaveBeenCalledWith('covers');
    expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith('test.jpg');
  });

  it('works with nested paths', async () => {
    mockStorageBucket.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/media/articles/hero.jpg' },
    });
    const url = await getPublicUrl('media', 'articles/hero.jpg');
    expect(url).toBe('https://example.supabase.co/storage/v1/object/public/media/articles/hero.jpg');
    expect(mockServerClient.storage.from).toHaveBeenCalledWith('media');
  });
});

// ── getSignedUrl ────────────────────────────────────────────────────────────

describe('getSignedUrl', () => {
  it('returns signed URL on success', async () => {
    const url = await getSignedUrl('downloads', 'book.pdf');
    expect(url).toBe('https://example.supabase.co/storage/v1/object/sign/downloads/book.pdf?token=abc');
    expect(mockServerClient.storage.from).toHaveBeenCalledWith('downloads');
    expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith('book.pdf', 3600);
  });

  it('uses custom expiry when provided', async () => {
    await getSignedUrl('downloads', 'book.pdf', 7200);
    expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith('book.pdf', 7200);
  });

  it('returns null on error', async () => {
    mockStorageBucket.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: 'Object not found' },
    });
    const url = await getSignedUrl('downloads', 'missing.pdf');
    expect(url).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      '[getSignedUrl] downloads/missing.pdf:',
      'Object not found',
    );
  });
});

// ── uploadFile ──────────────────────────────────────────────────────────────

describe('uploadFile', () => {
  it('returns stored path on success', async () => {
    const result = await uploadFile('covers', 'articles/hero.jpg', Buffer.from('fake-image'));
    expect(result).toBe('articles/hero.jpg');
    expect(mockAdminClient.storage.from).toHaveBeenCalledWith('covers');
    expect(mockStorageBucket.upload).toHaveBeenCalledWith(
      'articles/hero.jpg',
      expect.any(Buffer),
      { contentType: undefined, upsert: false },
    );
  });

  it('passes content type and upsert options', async () => {
    await uploadFile('media', 'photo.webp', Buffer.from('img'), {
      contentType: 'image/webp',
      upsert: true,
    });
    expect(mockStorageBucket.upload).toHaveBeenCalledWith(
      'photo.webp',
      expect.any(Buffer),
      { contentType: 'image/webp', upsert: true },
    );
  });

  it('returns null on error', async () => {
    mockStorageBucket.upload.mockResolvedValue({
      data: null,
      error: { message: 'Bucket not found' },
    });
    const result = await uploadFile('covers', 'bad.jpg', Buffer.from('x'));
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      '[uploadFile] covers/bad.jpg:',
      'Bucket not found',
    );
  });
});

// ── deleteFile ──────────────────────────────────────────────────────────────

describe('deleteFile', () => {
  it('returns true on success', async () => {
    const result = await deleteFile('covers', ['old.jpg', 'stale.png']);
    expect(result).toBe(true);
    expect(mockAdminClient.storage.from).toHaveBeenCalledWith('covers');
    expect(mockStorageBucket.remove).toHaveBeenCalledWith(['old.jpg', 'stale.png']);
  });

  it('returns false on error', async () => {
    mockStorageBucket.remove.mockResolvedValue({
      data: null,
      error: { message: 'Permission denied' },
    });
    const result = await deleteFile('media', ['protected.jpg']);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      '[deleteFile] media:',
      'Permission denied',
    );
  });
});
