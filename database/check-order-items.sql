-- =====================================================
-- Check Order Items Data
-- Script untuk verifikasi data order_items
-- =====================================================

-- 1. Cek total orders dan order_items
SELECT 
    'Total Orders' as metric,
    COUNT(*) as count
FROM orders
UNION ALL
SELECT 
    'Total Order Items' as metric,
    COUNT(*) as count
FROM order_items;

-- 2. Cek orders yang tidak punya order_items
SELECT 
    o.id as order_id,
    o.order_number,
    o.created_at,
    o.status,
    o.total,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.created_at, o.status, o.total
HAVING COUNT(oi.id) = 0
ORDER BY o.created_at DESC;

-- 3. Cek struktur kolom order_items
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- 4. Sample data order dengan items
SELECT 
    o.id as order_id,
    o.order_number,
    o.created_at,
    o.status,
    o.total,
    oi.id as item_id,
    oi.product_name,
    oi.quantity,
    oi.price,
    oi.subtotal
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.created_at DESC
LIMIT 20;

-- 5. Statistik order_items per order
WITH order_stats AS (
    SELECT 
        order_id,
        COUNT(*) as items_per_order
    FROM order_items
    GROUP BY order_id
)
SELECT 
    COUNT(DISTINCT o.id) as total_orders,
    SUM(COALESCE(os.items_per_order, 0)) as total_items,
    ROUND(AVG(os.items_per_order), 2) as avg_items_per_order,
    MAX(os.items_per_order) as max_items_per_order,
    MIN(os.items_per_order) as min_items_per_order
FROM orders o
LEFT JOIN order_stats os ON o.id = os.order_id;

-- 6. Cek RLS policies untuk order_items
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

-- 7. Test query seperti yang digunakan frontend
-- (Ganti USER_ID dengan ID user yang sebenarnya)
-- SELECT 
--     o.*,
--     json_agg(
--         json_build_object(
--             'id', oi.id,
--             'product_name', oi.product_name,
--             'quantity', oi.quantity,
--             'price', oi.price,
--             'subtotal', oi.subtotal
--         )
--     ) FILTER (WHERE oi.id IS NOT NULL) as order_items
-- FROM orders o
-- LEFT JOIN order_items oi ON o.id = oi.order_id
-- WHERE o.user_id = 'USER_ID_HERE'
-- GROUP BY o.id
-- ORDER BY o.created_at DESC;
