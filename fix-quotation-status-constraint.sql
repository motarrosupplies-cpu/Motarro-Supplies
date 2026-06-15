-- Fix quotation status constraint to allow CONVERTED status
-- This migration updates the existing quotations table constraint

-- First, drop the existing constraint
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_check;

-- Add the new constraint that includes CONVERTED status
ALTER TABLE quotations ADD CONSTRAINT quotations_status_check 
CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'));

-- Verify the constraint was added successfully
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'quotations'::regclass 
AND conname = 'quotations_status_check';
