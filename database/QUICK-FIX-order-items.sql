-- =====================================================
-- QUICK FIX: Recreate order_items table
-- Copy-paste script ini ke Supabase SQL Editor dan Run!
-- =====================================================

-- Step 1: Drop table lama
DROP TABLE IF EXISTS order_items CASCADE;

-- Step 2: Buat table dengan struktur yang benar
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

-- Step 3: Buat indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Step 4: Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Step 5: Buat RLS Policies
CREATE POLICY "Users can view own order items" 
ON order_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    ) 
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'kasir')
    )
);

CREATE POLICY "Admin can manage order items" 
ON order_items FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'kasir')
    )
);

-- ✅ SELESAI! Refresh halaman /member/transactions
SELECT 'Order items table berhasil dibuat! 🎉' as status;
