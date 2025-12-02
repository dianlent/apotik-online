-- =====================================================
-- Add order_number column to orders table
-- Format: ORD-YYYYMMDD-XXX (e.g., ORD-20241202-001)
-- =====================================================

-- Step 1: Add order_number column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) UNIQUE;

-- Step 2: Create sequence for order numbers (daily reset)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Step 3: Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    today_date VARCHAR(8);
    seq_num INTEGER;
    order_num VARCHAR(20);
    max_today INTEGER;
BEGIN
    -- Get today's date in YYYYMMDD format
    today_date := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Get the maximum order number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 14 FOR 3) AS INTEGER)), 0)
    INTO max_today
    FROM orders
    WHERE order_number LIKE 'ORD-' || today_date || '-%';
    
    -- Increment for next order
    seq_num := max_today + 1;
    
    -- Format: ORD-YYYYMMDD-XXX
    order_num := 'ORD-' || today_date || '-' || LPAD(seq_num::TEXT, 3, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-generate order_number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_order_number ON orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Step 5: Update existing orders with order numbers
DO $$
DECLARE
    order_record RECORD;
    order_date VARCHAR(8);
    daily_counter INTEGER;
    new_order_number VARCHAR(20);
BEGIN
    -- Initialize counter per date
    FOR order_record IN 
        SELECT id, created_at 
        FROM orders 
        WHERE order_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Get date for this order
        order_date := TO_CHAR(order_record.created_at, 'YYYYMMDD');
        
        -- Get counter for this date
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 14 FOR 3) AS INTEGER)), 0) + 1
        INTO daily_counter
        FROM orders
        WHERE order_number LIKE 'ORD-' || order_date || '-%';
        
        -- Generate order number
        new_order_number := 'ORD-' || order_date || '-' || LPAD(daily_counter::TEXT, 3, '0');
        
        -- Update the order
        UPDATE orders 
        SET order_number = new_order_number 
        WHERE id = order_record.id;
    END LOOP;
END $$;

-- Step 6: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Step 7: Add comment
COMMENT ON COLUMN orders.order_number IS 'Human-readable order number in format ORD-YYYYMMDD-XXX';

-- Verification query
SELECT 
    id,
    order_number,
    created_at,
    status,
    total
FROM orders
ORDER BY created_at DESC
LIMIT 10;
