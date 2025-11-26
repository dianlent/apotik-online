-- Migration: Add payment fields to orders table

-- Add payment-related columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_reference text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Create index on payment_reference
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);

-- Add comment
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used: cash, card, qris, transfer';
COMMENT ON COLUMN public.orders.payment_reference IS 'Payment gateway reference/transaction ID';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: pending, success, failed';
