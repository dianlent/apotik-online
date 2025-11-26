-- Migration: Add proper foreign key relationship between orders and profiles
-- This allows Supabase to automatically join orders with profiles

-- First, ensure all existing orders have valid user_ids that exist in profiles
-- (This is a safety check - in production you might want to handle orphaned records differently)

-- Add foreign key constraint from orders.user_id to profiles.id
-- Note: We're using profiles instead of auth.users for better data consistency
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Add comment
COMMENT ON CONSTRAINT orders_user_id_fkey ON public.orders IS 'Foreign key to profiles table for user information';
