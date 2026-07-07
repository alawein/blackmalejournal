-- Consolidate 6 lenses → 5: merge 'philosophy' into 'culture' (now "Culture/Ideology"),
-- drop 'commemoration', add 'business' (Business/Finance).
-- New canonical set: health, politics, culture, entertainment, business

-- Drop legacy lens CHECK constraints *before* data updates. The initial schema only
-- allowed ('health','philosophy','politics'); assigning 'culture' would violate that
-- CHECK if we UPDATE first.
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_lens_check;
ALTER TABLE public.dispatches DROP CONSTRAINT IF EXISTS dispatches_lens_check;
ALTER TABLE public.handbooks DROP CONSTRAINT IF EXISTS handbooks_lens_check;

-- Migrate existing 'philosophy' rows to 'culture'
UPDATE public.articles    SET lens = 'culture' WHERE lens = 'philosophy';
UPDATE public.dispatches  SET lens = 'culture' WHERE lens = 'philosophy';
UPDATE public.handbooks   SET lens = 'culture' WHERE lens = 'philosophy';

-- Migrate any 'commemoration' rows to 'culture' (closest match)
UPDATE public.articles    SET lens = 'culture' WHERE lens = 'commemoration';
UPDATE public.dispatches  SET lens = 'culture' WHERE lens = 'commemoration';
UPDATE public.handbooks   SET lens = 'culture' WHERE lens = 'commemoration';

-- Replace CHECK constraints with the new 5-lens set
ALTER TABLE public.articles ADD CONSTRAINT articles_lens_check
  CHECK (lens IN ('health', 'politics', 'culture', 'entertainment', 'business'));

ALTER TABLE public.dispatches ADD CONSTRAINT dispatches_lens_check
  CHECK (lens IN ('health', 'politics', 'culture', 'entertainment', 'business'));

ALTER TABLE public.handbooks ADD CONSTRAINT handbooks_lens_check
  CHECK (lens IN ('health', 'politics', 'culture', 'entertainment', 'business'));
