-- Denormalized first-section title for list/archive queries (avoids transferring full `sections` jsonb).
ALTER TABLE public.briefings
ADD COLUMN IF NOT EXISTS lead_kicker text
GENERATED ALWAYS AS (sections->0->>'title') STORED;

COMMENT ON COLUMN public.briefings.lead_kicker IS 'First section title; mirrors sections[0].title for narrow SELECTs.';
