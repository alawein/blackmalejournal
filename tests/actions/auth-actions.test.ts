// jest.mock is hoisted above const/let declarations (TDZ), so we must
// define mock fns inside the factory and export them via a shared object.
const mocks = {
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signInWithOtp: jest.fn(),
  signOut: jest.fn(),
  updateUser: jest.fn(),
  insert: jest.fn().mockResolvedValue({ error: null }),
  from: jest.fn(),
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  revalidatePath: jest.fn(),
};

// Wire up `from` to return `{ insert }`
mocks.from.mockReturnValue({ insert: mocks.insert });

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockImplementation(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mocks.signInWithPassword,
        signUp: mocks.signUp,
        signInWithOtp: mocks.signInWithOtp,
        signOut: mocks.signOut,
        updateUser: mocks.updateUser,
      },
      from: mocks.from,
    }),
  ),
}));

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mocks.redirect(...args),
}));

jest.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mocks.revalidatePath(...args),
}));

import {
  login,
  signup,
  signInWithMagicLink,
  signOut,
  updateProfile,
  updatePassword,
} from '@/app/(auth)/actions';
import { withQuery } from '@/lib/paths';

function createFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Re-wire from after clearAllMocks
  mocks.from.mockReturnValue({ insert: mocks.insert });
  mocks.insert.mockResolvedValue({ error: null });
  mocks.redirect.mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
});

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------
describe('login', () => {
  it('calls signInWithPassword, revalidatePath, and redirects to /portal on success', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    try {
      await login(createFormData({ email: 'test@example.com', password: 'pass123' }));
    } catch {
      // redirect throws
    }

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'pass123',
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mocks.redirect).toHaveBeenCalledWith('/portal');
  });

  it('redirects to /login?error=... on auth error', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    try {
      await login(createFormData({ email: 'bad@example.com', password: 'wrong' }));
    } catch {
      // redirect throws
    }

    expect(mocks.redirect).toHaveBeenCalledWith(
      withQuery('/login', { error: 'Invalid credentials' }),
    );
  });

  it('passes email and password from formData to signInWithPassword', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });

    try {
      await login(createFormData({ email: 'a@b.com', password: 'secret' }));
    } catch {
      // redirect throws
    }

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret',
    });
  });
});

// ---------------------------------------------------------------------------
// signup
// ---------------------------------------------------------------------------
describe('signup', () => {
  const signupData = {
    email: 'new@example.com',
    password: 'newpass123',
    displayName: 'Test User',
  };

  it('calls signUp, creates member row, and redirects to /portal on success', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    try {
      await signup(createFormData(signupData));
    } catch {
      // redirect throws
    }

    expect(mocks.signUp).toHaveBeenCalled();
    expect(mocks.from).toHaveBeenCalledWith('members');
    expect(mocks.insert).toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mocks.redirect).toHaveBeenCalledWith('/portal');
  });

  it('redirects to /signup?error=... on auth error', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'Email taken' },
    });

    try {
      await signup(createFormData(signupData));
    } catch {
      // redirect throws
    }

    expect(mocks.redirect).toHaveBeenCalledWith(
      withQuery('/signup', { error: 'Email taken' }),
    );
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('creates member with correct fields (id, email, tier free, null stripe IDs)', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'user-456' } },
      error: null,
    });

    try {
      await signup(createFormData(signupData));
    } catch {
      // redirect throws
    }

    expect(mocks.insert).toHaveBeenCalledWith({
      id: 'user-456',
      email: 'new@example.com',
      tier: 'free',
      role: 'member',
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });
  });

  it('passes displayName in options.data as display_name', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'user-789' } },
      error: null,
    });

    try {
      await signup(createFormData(signupData));
    } catch {
      // redirect throws
    }

    expect(mocks.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'newpass123',
      options: { data: { display_name: 'Test User' } },
    });
  });

  it('redirects to /signup?error=... when member row creation fails', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'user-999' } },
      error: null,
    });
    mocks.insert.mockResolvedValue({
      error: { message: 'Could not create member profile' },
    });

    try {
      await signup(createFormData(signupData));
    } catch {
      // redirect throws
    }

    expect(mocks.redirect).toHaveBeenCalledWith(
      withQuery('/signup', { error: 'Could not create member profile' }),
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('redirects paid signups to portal settings with tier intent and next', async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: 'user-paid' } },
      error: null,
    });

    try {
      await signup(
        createFormData({
          ...signupData,
          tier: 'basic',
          next: '/articles/return-here',
        }),
      );
    } catch {
      // redirect throws
    }

    expect(mocks.insert).toHaveBeenCalledWith({
      id: 'user-paid',
      email: 'new@example.com',
      tier: 'free',
      role: 'member',
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });
    expect(mocks.redirect).toHaveBeenCalledWith(
      '/portal/settings?upgrade=basic&next=%2Farticles%2Freturn-here',
    );
  });
});

