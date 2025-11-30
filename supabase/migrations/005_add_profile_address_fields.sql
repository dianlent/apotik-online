-- Add address fields to profiles table for member shipping information

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS postal_code text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notes text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_postal_code ON profiles(postal_code);

-- Comments
COMMENT ON COLUMN profiles.phone IS 'Member phone number for contact';
COMMENT ON COLUMN profiles.address IS 'Full shipping address';
COMMENT ON COLUMN profiles.city IS 'City/Kabupaten for shipping';
COMMENT ON COLUMN profiles.province IS 'Province for shipping';
COMMENT ON COLUMN profiles.postal_code IS 'Postal code for shipping';
COMMENT ON COLUMN profiles.notes IS 'Additional notes for delivery (optional)';
