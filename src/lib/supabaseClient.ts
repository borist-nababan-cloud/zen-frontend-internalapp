import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ihdlwogvjfgawgsalgng.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_KobV2o95Ymfem77b4zVBJg_E_onldRD';

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
