-- =====================================================
-- FIX: Order Items RLS Policy dan Data
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- 1. Cek apakah ada data di order_items
SELECT 
    'Total order_items' as info,
    COUNT(*) as count 
FROM order_items;

-- 2. Cek order_items dengan detail order
SELECT 
    o.id as order_id,
    o.order_number,
    o.user_id,
    o.total,
    o.status,
    o.created_at,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.user_id, o.total, o.status, o.created_at
ORDER BY o.created_at DESC
LIMIT 10;

-- 3. Cek RLS policies untuk order_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'order_items';

-- 4. PERBAIKAN: Hapus RLS policies lama dan buat yang baru
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Allow read order_items" ON order_items;
DROP POLICY IF EXISTS "Allow insert order_items" ON order_items;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;

-- 5. Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. Buat policy baru yang lebih permissive
-- Policy untuk SELECT: User bisa lihat order items dari order miliknya
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Policy untuk INSERT: User bisa insert order items ke order miliknya
CREATE POLICY "Users can insert own order items"
ON order_items FOR INSERT
WITH CHECK (
    order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
    )
);

-- Policy untuk admin/kasir: Bisa akses semua order items
CREATE POLICY "Staff can view all order items"
ON order_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'kasir')
    )
);

CREATE POLICY "Staff can manage all order items"
ON order_items FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'kasir')
    )
);

-- 7. Verifikasi policies baru
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'order_items';

-- 8. Test query - ambil order dengan items
SELECT 
    o.id,
    o.order_number,
    o.total,
    o.status,
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.order_number, o.total, o.status
ORDER BY o.created_at DESC
LIMIT 5;

-- =====================================================
-- JIKA MASIH TIDAK MUNCUL, COBA OPSI ALTERNATIF:
-- Disable RLS sementara untuk testing
-- =====================================================

-- UNCOMMENT baris di bawah jika ingin disable RLS sementara
-- ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- ATAU: Buat policy yang sangat permissive untuk testing
-- =====================================================

-- DROP POLICY IF EXISTS "Allow all for testing" ON order_items;
-- CREATE POLICY "Allow all for testing"
-- ON order_items FOR ALL
-- USING (true)
-- WITH CHECK (true);
