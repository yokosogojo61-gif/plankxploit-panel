-- Add activity tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_active timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;

-- Create transactions table for payments
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('premium', 'vip')),
  amount integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('dana', 'gopay', 'qris')),
  proof_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  telegram_notified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending transactions
CREATE POLICY "Users can update own pending transactions" ON public.transactions
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR SELECT USING (is_admin(auth.uid()));

-- Admins can update all transactions
CREATE POLICY "Admins can update all transactions" ON public.transactions
FOR UPDATE USING (is_admin(auth.uid()));

-- Create broadcast notifications table
CREATE TABLE public.broadcast_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- Everyone can view active broadcasts
CREATE POLICY "Everyone can view active broadcasts" ON public.broadcast_notifications
FOR SELECT USING (is_active = true);

-- VIP/Admin can create broadcasts
CREATE POLICY "VIP and Admin can create broadcasts" ON public.broadcast_notifications
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'vip' OR is_admin = true)
  )
);

-- VIP/Admin can update their own broadcasts
CREATE POLICY "VIP and Admin can update own broadcasts" ON public.broadcast_notifications
FOR UPDATE USING (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'vip' OR is_admin = true)
  )
);

-- Create index for better performance
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active DESC);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_broadcast_active ON public.broadcast_notifications(is_active);