-- Run this in your Supabase SQL Editor

-- 1. Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  total_study_hours NUMERIC DEFAULT 0,
  last_active_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create the classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  pdf_url TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  progress TEXT DEFAULT 'Not Started',
  is_bookmarked BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE,
  last_position NUMERIC DEFAULT 0
);

-- 3. Disable Row Level Security (RLS) to allow all operations
-- Note: In a real production app with authentication, you would enable RLS and write policies.
-- Since we are using a custom username/password system, we disable RLS for simplicity.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;

-- If you prefer to keep RLS enabled, you can run these policies instead:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for users" ON public.users FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations for classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
