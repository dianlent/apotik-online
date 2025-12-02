-- =====================================================
-- Migration: Add missing columns to order_items
-- Untuk memperbaiki error "column product_name does not exist"
-- =====================================================

-- Cek apakah kolom product_name sudah ada, jika belum tambahkan
DO $$ 
BEGIN
    -- Add product_name column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'product_name'
    ) THEN
        ALTER TABLE order_items ADD COLUMN product_name VARCHAR(255);
        RAISE NOTICE 'Column product_name added to order_items';
    END IF;

    -- Add quantity column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE order_items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
        RAISE NOTICE 'Column quantity added to order_items';
    END IF;

    -- Add price column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'price'
    ) THEN
        ALTER TABLE order_items ADD COLUMN price DECIMAL(12, 2);
        RAISE NOTICE 'Column price added to order_items';
    END IF;

    -- Add subtotal column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE order_items ADD COLUMN subtotal DECIMAL(12, 2);
        RAISE NOTICE 'Column subtotal added to order_items';
    END IF;

    -- Update existing data if needed
    -- Set product_name from products table if null
    UPDATE order_items oi
    SET product_name = p.name
    FROM products p
    WHERE oi.product_id = p.id 
    AND oi.product_name IS NULL;

    -- Make product_name NOT NULL after updating
    ALTER TABLE order_items ALTER COLUMN product_name SET NOT NULL;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Show success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'Table order_items structure updated.';
END $$;
