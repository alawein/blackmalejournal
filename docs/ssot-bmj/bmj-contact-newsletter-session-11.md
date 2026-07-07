## SESSION 11: CONTACT + NEWSLETTER

```
/superpowers:writing-plans Build the Contact page and newsletter system for The Black Male Journal.

Session 11. Communication channels — how people reach the Chairman and
join the mailing list.

Build:

1. CONTACT PAGE (src/app/(public)/contact/page.tsx)
   - Page title: "CONNECT" in Bebas Neue
   - Two-column layout (stacked on mobile):
     LEFT: Contact form (name, email, subject dropdown, message textarea)
     RIGHT: Direct contact info
       - Email: chairman@blackmalejournal.com
       - WhatsApp: link to dedicated number (wa.me/[number])
       - Social links: IG, YouTube, LinkedIn, X
       - Support: Patreon, PayPal, CashApp, Venmo [please don't forget to add this]. Maybe a unified donation page/card (once they click on Donate) with Apple Pay, CashApp, etc.? It should also have an optional note with special emojis (BJM designed) etc.
   - Form submits to /api/contact which uses Resend to send email
   - Success toast: "Message sent. The Chairman will respond."
   - Error handling with user-friendly messages

2. CONTACT API (src/app/api/contact/route.ts)
   - Validates input with Zod schema
   - Sends email via Resend to chairman@blackmalejournal.com
   - Also inserts into contact_submissions table
   - Rate limiting: basic check to prevent spam (optional for v1)

3. NEWSLETTER SIGNUP (src/app/api/newsletter/subscribe/route.ts)
   - POST handler: takes email, validates, inserts into newsletter_subscribers
   - Duplicate email handling (upsert or friendly error)
   - Optional: send welcome email via Resend
   - Returns success/error JSON

4. NEWSLETTER COMPONENTS:
   - Inline signup form (email input + submit button) — used in Footer and CTA sections
   - Full signup page at /newsletter (optional) or modal
   - Style: --bmj-red submit button, dark input field with cream text/placeholder

5. UPDATE FOOTER: wire the newsletter signup form to the actual API endpoint.

Build and test. Verify emails send via Resend. Run `npm run build`.
```
