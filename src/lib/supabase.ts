import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('manual_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('manual_supabase_key') : null;

  const url = storedUrl || import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = storedKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

  return { url, key };
};

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();

if ((!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) && 
    (typeof window !== 'undefined' && !localStorage.getItem('manual_supabase_url'))) {
  console.warn('Supabase URL or Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
