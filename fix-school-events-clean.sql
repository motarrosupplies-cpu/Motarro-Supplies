-- FIX SCHOOL EVENTS DATABASE SCHEMA
-- This script will clean up and fix the school events system

-- 1. Drop existing tables to start fresh
DROP TABLE IF EXISTS public.school_event_order_item_addons CASCADE;
DROP TABLE IF EXISTS public.school_event_order_items CASCADE;
DROP TABLE IF EXISTS public.school_event_orders CASCADE;
DROP TABLE IF EXISTS public.event_product_variant_addons CASCADE;
DROP TABLE IF EXISTS public.event_product_variants CASCADE;
DROP TABLE IF EXISTS public.event_product_additional_item_options CASCADE;
DROP TABLE IF EXISTS public.event_product_additional_items CASCADE;
DROP TABLE IF EXISTS public.event_products CASCADE;
DROP TABLE IF EXISTS public.school_events CASCADE;

-- 2. Create school_events table with proper naming
CREATE TABLE public.school_events (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  name text NOT NULL,
  description text,
  "startDate" timestamp with time zone NOT NULL,
  "endDate" timestamp with time zone NOT NULL,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT school_events_pkey PRIMARY KEY (id)
);

-- 3. Create event_products table
CREATE TABLE public.event_products (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "eventId" text NOT NULL,
  name text NOT NULL,
  description text,
  "basePrice" numeric NOT NULL,
  "imageUrl" text,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT event_products_pkey PRIMARY KEY (id),
  CONSTRAINT event_products_event_id_fkey FOREIGN KEY ("eventId") REFERENCES public.school_events(id) ON DELETE CASCADE
);

-- 4. Create event_product_variants table
CREATE TABLE public.event_product_variants (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "productId" text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  "additionalPrice" numeric DEFAULT 0,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT event_product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT event_product_variants_product_id_fkey FOREIGN KEY ("productId") REFERENCES public.event_products(id) ON DELETE CASCADE
);

-- 5. Create event_product_additional_items table (for accessories)
CREATE TABLE public.event_product_additional_items (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "productId" text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT event_product_additional_items_pkey PRIMARY KEY (id),
  CONSTRAINT fk_event_product_additional_items_product FOREIGN KEY ("productId") REFERENCES public.event_products(id) ON DELETE CASCADE
);

-- 6. Create event_product_additional_item_options table
CREATE TABLE public.event_product_additional_item_options (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "additionalItemId" text NOT NULL,
  "optionName" text NOT NULL,
  "optionValue" text NOT NULL,
  "priceAdjustment" numeric DEFAULT 0,
  "isActive" boolean DEFAULT true,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT event_product_additional_item_options_pkey PRIMARY KEY (id),
  CONSTRAINT fk_event_product_additional_item_options_item FOREIGN KEY ("additionalItemId") REFERENCES public.event_product_additional_items(id) ON DELETE CASCADE
);

-- 7. Create school_event_orders table
CREATE TABLE public.school_event_orders (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "eventId" text NOT NULL,
  "orderNumber" text NOT NULL UNIQUE,
  "parentName" text NOT NULL,
  "parentEmail" text NOT NULL,
  "parentPhone" text NOT NULL,
  "schoolName" text NOT NULL,
  grade text,
  "className" text,
  "totalAmount" numeric NOT NULL,
  status text DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'CONFIRMED'::text, 'IN_PRODUCTION'::text, 'READY_FOR_PICKUP'::text, 'COMPLETED'::text, 'CANCELLED'::text])),
  "paymentStatus" text DEFAULT 'PENDING'::text CHECK ("paymentStatus" = ANY (ARRAY['PENDING'::text, 'PAID'::text, 'FAILED'::text, 'REFUNDED'::text])),
  "paymentMethod" text,
  notes text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT school_event_orders_pkey PRIMARY KEY (id),
  CONSTRAINT school_event_orders_event_id_fkey FOREIGN KEY ("eventId") REFERENCES public.school_events(id) ON DELETE CASCADE
);

-- 8. Create school_event_order_items table
CREATE TABLE public.school_event_order_items (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "orderId" text NOT NULL,
  "productId" text NOT NULL,
  "variantId" text,
  "childName" text NOT NULL,
  "childAge" integer,
  quantity integer NOT NULL,
  "unitPrice" numeric NOT NULL,
  "totalPrice" numeric NOT NULL,
  "specialInstructions" text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT school_event_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT school_event_order_items_product_id_fkey FOREIGN KEY ("productId") REFERENCES public.event_products(id) ON DELETE CASCADE,
  CONSTRAINT school_event_order_items_order_id_fkey FOREIGN KEY ("orderId") REFERENCES public.school_event_orders(id) ON DELETE CASCADE,
  CONSTRAINT school_event_order_items_variant_id_fkey FOREIGN KEY ("variantId") REFERENCES public.event_product_variants(id) ON DELETE SET NULL
);

