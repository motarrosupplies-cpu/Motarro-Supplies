-- Draft email campaigns (image + body) for future Gmail sends. Additive only.

CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled campaign',
  image_url text,
  email_body text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_campaigns_status_check CHECK (
    status IN ('draft', 'ready', 'sent', 'archived')
  )
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at
  ON public.email_campaigns (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status
  ON public.email_campaigns (status);

ALTER TABLE public.email_campaigns DISABLE ROW LEVEL SECURITY;

-- Server-side admin routes use service_role only; do not expose to anon.
GRANT ALL ON public.email_campaigns TO postgres;
GRANT ALL ON public.email_campaigns TO service_role;

COMMENT ON TABLE public.email_campaigns IS 'Scaffold for admin-built marketing emails (Gmail send not wired yet).';
