Create a new article record for the Supabase database.

Ask me for:
1. Title
2. Lens (health, politics, culture, entertainment, or business)
3. Tags (comma-separated)
4. Brief excerpt (1-2 sentences)
5. Access tier (free, basic, or premium — default free)
6. Featured? (yes/no — default no)

Then generate:
- A SQL INSERT statement for the articles table matching the schema in src/lib/supabase/types.ts
- Slug auto-generated from title (kebab-case)
- published_at set to today's date in ISO format
- author defaulted to "The Chairman"
- status set to "draft"
- A starter body in markdown with ## headings matching the BMJ editorial style

Output the SQL so it can be added to a seed file or run directly.
