-- Atomic rate limiter: single-statement check-and-increment via RPC.
-- Replaces the application-layer TOCTOU pattern (SELECT, check, UPDATE) that
-- could let concurrent requests exceed the configured limit.

-- Table is created here for completeness; real environments already have it
-- (created via Supabase UI before this migration existed).
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  bucket_key    text        NOT NULL,
  token         text        NOT NULL,
  request_count integer     NOT NULL DEFAULT 0,
  reset_at      timestamptz NOT NULL,
  PRIMARY KEY (bucket_key, token)
);

CREATE INDEX IF NOT EXISTS api_rate_limits_reset_at_idx
  ON public.api_rate_limits (reset_at);

-- Service role only; RLS remains enabled everywhere else.
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomic increment with row lock. Serializes concurrent callers on the same
-- (bucket_key, token) tuple and enforces `limit` in a single transaction.
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_bucket_key text,
  p_token      text,
  p_limit      integer,
  p_reset_at   timestamptz
)
RETURNS TABLE (success boolean, remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count         integer;
  v_existing_reset timestamptz;
BEGIN
  -- Lock the existing row (if any) to serialize concurrent callers.
  SELECT request_count, reset_at
    INTO v_count, v_existing_reset
    FROM public.api_rate_limits
   WHERE bucket_key = p_bucket_key
     AND token      = p_token
     FOR UPDATE;

  IF NOT FOUND OR v_existing_reset <= now() THEN
    -- First request in window, or window expired: reset to 1.
    INSERT INTO public.api_rate_limits (bucket_key, token, request_count, reset_at)
    VALUES (p_bucket_key, p_token, 1, p_reset_at)
    ON CONFLICT (bucket_key, token) DO UPDATE
      SET request_count = 1,
          reset_at      = EXCLUDED.reset_at;
    RETURN QUERY SELECT true, GREATEST(p_limit - 1, 0);
  ELSIF v_count >= p_limit THEN
    -- At or above limit: do not increment.
    RETURN QUERY SELECT false, 0;
  ELSE
    UPDATE public.api_rate_limits
       SET request_count = request_count + 1
     WHERE bucket_key = p_bucket_key
       AND token      = p_token;
    RETURN QUERY SELECT true, GREATEST(p_limit - v_count - 1, 0);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_rate_limit(text, text, integer, timestamptz)
  TO service_role;
