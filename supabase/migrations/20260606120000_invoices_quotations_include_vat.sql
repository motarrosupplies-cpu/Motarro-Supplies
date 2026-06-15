-- Toggle VAT on invoices and quotations (default off for non-VAT-registered businesses)
ALTER TABLE IF EXISTS public.invoices
  ADD COLUMN IF NOT EXISTS include_vat BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS public.quotations
  ADD COLUMN IF NOT EXISTS include_vat BOOLEAN NOT NULL DEFAULT false;

-- Preserve VAT breakdown on existing documents that already had tax applied
UPDATE public.invoices
SET include_vat = true
WHERE tax_amount > 0;

UPDATE public.quotations
SET include_vat = true
WHERE tax_amount > 0;
