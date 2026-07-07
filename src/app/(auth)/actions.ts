'use server';

import { createClient } from '@/lib/supabase/server';
import type { PaidMemberTier } from '@/lib/supabase/types';
import { PATHS, normalizeInternalPath, withQuery } from '@/lib/paths';
import { resolveSiteUrl } from '@/lib/site-url';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

function resolveAuthRedirect(formData: FormData): string {
  return normalizeInternalPath(
    (formData.get('next') as string | null) ?? (formData.get('redirect') as string | null),
    PATHS.PORTAL,
  );
}

function resolveSelectedTier(formData: FormData): 'free' | PaidMemberTier {
  const value = formData.get('tier');
  return value === 'basic' || value === 'premium' ? value : 'free';
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const nextHref = resolveAuthRedirect(formData);

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    redirect(withQuery(PATHS.LOGIN, {
      error: error.message,
      next: nextHref !== PATHS.PORTAL ? nextHref : undefined,
    }));
  }

  revalidatePath('/', 'layout');
  redirect(nextHref);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;
  const selectedTier = resolveSelectedTier(formData);
  const nextHref = normalizeInternalPath(formData.get('next') as string | null, PATHS.PORTAL);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    redirect(withQuery(PATHS.SIGNUP, {
      error: error.message,
      tier: selectedTier !== 'free' ? selectedTier : undefined,
      next: nextHref !== PATHS.PORTAL ? nextHref : undefined,
    }));
  }

  // Create member row linked to auth user
  if (data.user) {
    const { error: memberInsertError } = await supabase.from('members').insert({
      id: data.user.id,
      email,
      tier: 'free' as const,
      role: 'member' as const,
      stripe_customer_id: null,
      stripe_subscription_id: null,
    });

    if (memberInsertError) {
      redirect(withQuery(PATHS.SIGNUP, {
        error: memberInsertError.message,
        tier: selectedTier !== 'free' ? selectedTier : undefined,
        next: nextHref !== PATHS.PORTAL ? nextHref : undefined,
      }));
    }
  }

  revalidatePath('/', 'layout');
  if (selectedTier !== 'free') {
    redirect(withQuery(PATHS.PORTAL_SETTINGS, {
      upgrade: selectedTier,
      next: nextHref !== PATHS.PORTAL ? nextHref : undefined,
    }));
  }

  redirect(PATHS.PORTAL);
}

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient();
  const nextHref = resolveAuthRedirect(formData);

  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get('email') as string,
    options: {
      emailRedirectTo: `${resolveSiteUrl()}/auth/callback?next=${encodeURIComponent(nextHref)}`,
    },
  });

  if (error) {
    redirect(withQuery(PATHS.LOGIN, {
      error: error.message,
      next: nextHref !== PATHS.PORTAL ? nextHref : undefined,
    }));
  }

  redirect(withQuery(PATHS.LOGIN, {
    message: 'Check your email for the magic link',
    next: nextHref !== PATHS.PORTAL ? nextHref : undefined,
  }));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(PATHS.HOME);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const displayName = formData.get('displayName') as string;

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) {
    redirect(`${PATHS.PORTAL_SETTINGS}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath('/', 'layout');
  redirect(`${PATHS.PORTAL_SETTINGS}?message=Profile updated`);
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`${PATHS.PORTAL_SETTINGS}?error=` + encodeURIComponent(error.message));
  }

  redirect(`${PATHS.PORTAL_SETTINGS}?message=Password updated`);
}