// ---------------------------------------------------------------------------
// signInWithMagicLink
// ---------------------------------------------------------------------------
describe('signInWithMagicLink', () => {
  it('calls signInWithOtp and redirects to /login?message=... on success', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null });

    try {
      await signInWithMagicLink(createFormData({ email: 'magic@example.com' }));
    } catch {
      // redirect throws
    }

    expect(mocks.signInWithOtp).toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith(
      withQuery('/login', { message: 'Check your email for the magic link' }),
    );
  });

  it('redirects to /login?error=... on error', async () => {
    mocks.signInWithOtp.mockResolvedValue({
      error: { message: 'Rate limit exceeded' },
    });

    try {
      await signInWithMagicLink(createFormData({ email: 'magic@example.com' }));
    } catch {
      // redirect throws
    }

    expect(mocks.redirect).toHaveBeenCalledWith(
      withQuery('/login', { error: 'Rate limit exceeded' }),
    );
  });

  it('passes correct emailRedirectTo URL', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://blackmalejournal.com';
    mocks.signInWithOtp.mockResolvedValue({ error: null });

    try {
      await signInWithMagicLink(createFormData({ email: 'magic@example.com' }));
    } catch {
      // redirect throws
    }

    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: 'magic@example.com',
      options: {
        emailRedirectTo: 'https://blackmalejournal.com/auth/callback?next=%2Fportal',
      },
    });

    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
});

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------
describe('signOut', () => {
  it('calls auth.signOut()', async () => {
    mocks.signOut.mockResolvedValue({ error: null });

    try {
      await signOut();
    } catch {
      // redirect throws
    }

    expect(mocks.signOut).toHaveBeenCalled();
  });

  it('revalidates path and redirects to /', async () => {
    mocks.signOut.mockResolvedValue({ error: null });

    try {
      await signOut();
    } catch {
      // redirect throws
    }

    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mocks.redirect).toHaveBeenCalledWith('/');
  });
});

// ---------------------------------------------------------------------------
// updateProfile
// ---------------------------------------------------------------------------
describe('updateProfile', () => {
  it('calls updateUser with display_name and redirects to /portal/settings?message=Profile updated', async () => {
    mocks.updateUser.mockResolvedValue({ error: null });

    try {
      await updateProfile(createFormData({ displayName: 'New Name' }));
    } catch {
      // redirect throws
    }

    expect(mocks.updateUser).toHaveBeenCalledWith({
      data: { display_name: 'New Name' },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(mocks.redirect).toHaveBeenCalledWith(
      '/portal/settings?message=Profile updated',
    );
  });

  it('redirects to /portal/settings?error=... on error', async () => {
    mocks.updateUser.mockResolvedValue({
      error: { message: 'Update failed' },
    });

    try {
      await updateProfile(createFormData({ displayName: 'New Name' }));
    } catch {
      // redirect throws
    }

    expect(mocks.redirect).toHaveBeenCalledWith(
      '/portal/settings?error=' + encodeURIComponent('Update failed'),
    );
  });

  it('does not revalidatePath on error', async () => {
    mocks.updateUser.mockResolvedValue({
      error: { message: 'Nope' },
    });

    try {
      await updateProfile(createFormData({ displayName: 'X' }));
    } catch {
      // redirect throws
    }

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updatePassword
// ---------------------------------------------------------------------------
describe('updatePassword', () => {
  it('calls updateUser with password and redirects to /portal/settings?message=Password updated', async () => {
    mocks.updateUser.mockResolvedValue({ error: null });

    try {
      await updatePassword(createFormData({ password: 'newpass999' }));
    } catch {
      // redirect throws
    }

    expect(mocks.updateUser).toHaveBeenCalledWith({ password: 'newpass999' });
    expect(mocks.redirect).toHaveBeenCalledWith(
      '/portal/settings?message=Password updated',
    );
  });

  it('redirects to /portal/settings?error=... on error', async () => {
    mocks.updateUser.mockResolvedValue({
      error: { message: 'Weak password' },
    });

    try {
      await updatePassword(createFormData({ password: 'short' }));
    } catch {
      // redirect throws
    }

    expect(mocks.redirect).toHaveBeenCalledWith(
      '/portal/settings?error=' + encodeURIComponent('Weak password'),
    );
  });

  it('does not call revalidatePath (updatePassword has no revalidation)', async () => {
    mocks.updateUser.mockResolvedValue({ error: null });

    try {
      await updatePassword(createFormData({ password: 'newpass999' }));
    } catch {
      // redirect throws
    }

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
