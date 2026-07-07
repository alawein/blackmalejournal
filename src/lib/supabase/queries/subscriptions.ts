import { createClient } from '@/lib/supabase/server';
import { normalizeEmailAddress } from '@/lib/email';
import { executeUpdate } from './_shared';

export async function subscribeToNewsletter(
  email: string,
  source?: string,
): Promise<void> {
  const supabase = await createClient();
  const normalizedEmail = normalizeEmailAddress(email);
  await executeUpdate(
    supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          source: source?.trim() || null,
          unsubscribed_at: null,
        },
        { onConflict: 'email' },
      ),
    'subscribeToNewsletter',
    { throwOnError: true },
  );
}

export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const supabase = await createClient();
  await executeUpdate(
    supabase
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email', normalizeEmailAddress(email)),
    'unsubscribeFromNewsletter',
  );
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const supabase = await createClient();
  await executeUpdate(
    supabase
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject ?? null,
        message: data.message,
      }),
    'submitContactForm',
    { throwOnError: true },
  );
}
