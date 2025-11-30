-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code text UNIQUE NOT NULL,
    vendor_name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    address text,
    city text,
    postal_code text,
    country text DEFAULT 'Indonesia',
    tax_id text,
    payment_terms text,
    credit_limit numeric(15,2) DEFAULT 0,
    notes text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_by uuid REFERENCES profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendors_vendor_code ON vendors(vendor_code);
CREATE INDEX IF NOT EXISTS idx_vendors_vendor_name ON vendors(vendor_name);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);

-- Create sequence for vendor code
CREATE SEQUENCE IF NOT EXISTS vendors_code_seq START 1;

-- Trigger to auto-generate vendor code if not provided
CREATE OR REPLACE FUNCTION set_vendor_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if vendor_code is NULL or empty
    IF NEW.vendor_code IS NULL OR NEW.vendor_code = '' THEN
        -- Generate code using sequence: VND + 6 digits padded
        NEW.vendor_code := 'VND' || LPAD(nextval('vendors_code_seq')::text, 6, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_set_code
    BEFORE INSERT ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION set_vendor_code();

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can do everything
CREATE POLICY "Admins can manage vendors"
ON vendors FOR ALL
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

-- Kasir and Apoteker can view vendors
CREATE POLICY "Staff can view vendors"
ON vendors FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('kasir', 'apoteker', 'admin')
    )
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_vendors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendors_updated_at();

-- Comments
COMMENT ON TABLE vendors IS 'Vendor/Supplier information for pharmacy products';
COMMENT ON COLUMN vendors.vendor_code IS 'Unique vendor code (auto-generated if not provided)';
COMMENT ON COLUMN vendors.status IS 'Vendor status: active, inactive, suspended';
COMMENT ON COLUMN vendors.credit_limit IS 'Maximum credit limit for this vendor';
COMMENT ON COLUMN vendors.payment_terms IS 'Payment terms (e.g., Net 30, COD)';
