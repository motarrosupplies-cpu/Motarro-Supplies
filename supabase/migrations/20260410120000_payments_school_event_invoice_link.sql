-- PayFast ITN idempotency for school event orders + link invoices to school orders.
-- Run on Supabase (Dashboard SQL or CLI). Safe to re-run: uses IF NOT EXISTS / guarded DO blocks.

-- 1) payments: allow either a shop order OR a school event order (never both)
ALTER TABLE public.payments ALTER COLUMN order_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'school_event_order_id'
  ) THEN
    ALTER TABLE public.payments
      ADD COLUMN school_event_order_id text REFERENCES public.school_event_orders(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_shop_or_school_event_one'
  ) THEN
    ALTER TABLE public.payments ADD CONSTRAINT payments_shop_or_school_event_one CHECK (
      (order_id IS NOT NULL AND school_event_order_id IS NULL)
      OR (order_id IS NULL AND school_event_order_id IS NOT NULL)
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_payments_school_event_order_id
  ON public.payments (school_event_order_id);

-- 2) school_event_orders: optional invoice tracking (camelCase columns match Prisma / app)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'school_event_orders' AND column_name = 'invoiceId'
  ) THEN
    ALTER TABLE public.school_event_orders
      ADD COLUMN "invoiceId" uuid REFERENCES public.invoices(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'school_event_orders' AND column_name = 'invoiceEmailSent'
  ) THEN
    ALTER TABLE public.school_event_orders
      ADD COLUMN "invoiceEmailSent" boolean NOT NULL DEFAULT false;
  END IF;
END $$;
