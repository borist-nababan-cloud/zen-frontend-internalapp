import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
export const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    '[Zen Security Alert] Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided via .env or Coolify build arguments.'
  );
}

/**
 * Supabase Client configured with permanent localStorage session persistence,
 * autoRefreshToken for seamless background token refreshing, and URL session detection.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
