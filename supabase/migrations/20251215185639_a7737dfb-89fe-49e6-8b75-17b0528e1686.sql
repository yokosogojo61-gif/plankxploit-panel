-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('member', 'premium', 'vip');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'member',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Security definer function to check admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND is_admin = true
  )
$$;

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (public.is_admin(auth.uid()));

-- Admin can delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Admin can insert profiles
CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, role, is_admin)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data ->> 'role')::user_role, 'member'),
    COALESCE((new.raw_user_meta_data ->> 'is_admin')::boolean, false)
  );
  RETURN new;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  stars INTEGER NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings" 
ON public.ratings FOR SELECT 
TO authenticated
USING (true);

-- Insert sample ratings
INSERT INTO public.ratings (name, message, stars) VALUES
('Ahmad Rizky', 'Mantap banget toolsnya, work semua!', 5),
('Budi Santoso', 'Premium features sangat worth it', 5),
('Dewa Pratama', 'Best panel yang pernah gue pake', 5),
('Eko Wijaya', 'Support nya fast respon, TOP!', 5),
('Fahri Rahman', 'Fitur lengkap, recommended!', 5),
('Gilang Putra', 'Keren parah, semua fitur jalan', 5),
('Hendra Kusuma', 'VIP worth it banget!', 5),
('Irfan Hakim', 'Gokil toolsnya, mantul!', 5),
('Joko Widodo', 'Panel terbaik 2024!', 5),
('Kemal Palevi', 'Auto recommend ke temen-temen', 5),
('Lukman Sardi', 'Fitur spam nya work 100%', 5),
('Maman Suratman', 'Premium paling worth!', 5),
('Naufal Akbar', 'Kualitas tools nya TOP BGT', 5),
('Oscar Lawalata', 'Sangat membantu bisnis gue', 5),
('Putra Mahendra', 'Best investment ever!', 5),
('Qori Rahman', 'Tools nya lengkap semua', 5),
('Reza Rahadian', 'Mantap jiwa, work semua', 5),
('Satria Pratama', 'Gak nyesel upgrade VIP', 5),
('Taufik Hidayat', 'Panel paling lengkap!', 5),
('Umar Syarif', 'Recommended banget guys!', 5),
('Vino Bastian', 'Fitur nya gila sih ini', 5),
('Wahyu Kusuma', 'Best panel di Indonesia', 5),
('Xavier Putra', 'Auto subscribe lifetime!', 5),
('Yusuf Mansur', 'Berkah tools nya mantap', 5),
('Zainal Abidin', 'Worth every penny!', 5),
('Arief Muhammad', 'Sultan approved!', 5),
('Bayu Skak', 'Gokil fiturnya lengkap', 5),
('Cak Lontong', 'Receh tapi work!', 5),
('Desta Mahendra', 'Komedi approved!', 5),
('Ernest Prakasa', 'Stand up comedy tools!', 5);