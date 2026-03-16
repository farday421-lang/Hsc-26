import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('manual_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('manual_supabase_key') : null;

  const url = storedUrl || import.meta.env.VITE_SUPABASE_URL || 'https://rjfdxxayhjndologkhep.supabase.co';
  const key = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZmR4eGF5aGpuZG9sb2draGVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDM1NzMsImV4cCI6MjA4OTIxOTU3M30.UVb4zSVbzdrMAFsbGGXpe0mddZR16WZCTw4LrE9xOjs';

  return { url, key };
};

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && 
    (typeof window !== 'undefined' && !localStorage.getItem('manual_supabase_url'))) {
  console.warn('Supabase URL or Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
