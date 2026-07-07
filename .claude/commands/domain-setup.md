One-time checklist for when the custom domain is purchased. This consolidates all
domain-dependent tasks from docs/ops/nonprofit-setup-guide.md and the deferred items list.

Run through each section and confirm completion:

## 1. Domain Registration
- [ ] Domain purchased (registrar: ______)
- [ ] WHOIS privacy enabled
- [ ] Registrar lock enabled
- [ ] Auto-renew turned on
- [ ] Credentials stored in Bitwarden under Nonprofit / Developer

## 2. DNS Configuration
- [ ] Nameservers pointed to Cloudflare (or configured at registrar)
- [ ] Vercel DNS records added (per Vercel Dashboard instructions)
- [ ] SSL certificate auto-provisioned by Vercel

## 3. Vercel
- [ ] Domain added in Vercel Dashboard > Project > Settings > Domains
- [ ] www redirect configured (www.domain.com -> domain.com)
- [ ] `NEXT_PUBLIC_SITE_URL` env var updated to `https://domain.com`
- [ ] Redeployed after env var change

## 4. Google Workspace Email (if setting up)
- [ ] MX records added to DNS (see docs/ops/nonprofit-setup-guide.md Phase 3B)
- [ ] SPF record added
- [ ] DKIM record added
- [ ] DMARC record added
- [ ] Test email send/receive working

## 5. Stripe Webhook
- [ ] Webhook endpoint registered in Stripe Dashboard: `https://domain.com/api/stripe/webhook`
- [ ] Events subscribed: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
- [ ] Signing secret copied to Vercel env var `STRIPE_WEBHOOK_SECRET`
- [ ] Redeployed after updating the secret

## 6. Supabase Auth
- [ ] Site URL set to `https://domain.com` in Supabase Dashboard > Authentication > URL Configuration
- [ ] `https://domain.com/auth/callback` added to Redirect URLs
- [ ] `https://blackmalejournal.vercel.app/auth/callback` kept for preview deploys

## 7. Resend Email
- [ ] Domain verified in Resend dashboard
- [ ] SPF/DKIM records added for Resend deliverability
- [ ] `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `CONTACT_TO_EMAIL` set in Vercel env vars

## 8. Analytics
- [ ] Plausible script uncommented in `src/app/layout.tsx`
- [ ] Plausible configured for the production domain
- [ ] Redeployed

## 9. SEO
- [ ] Google Search Console: site ownership verified
- [ ] Sitemap submitted: `https://domain.com/sitemap.xml`

## 10. Final Verification
- [ ] All 13 public pages load without errors (run /deploy-check first)
- [ ] Stripe test checkout completes end-to-end
- [ ] Contact form submission stores in Supabase and sends email
- [ ] Newsletter signup works from footer
- [ ] Login/signup/portal flow works
- [ ] Open Graph meta tags show correct domain in social previews

After all items are checked, update docs/ops/env-vars.md if any variables changed,
and remove completed items from the deferred list in memory.
