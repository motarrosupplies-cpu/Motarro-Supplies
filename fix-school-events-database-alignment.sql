-- Database Alignment Script for School Events Orders
-- This script ensures the database schema matches the API routes (snake_case)
-- Run this in Supabase SQL Editor if your database uses camelCase columns

-- =====================================================
-- CHECK CURRENT SCHEMA
-- =====================================================
-- First, run verify-school-events-schema.sql to check your current column names

-- =====================================================
-- MIGRATION: Convert camelCase to snake_case (if needed)
-- =====================================================
-- Only run this if your database currently uses camelCase columns
-- This will rename columns from camelCase to snake_case

-- Rename columns in school_event_orders table (if they exist as camelCase)
DO $$
BEGIN
    -- Rename eventId to event_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'eventId') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "eventId" TO event_id;
    END IF;
    
    -- Rename orderNumber to order_number
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'orderNumber') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "orderNumber" TO order_number;
    END IF;
    
    -- Rename parentName to parent_name
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'parentName') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "parentName" TO parent_name;
    END IF;
    
    -- Rename parentEmail to parent_email
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'parentEmail') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "parentEmail" TO parent_email;
    END IF;
    
    -- Rename parentPhone to parent_phone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'parentPhone') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "parentPhone" TO parent_phone;
    END IF;
    
    -- Rename schoolName to school_name
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'schoolName') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "schoolName" TO school_name;
    END IF;
    
    -- Rename className to class_name
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'className') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "className" TO class_name;
    END IF;
    
    -- Rename totalAmount to total_amount
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'totalAmount') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "totalAmount" TO total_amount;
    END IF;
    
    -- Rename paymentStatus to payment_status
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'paymentStatus') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "paymentStatus" TO payment_status;
    END IF;
    
    -- Rename paymentMethod to payment_method
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'paymentMethod') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "paymentMethod" TO payment_method;
    END IF;
    
    -- Rename createdAt to created_at
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'createdAt') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "createdAt" TO created_at;
    END IF;
    
    -- Rename updatedAt to updated_at
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_orders' AND column_name = 'updatedAt') THEN
        ALTER TABLE school_event_orders RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

-- Rename columns in school_event_order_items table (if they exist as camelCase)
DO $$
BEGIN
    -- Rename orderId to order_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'orderId') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "orderId" TO order_id;
    END IF;
    
    -- Rename productId to product_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'productId') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "productId" TO product_id;
    END IF;
    
    -- Rename variantId to variant_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'variantId') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "variantId" TO variant_id;
    END IF;
    
    -- Rename childName to child_name
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'childName') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "childName" TO child_name;
    END IF;
    
    -- Rename childAge to child_age
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'childAge') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "childAge" TO child_age;
    END IF;
    
    -- Rename unitPrice to unit_price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'unitPrice') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "unitPrice" TO unit_price;
    END IF;
    
    -- Rename totalPrice to total_price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'totalPrice') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "totalPrice" TO total_price;
    END IF;
    
    -- Rename specialInstructions to special_instructions
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'specialInstructions') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "specialInstructions" TO special_instructions;
    END IF;
    
    -- Rename createdAt to created_at
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'createdAt') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "createdAt" TO created_at;
    END IF;
    
    -- Rename updatedAt to updated_at
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_items' AND column_name = 'updatedAt') THEN
        ALTER TABLE school_event_order_items RENAME COLUMN "updatedAt" TO updated_at;
    END IF;
END $$;

-- Rename columns in school_event_order_item_addons table (if they exist as camelCase)
DO $$
BEGIN
    -- Rename orderItemId to order_item_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_item_addons' AND column_name = 'orderItemId') THEN
        ALTER TABLE school_event_order_item_addons RENAME COLUMN "orderItemId" TO order_item_id;
    END IF;
    
    -- Rename additionalItemId to additional_item_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_item_addons' AND column_name = 'additionalItemId') THEN
        ALTER TABLE school_event_order_item_addons RENAME COLUMN "additionalItemId" TO additional_item_id;
    END IF;
    
    -- Rename selectedOptionId to selected_option_id
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_item_addons' AND column_name = 'selectedOptionId') THEN
        ALTER TABLE school_event_order_item_addons RENAME COLUMN "selectedOptionId" TO selected_option_id;
    END IF;
    
    -- Rename unitPrice to unit_price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_item_addons' AND column_name = 'unitPrice') THEN
        ALTER TABLE school_event_order_item_addons RENAME COLUMN "unitPrice" TO unit_price;
    END IF;
    
    -- Rename totalPrice to total_price
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'school_event_order_item_addons' AND column_name = 'totalPrice') THEN
        ALTER TABLE school_event_order_item_addons RENAME COLUMN "totalPrice" TO total_price;
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- After running the migration, verify the changes:
SELECT 
    'school_event_orders' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'school_event_orders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'school_event_order_items' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'school_event_order_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- NOTES
-- =====================================================
-- This script is idempotent - it checks if columns exist before renaming
-- If your database already uses snake_case, this script will do nothing
-- Always backup your database before running migration scripts

