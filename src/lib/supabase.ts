import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/\/rest\/v1\/?$/, '') // Remove /rest/v1/ se existir
  .replace(/\/$/, ''); // Remove barra final
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
  console.error('Supabase credentials missing or invalid! Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Helper to check if tables are functional
export const checkTablesReady = async () => {
  try {
    const { error: branchErr } = await supabase.from('branches').select('id').limit(1);
    const { error: contactErr } = await supabase.from('contacts').select('id').limit(1);
    
    if (branchErr || contactErr) {
      return { 
        ready: false, 
        error: branchErr?.message || contactErr?.message,
        details: { branches: !branchErr, contacts: !contactErr }
      };
    }
    return { ready: true };
  } catch (err: any) {
    return { ready: false, error: err.message };
  }
};
