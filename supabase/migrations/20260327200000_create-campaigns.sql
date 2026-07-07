CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL DEFAULT '',
  audience_filter jsonb NOT NULL DEFAULT '{}',
  recipient_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX campaigns_status_idx ON public.campaigns (status);
CREATE INDEX campaigns_updated_at_idx ON public.campaigns (updated_at DESC);
