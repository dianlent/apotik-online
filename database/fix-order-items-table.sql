-- =====================================================
-- Fix: Recreate order_items table dengan struktur yang benar
-- OPSI 1: Jika tidak ada data penting (RECOMMENDED untuk development)
-- =====================================================

-- Drop existing table (HATI-HATI: ini akan menghapus semua data!)
DROP TABLE IF EXISTS order_items CASCADE;

-- Recreate table dengan struktur yang benar
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'kasir'))
);

DROP POLICY IF EXISTS "Admin can manage order items" ON order_items;
CREATE POLICY "Admin can manage order items" ON order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'kasir'))
);

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Table order_items has been recreated successfully!';
    RAISE NOTICE 'You can now insert order items with product_name, quantity, price, and subtotal.';
END $$;
