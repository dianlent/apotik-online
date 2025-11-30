-- Add vendor role and purchase orders system

-- Update profiles role check to include vendor
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'kasir', 'apoteker', 'customer', 'vendor'));

-- Add vendor_id to profiles for linking vendor users to vendor companies
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_vendor_id ON profiles(vendor_id);

-- Create purchase_orders table for tracking orders from vendors
CREATE TABLE IF NOT EXISTS purchase_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number text UNIQUE NOT NULL,
    vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    order_date timestamptz DEFAULT now(),
    expected_delivery_date timestamptz,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
    subtotal numeric(15,2) DEFAULT 0,
    tax numeric(15,2) DEFAULT 0,
    shipping_cost numeric(15,2) DEFAULT 0,
    total numeric(15,2) DEFAULT 0,
    notes text,
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(15,2) NOT NULL CHECK (unit_price >= 0),
    subtotal numeric(15,2) NOT NULL CHECK (subtotal >= 0),
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for purchase orders
CREATE INDEX IF NOT EXISTS idx_po_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_order_date ON purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_po_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product_id ON purchase_order_items(product_id);

-- Create sequence for PO number
CREATE SEQUENCE IF NOT EXISTS po_number_seq START 1;

-- Trigger to auto-generate PO number
CREATE OR REPLACE FUNCTION set_po_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        NEW.po_number := 'PO' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || LPAD(nextval('po_number_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_orders_set_number
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_po_number();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_po_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_po_updated_at();

-- Enable RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_orders

-- Admins can do everything
CREATE POLICY "Admins can manage purchase orders"
ON purchase_orders FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Vendors can view their own purchase orders
CREATE POLICY "Vendors can view own purchase orders"
ON purchase_orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_id = purchase_orders.vendor_id
    )
);

-- Kasir and Apoteker can view all purchase orders
CREATE POLICY "Staff can view purchase orders"
ON purchase_orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('kasir', 'apoteker')
    )
);

-- RLS Policies for purchase_order_items

-- Admins can do everything
CREATE POLICY "Admins can manage purchase order items"
ON purchase_order_items FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Vendors can view items from their purchase orders
CREATE POLICY "Vendors can view own purchase order items"
ON purchase_order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles p
        JOIN purchase_orders po ON po.vendor_id = p.vendor_id
        WHERE p.id = auth.uid()
        AND p.role = 'vendor'
        AND po.id = purchase_order_items.purchase_order_id
    )
);

-- Staff can view all items
CREATE POLICY "Staff can view purchase order items"
ON purchase_order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('kasir', 'apoteker')
    )
);

-- Update vendors RLS to allow vendors to view their own company
CREATE POLICY "Vendors can view own vendor info"
ON vendors FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'vendor'
        AND profiles.vendor_id = vendors.id
    )
);

-- Comments
COMMENT ON TABLE purchase_orders IS 'Purchase orders from vendors';
COMMENT ON COLUMN purchase_orders.po_number IS 'Purchase order number (auto-generated: PO202411-0001)';
COMMENT ON COLUMN purchase_orders.status IS 'Order status: pending, confirmed, shipped, delivered, cancelled';
COMMENT ON TABLE purchase_order_items IS 'Line items for purchase orders';
COMMENT ON COLUMN profiles.vendor_id IS 'Link vendor users to their vendor company';
