-- Ecommerce Purchase Pipeline – Schema migration
-- Run this after orders/order_items exist. Adds: payments, order/invoice/stock columns, invoice sequence.

-- =============================================================================
-- 1. Payments table (idempotency for PayFast ITN; reject duplicate m_payment_id)
-- =============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  payment_gateway TEXT NOT NULL DEFAULT 'payfast',
  external_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(external_id)
);

-- Allow multiple payments per order (e.g. retries) but one successful per external_id
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_id);

-- FK to orders (only if orders table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payments_order_id_fkey') THEN
      ALTER TABLE payments ADD CONSTRAINT payments_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- =============================================================================
-- 2. Orders: add order_number, invoice_id, invoice_email_sent, stock_deducted
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number') THEN
      ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'invoice_id') THEN
      ALTER TABLE orders ADD COLUMN invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'invoice_email_sent') THEN
      ALTER TABLE orders ADD COLUMN invoice_email_sent BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'stock_deducted') THEN
      ALTER TABLE orders ADD COLUMN stock_deducted BOOLEAN DEFAULT FALSE;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_orders_invoice_id ON orders(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
  END IF;
END $$;

-- =============================================================================
-- 3. Invoices: add order_id to link auto-generated invoices to orders
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'order_id') THEN
      ALTER TABLE invoices ADD COLUMN order_id UUID;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'invoices_order_id_fkey') THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_order_id_fkey
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
      END IF;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
  END IF;
END $$;

-- =============================================================================
-- 4. stock_updates: add order_id for e-commerce order-driven deductions
-- =============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_updates') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'stock_updates' AND column_name = 'order_id') THEN
      ALTER TABLE stock_updates ADD COLUMN order_id UUID;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'stock_updates_order_id_fkey') THEN
        ALTER TABLE stock_updates ADD CONSTRAINT stock_updates_order_id_fkey
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
      END IF;
    END IF;
    CREATE INDEX IF NOT EXISTS idx_stock_updates_order_id ON stock_updates(order_id);
  END IF;
END $$;

-- =============================================================================
-- 5. Invoice number: sequence for atomic INV-000001 style numbers
-- =============================================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Function for atomic invoice number generation (call via supabase.rpc('get_next_invoice_number'))
CREATE OR REPLACE FUNCTION get_next_invoice_number()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'INV-' || LPAD(nextval('invoice_number_seq')::text, 6, '0');
$$;

-- Optional: backfill order_number for existing orders (uncomment if needed)
-- UPDATE orders SET order_number = 'ORD-' || UPPER(SUBSTRING(id::text, 1, 8)) WHERE order_number IS NULL;
