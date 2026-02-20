
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://annoiwuinqjedatnmobg.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubm9pd3VpbnFqZWRhdG5tb2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkzOTk0OTcsImV4cCI6MjAyNDk3NTQ5N30.placeholder'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: {
    headers: { 'x-application-name': 'smartponto-ultra' },
    fetch: (url, options) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // Timeout agressivo de 2.5s
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
    }
  },
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return !error;
  } catch (e) {
    return false;
  }
};
