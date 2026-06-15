-- payments: only touched by service role in app (PayFast IPN → supabaseAdmin).
-- Enabling RLS blocks anon/authenticated via PostgREST; service_role still bypasses RLS.

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Explicit service_role policy: documents that only backend (service key) may access
-- payments, and clears Security Advisor "RLS Enabled No Policy" (Info) for this table.
-- PostgREST still bypasses RLS for the service role; this policy is mainly for clarity + linter.
DROP POLICY IF EXISTS "payments_service_role_all" ON public.payments;
CREATE POLICY "payments_service_role_all"
  ON public.payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Do not add anon/authenticated policies unless you have a controlled use case (never expose
-- all payment rows to the public anon key).
