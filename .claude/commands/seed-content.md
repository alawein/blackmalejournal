Seed the database with sample content using the existing seed infrastructure.

## Existing seed scripts
- `scripts/seed.ts` -- seed a single table
- `scripts/seed-all.ts` -- seed all tables
- `supabase/seed-*.sql` -- SQL seed files (courses, dispatches, downloads, handbooks, lessons)

## To run all seeds:
```bash
npx tsx scripts/seed-all.ts
```

## To create new seed data:
1. Add SQL INSERT statements to the appropriate `supabase/seed-*.sql` file
2. Or modify `scripts/seed.ts` for programmatic seeding
3. Content should reflect the revolutionary masculinist tone -- strong, direct, historically grounded
4. Mix access tiers (free, basic, premium) across content types
5. Default author to "The Chairman"
