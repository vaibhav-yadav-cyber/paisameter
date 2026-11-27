-- ============================================================================
-- PAISAMETER SUPABASE DATABASE SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 2. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  merchant TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL,
  receipt_url TEXT,
  source TEXT DEFAULT 'manual',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON public.expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON public.expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performant queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (user_id, category);

-- 3. Create Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  month_year TEXT NOT NULL,
  total_budget NUMERIC NOT NULL,
  low_balance_threshold NUMERIC DEFAULT 2000,
  warning_threshold_percent NUMERIC DEFAULT 80,
  category_budgets JSONB DEFAULT '{}'::jsonb,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  overuse_alert_enabled BOOLEAN DEFAULT true,
  low_balance_alert_enabled BOOLEAN DEFAULT true,
  currency_symbol TEXT DEFAULT '₹',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS on Budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON public.budgets (user_id, month_year);

-- 4. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  action_url TEXT
);

-- Enable RLS on Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications (user_id, timestamp DESC);

-- 5. Supabase Storage Bucket for Receipts (Images and PDFs)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Row Level Security Policies
CREATE POLICY "Authenticated users can upload receipts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can view receipts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can delete own receipts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 6. Trigger to automatically create profile on Auth User signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/initials/svg?seed=' || NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
