import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/\/rest\/v1\/?$/, '') // Remove /rest/v1/ se existir
  .replace(/\/$/, ''); // Remove barra final
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. CRM will use mock mode or fail on real requests.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
