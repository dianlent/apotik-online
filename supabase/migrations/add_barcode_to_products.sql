-- Migration: Add barcode column to products table
-- This migration adds a barcode field to the products table for barcode scanning functionality

-- Add barcode column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS barcode text;

-- Add unique constraint to barcode (optional, but recommended)
ALTER TABLE public.products 
ADD CONSTRAINT products_barcode_unique UNIQUE (barcode);

-- Create index on barcode for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- Add comment to explain the column
COMMENT ON COLUMN public.products.barcode IS 'Product barcode for POS scanning (e.g., EAN-13, UPC)';
