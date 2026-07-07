Create a new Weekend Briefing record for the Supabase database.

Ask me for:
1. Issue number (check existing briefings in the database or seed files to auto-suggest next number)
2. Headline / title
3. Number of sections (default 5)
4. Section titles

Then generate:
- A SQL INSERT statement for the briefings table matching the schema in src/lib/supabase/types.ts
- Slug: weekend-briefing-[issue-number]
- published_at set to today's date
- sections as a JSON array of {title, body} objects
- Access tier defaulted to "free"
- status set to "draft"
- The "WEEKEND BRIEFING / [DATE]" header format

Output the SQL so it can be added to a seed file or run directly.