-- 9. Create school_event_order_item_addons table (for accessories in orders)
CREATE TABLE public.school_event_order_item_addons (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  "orderItemId" text NOT NULL,
  "additionalItemId" text NOT NULL,
  "selectedOptionId" text,
  quantity integer NOT NULL DEFAULT 1,
  "unitPrice" numeric NOT NULL,
  "totalPrice" numeric NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now(),
  CONSTRAINT school_event_order_item_addons_pkey PRIMARY KEY (id),
  CONSTRAINT school_event_order_item_addons_orderItemId_fkey FOREIGN KEY ("orderItemId") REFERENCES public.school_event_order_items(id) ON DELETE CASCADE,
  CONSTRAINT school_event_order_item_addons_additionalItemId_fkey FOREIGN KEY ("additionalItemId") REFERENCES public.event_product_additional_items(id) ON DELETE CASCADE,
  CONSTRAINT school_event_order_item_addons_selectedOptionId_fkey FOREIGN KEY ("selectedOptionId") REFERENCES public.event_product_additional_item_options(id) ON DELETE SET NULL
);

-- 10. Create indexes for better performance
CREATE INDEX idx_school_events_active ON public.school_events("isActive");
CREATE INDEX idx_event_products_event ON public.event_products("eventId");
CREATE INDEX idx_event_product_variants_product ON public.event_product_variants("productId");
CREATE INDEX idx_school_event_orders_event ON public.school_event_orders("eventId");
CREATE INDEX idx_school_event_order_items_order ON public.school_event_order_items("orderId");

-- 11. Insert sample data for testing
INSERT INTO public.school_events (id, name, description, "startDate", "endDate", "isActive") VALUES
('event-1', 'Soap Box Derby 2024', 'Annual soap box derby competition', '2024-12-15 09:00:00+00', '2024-12-15 17:00:00+00', true),
('event-2', 'Choral Verse Festival', 'School choral verse competition', '2024-11-20 14:00:00+00', '2024-11-20 18:00:00+00', true);

-- 12. Insert sample products
INSERT INTO public.event_products (id, "eventId", name, description, "basePrice", "isActive") VALUES
('prod-1', 'event-1', 'Soap Box Derby T-Shirt', 'Custom T-shirt for participants', 150.00, true),
('prod-2', 'event-1', 'Soap Box Derby Hoodie', 'Custom hoodie for participants', 250.00, true),
('prod-3', 'event-2', 'Choral Verse T-Shirt', 'Performance T-shirt', 120.00, true);

-- 13. Insert sample variants
INSERT INTO public.event_product_variants (id, "productId", size, color, "additionalPrice") VALUES
('var-1', 'prod-1', 'S', 'Red', 0),
('var-2', 'prod-1', 'M', 'Red', 0),
('var-3', 'prod-1', 'L', 'Red', 0),
('var-4', 'prod-1', 'XL', 'Red', 0),
('var-5', 'prod-1', 'S', 'Blue', 10),
('var-6', 'prod-1', 'M', 'Blue', 10),
('var-7', 'prod-1', 'L', 'Blue', 10),
('var-8', 'prod-1', 'XL', 'Blue', 10);

-- 14. Insert sample additional items (accessories)
INSERT INTO public.event_product_additional_items (id, "productId", name, description, price, category) VALUES
('addon-1', 'prod-1', 'Name Embroidery', 'Personalized name on back', 25.00, 'Personalization'),
('addon-2', 'prod-1', 'Event Logo Patch', 'Official event logo patch', 15.00, 'Decoration'),
('addon-3', 'prod-1', 'Premium Fabric', 'Upgrade to premium cotton', 30.00, 'Material');

-- 15. Insert sample additional item options
INSERT INTO public.event_product_additional_item_options (id, "additionalItemId", "optionName", "optionValue", "priceAdjustment") VALUES
('opt-1', 'addon-1', 'Font Style', 'Classic', 0),
('opt-2', 'addon-1', 'Font Style', 'Fancy', 5),
('opt-3', 'addon-2', 'Patch Size', 'Small', 0),
('opt-4', 'addon-2', 'Patch Size', 'Large', 5);

-- 16. Grant permissions (if using RLS)
ALTER TABLE public.school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_product_additional_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_product_additional_item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_event_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_event_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_event_order_item_addons ENABLE ROW LEVEL SECURITY;

-- 17. Create RLS policies for public access to active events
CREATE POLICY "Allow public read access to active school events" ON public.school_events
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Allow public read access to active event products" ON public.event_products
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Allow public read access to active variants" ON public.event_product_variants
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Allow public read access to active additional items" ON public.event_product_additional_items
  FOR SELECT USING ("isActive" = true);

CREATE POLICY "Allow public read access to active options" ON public.event_product_additional_item_options
  FOR SELECT USING ("isActive" = true);

-- 18. Create RLS policies for order creation
CREATE POLICY "Allow public to create orders" ON public.school_event_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to create order items" ON public.school_event_order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to create order addons" ON public.school_event_order_item_addons
  FOR INSERT WITH CHECK (true);

-- 19. Create RLS policies for admin access (you'll need to adjust this based on your auth setup)
CREATE POLICY "Allow admin full access to school events" ON public.school_events
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to event products" ON public.event_products
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to variants" ON public.event_product_variants
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to additional items" ON public.event_product_additional_items
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to options" ON public.event_product_additional_item_options
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to orders" ON public.school_event_orders
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to order items" ON public.school_event_order_items
  FOR ALL USING (true);

CREATE POLICY "Allow admin full access to order addons" ON public.school_event_order_item_addons
  FOR ALL USING (true);

-- Success message
SELECT 'School Events Database Schema Fixed Successfully!' as status;
