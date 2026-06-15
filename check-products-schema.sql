-- Check the actual column names in the products table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check a sample product to see the actual data structure
SELECT id, name, category, price, stock_quantity, stock, is_new, on_sale, status
FROM products 
LIMIT 3;
