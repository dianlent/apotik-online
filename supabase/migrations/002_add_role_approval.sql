-- Add role approval system
-- This migration adds fields for role change requests and approval workflow

-- Add columns to profiles table for role approval
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS requested_role text,
ADD COLUMN IF NOT EXISTS role_request_status text DEFAULT 'none' CHECK (role_request_status IN ('none', 'pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS role_request_date timestamptz,
ADD COLUMN IF NOT EXISTS role_approved_by uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS role_approved_date timestamptz,
ADD COLUMN IF NOT EXISTS role_request_notes text;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_request_status ON profiles(role_request_status);
CREATE INDEX IF NOT EXISTS idx_profiles_requested_role ON profiles(requested_role);

-- Create role_requests table for history
CREATE TABLE IF NOT EXISTS role_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    requested_role text NOT NULL,
    current_role text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes text,
    approved_by uuid REFERENCES profiles(id),
    approved_date timestamptz,
    rejection_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create index for role_requests
CREATE INDEX IF NOT EXISTS idx_role_requests_user_id ON role_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_role_requests_status ON role_requests(status);
CREATE INDEX IF NOT EXISTS idx_role_requests_created_at ON role_requests(created_at DESC);

-- Enable RLS on role_requests
ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_requests

-- Users can view their own requests
CREATE POLICY "Users can view own role requests"
ON role_requests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create role requests"
ON role_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all role requests"
ON role_requests FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Admins can update requests (approve/reject)
CREATE POLICY "Admins can update role requests"
ON role_requests FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_role_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for role_requests updated_at
DROP TRIGGER IF EXISTS role_requests_updated_at ON role_requests;
CREATE TRIGGER role_requests_updated_at
    BEFORE UPDATE ON role_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_role_request_updated_at();

-- Function to handle role approval
CREATE OR REPLACE FUNCTION approve_role_request(
    request_id uuid,
    admin_id uuid
)
RETURNS json AS $$
DECLARE
    request_record role_requests;
    result json;
BEGIN
    -- Get the request
    SELECT * INTO request_record
    FROM role_requests
    WHERE id = request_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Check if already processed
    IF request_record.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed');
    END IF;

    -- Update role_requests
    UPDATE role_requests
    SET 
        status = 'approved',
        approved_by = admin_id,
        approved_date = now()
    WHERE id = request_id;

    -- Update user profile
    UPDATE profiles
    SET 
        role = request_record.requested_role,
        requested_role = NULL,
        role_request_status = 'approved',
        role_approved_by = admin_id,
        role_approved_date = now()
    WHERE id = request_record.user_id;

    RETURN json_build_object('success', true, 'message', 'Role approved successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject role request
CREATE OR REPLACE FUNCTION reject_role_request(
    request_id uuid,
    admin_id uuid,
    reason text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    request_record role_requests;
BEGIN
    -- Get the request
    SELECT * INTO request_record
    FROM role_requests
    WHERE id = request_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Check if already processed
    IF request_record.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Request already processed');
    END IF;

    -- Update role_requests
    UPDATE role_requests
    SET 
        status = 'rejected',
        approved_by = admin_id,
        approved_date = now(),
        rejection_reason = reason
    WHERE id = request_id;

    -- Update user profile
    UPDATE profiles
    SET 
        requested_role = NULL,
        role_request_status = 'rejected',
        role_request_notes = reason
    WHERE id = request_record.user_id;

    RETURN json_build_object('success', true, 'message', 'Role request rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on tables and columns
COMMENT ON COLUMN profiles.requested_role IS 'Role that user has requested (kasir, apoteker)';
COMMENT ON COLUMN profiles.role_request_status IS 'Status of role request: none, pending, approved, rejected';
COMMENT ON COLUMN profiles.role_request_date IS 'Date when role was requested';
COMMENT ON COLUMN profiles.role_approved_by IS 'Admin who approved the role change';
COMMENT ON COLUMN profiles.role_approved_date IS 'Date when role was approved';

COMMENT ON TABLE role_requests IS 'History of all role change requests';
COMMENT ON FUNCTION approve_role_request IS 'Approve a role change request and update user profile';
COMMENT ON FUNCTION reject_role_request IS 'Reject a role change request with optional reason';
