-- Fix the school_event_orders status constraint
-- Drop the existing constraint
ALTER TABLE school_event_orders DROP CONSTRAINT IF EXISTS school_event_orders_status_check;

-- Add the correct constraint with the proper status values
ALTER TABLE school_event_orders 
ADD CONSTRAINT school_event_orders_status_check 
CHECK (status IN ('PENDING', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'));

-- Also fix the payment status constraint if it exists
ALTER TABLE school_event_orders DROP CONSTRAINT IF EXISTS school_event_orders_payment_status_check;

ALTER TABLE school_event_orders 
ADD CONSTRAINT school_event_orders_payment_status_check 
CHECK (paymentStatus IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED'));
