-- ==============================================================================
-- KASBON - PostgreSQL & Supabase Database Migration
-- Specification from Hiring Task Kasbon:
-- Table: debts
-- Columns:
--   - id (uuid, PK)
--   - user_id (uuid, FK ke auth.users)
--   - type (enum: owed_to_me / i_owe)
--   - counterpart_name (text)
--   - amount (bigint, dalam Rupiah utuh - bukan desimal)
--   - note (text, nullable)
--   - due_date (date, nullable)
--   - settled_at (timestamptz, nullable - null = belum lunas)
--   - created_at, updated_at (timestamptz)
-- RLS policies WAJIB:
--   - User cuma bisa SELECT/INSERT/UPDATE/DELETE row miliknya
-- ==============================================================================

-- 1. Create Enum type for debt direction
DO $$ BEGIN
  CREATE TYPE debt_type AS ENUM ('owed_to_me', 'i_owe');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create debts table
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type debt_type NOT NULL,
  counterpart_name TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  note TEXT CHECK (char_length(note) <= 200),
  due_date DATE,
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) - Mandatory
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if any to prevent duplication
DROP POLICY IF EXISTS "Users can only select their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can only insert their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can only update their own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can only delete their own debts" ON public.debts;

-- 5. Strict RLS Policies
-- SELECT: Only own records
CREATE POLICY "Users can only select their own debts"
  ON public.debts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: User can only insert rows where user_id = auth.uid()
CREATE POLICY "Users can only insert their own debts"
  ON public.debts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: User can only update their own rows
CREATE POLICY "Users can only update their own debts"
  ON public.debts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: User can only delete their own rows
CREATE POLICY "Users can only delete their own debts"
  ON public.debts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Performance & Search Indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_status ON public.debts(user_id, settled_at);
CREATE INDEX IF NOT EXISTS idx_debts_user_type ON public.debts(user_id, type);
CREATE INDEX IF NOT EXISTS idx_debts_counterpart ON public.debts(user_id, counterpart_name);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON public.debts(user_id, due_date);

-- 7. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_debt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_debt_updated ON public.debts;
CREATE TRIGGER on_debt_updated
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_debt_updated_at();
