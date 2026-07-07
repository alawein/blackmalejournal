import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

// Service-role client — bypasses RLS. Use ONLY in trusted server contexts
// (webhooks, admin operations). Never expose to the browser.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
