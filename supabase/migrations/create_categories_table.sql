-- Migration: Create categories table

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Categories are viewable by everyone." ON public.categories;
DROP POLICY IF EXISTS "Only admins can insert categories." ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories." ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories." ON public.categories;

-- Create policies for categories
-- Anyone can read categories
CREATE POLICY "Categories are viewable by everyone."
  ON categories FOR SELECT
  USING ( true );

-- Only admins can insert categories
CREATE POLICY "Only admins can insert categories."
  ON categories FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update categories
CREATE POLICY "Only admins can update categories."
  ON categories FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete categories
CREATE POLICY "Only admins can delete categories."
  ON categories FOR DELETE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add category_id column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Insert default categories
INSERT INTO public.categories (name, description) 
VALUES 
  ('Obat Umum', 'Obat-obatan yang dapat dibeli tanpa resep dokter'),
  ('Obat Keras', 'Obat-obatan yang memerlukan resep dokter'),
  ('Vitamin & Suplemen', 'Vitamin, mineral, dan suplemen kesehatan'),
  ('Alat Kesehatan', 'Peralatan dan alat bantu kesehatan'),
  ('Perawatan Tubuh', 'Produk perawatan dan kebersihan tubuh')
ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.categories IS 'Product categories for organizing inventory';
