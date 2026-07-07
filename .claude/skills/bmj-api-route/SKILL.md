---
name: bmj-api-route
description: Use when building or modifying API routes — input validation, rate limiting, error responses, Stripe webhooks, file downloads. Triggers on "API route", "endpoint", "webhook", "server-side handler".
---

# BMJ API Route Builder

How to build API routes following established patterns.

## Doc context (Tier A/B)

[AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), [docs/standards/agent-knowledge-protocol.md](../../docs/standards/agent-knowledge-protocol.md). **Task-scoped:** [docs/ops/env-vars.md](../../docs/ops/env-vars.md) (secrets vs `NEXT_PUBLIC_*`); [CLAUDE.md](../../CLAUDE.md) (API route patterns if extended there).

## Location

All API routes: `src/app/api/<path>/route.ts`

## Standard Route Structure

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  // Zod schema for input validation
});

export async function POST(req: NextRequest) {
  // 1. Rate limit
  const limited = rateLimit(req, { maxRequests: 5, windowMs: 60_000 });
  if (limited) return limited;

  // 2. Parse and validate input
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // 3. Business logic with Supabase
  const supabase = await createClient();
  // ...

  // 4. Return response
  return NextResponse.json({ success: true });
}
```

## Existing Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/contact` | POST | Contact form submission |
| `/api/newsletter/subscribe` | POST | Newsletter signup |
| `/api/search` | GET | Global content search |
| `/api/downloads/[slug]` | GET | File download redirect |
| `/api/handbooks/[slug]/download` | GET | Handbook download redirect |
| `/api/stripe/checkout` | POST | Membership checkout session |
| `/api/stripe/donate` | POST | One-time/recurring donation |
| `/api/stripe/manage-billing` | POST | Customer portal redirect |
| `/api/stripe/webhook` | POST | Stripe event handler |
| `/api/admin/upload` | POST | Storage file upload |
| `/api/admin/subscribers/export` | GET | CSV subscriber export |

## Key Patterns

- **Always validate with Zod** — never trust request body
- **Always rate limit** — use `rateLimit()` from `src/lib/rate-limit.ts`
- **Stripe webhooks** — verify signature via `stripe.webhooks.constructEvent()`
- **Admin routes** — check admin role via `src/lib/admin-auth.ts` before processing
- **Error responses** — return JSON with `{ error: string }`, appropriate HTTP status
- **No CORS headers needed** — same-origin requests only

## Testing

Test files: `tests/api/<route-name>.test.ts`

Mock Supabase and Stripe via `tests/helpers/supabase-mock.ts` and `tests/helpers/stripe-mock.ts`.
