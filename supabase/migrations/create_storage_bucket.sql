-- Migration: Create storage bucket for product images

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Allow admins to update
CREATE POLICY "Admins can update"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Allow admins to delete
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
