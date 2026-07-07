#!/usr/bin/env node
/**
 * check-no-test-users.mjs
 * Queries Supabase for known test account emails and aborts if any exist.
 * Run as a pre-deploy gate: node scripts/check-no-test-users.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Skipped automatically when NEXT_PUBLIC_SITE_URL is not the production domain.
 */

const TEST_EMAILS = [
  'admin@bmj.test',
  'free@bmj.test',
  'basic@bmj.test',
  'premium@bmj.test',
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const isProd  = siteUrl.includes('blackmalejournal.org');

if (!isProd) {
  console.log(`check-no-test-users: skipped (NEXT_PUBLIC_SITE_URL=${siteUrl || '(unset)'})`);
  process.exit(0);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('check-no-test-users: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const res = await fetch(
  `${supabaseUrl}/rest/v1/members?email=in.(${TEST_EMAILS.map(e => `"${e}"`).join(',')})&select=email`,
  { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
);

if (!res.ok) {
  console.error(`check-no-test-users: Supabase query failed (${res.status})`);
  process.exit(1);
}

const found = await res.json();

if (found.length > 0) {
  console.error('⛔  DEPLOY BLOCKED: test users found in production database:');
  found.forEach(r => console.error(`   - ${r.email}`));
  console.error('Remove test accounts before deploying to production.');
  process.exit(1);
}

console.log('check-no-test-users: OK — no test accounts found in production.');
