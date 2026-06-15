-- Scheduling, allow/block patterns, follow-up parent link, and recipient snapshots.

-- Migrate legacy status before replacing constraint
UPDATE public.email_campaigns SET status = 'draft' WHERE status = 'ready';

ALTER TABLE public.email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_status_check;

ALTER TABLE public.email_campaigns
  ADD COLUMN IF NOT EXISTS allowlist_patterns text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS blocklist_patterns text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS parent_campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE SET NULL;

ALTER TABLE public.email_campaigns ADD CONSTRAINT email_campaigns_status_check CHECK (
  status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled', 'archived')
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at
  ON public.email_campaigns (scheduled_at)
  WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_email_campaigns_parent
  ON public.email_campaigns (parent_campaign_id)
  WHERE parent_campaign_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.email_campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign
  ON public.email_campaign_recipients (campaign_id);

ALTER TABLE public.email_campaign_recipients DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.email_campaign_recipients TO postgres;
GRANT ALL ON public.email_campaign_recipients TO service_role;

COMMENT ON COLUMN public.email_campaigns.scheduled_at IS 'When status=scheduled, Gmail/cron sender dispatches at or after this time (UTC).';
COMMENT ON COLUMN public.email_campaigns.parent_campaign_id IS 'Follow-up: audience is parent stored recipients, then allow/block applied.';
COMMENT ON TABLE public.email_campaign_recipients IS 'Filled when a campaign is sent; follow-ups read parent list from here.';
