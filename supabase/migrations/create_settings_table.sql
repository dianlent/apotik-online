-- Migration: Create settings table
-- This table stores application settings

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by uuid REFERENCES auth.users(id)
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Settings are viewable by everyone." ON public.settings;
DROP POLICY IF EXISTS "Only admins can update settings." ON public.settings;
DROP POLICY IF EXISTS "Only admins can insert settings." ON public.settings;

-- Create policies for settings
-- Anyone can read settings
CREATE POLICY "Settings are viewable by everyone."
  ON settings FOR SELECT
  USING ( true );

-- Only admins can update settings
CREATE POLICY "Only admins can update settings."
  ON settings FOR UPDATE
  USING ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert settings
CREATE POLICY "Only admins can insert settings."
  ON settings FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default general settings
INSERT INTO public.settings (key, value) 
VALUES (
  'general',
  '{
    "storeName": "APOTIK POS",
    "storeEmail": "info@apotikpos.com",
    "storePhone": "+62 812-3456-7890",
    "storeAddress": "Jl. Kesehatan No. 123, Jakarta",
    "taxRate": "11",
    "currency": "IDR"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.settings IS 'Application settings stored as key-value pairs with JSONB values';
