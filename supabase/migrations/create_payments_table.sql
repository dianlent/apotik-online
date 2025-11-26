-- Migration: Create payments table for payment gateway transactions

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL,
  reference text UNIQUE,
  amount numeric NOT NULL,
  payment_method text,
  status text NOT NULL,
  paid_at timestamp with time zone,
  callback_data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Payments are viewable by authenticated users." ON public.payments;
DROP POLICY IF EXISTS "Only staff can insert payments." ON public.payments;

-- Create policies for payments
-- Authenticated users can read payments
CREATE POLICY "Payments are viewable by authenticated users."
  ON payments FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- Only staff can insert payments (via webhook or POS)
CREATE POLICY "Only staff can insert payments."
  ON payments FOR INSERT
  WITH CHECK ( 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'kasir')
    )
    OR auth.role() = 'service_role' -- Allow service role for webhooks
  );

-- Add comment
COMMENT ON TABLE public.payments IS 'Payment transactions from payment gateway (Pakasir)';
