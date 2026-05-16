import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  const runtimeValue = (window as any).__RUNTIME_CONFIG__?.[key];
  return runtimeValue || import.meta.env[key] || '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL')
  .trim()
  .replace(/^["']|["']$/g, '')
  .replace(/\/rest\/v1\/?$/, '') // Remove /rest/v1/ se existir
  .replace(/\/$/, ''); // Remove barra final
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY').trim().replace(/^["']|["']$/g, '');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
  console.error('⚠️ Supabase: Chaves não detectadas! Verifique se você adicionou VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no menu Settings/Configurações.');
} else {
  console.log('🔌 Supabase: Tentando conectar em', supabaseUrl.substring(0, 20) + '...');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Helper to check if tables are functional
export const checkTablesReady = async () => {
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return { ready: false, error: 'Configuração pendente' };
  }
  
  try {
    // Teste simples para ver se o projeto existe
    const { error: branchErr } = await supabase.from('branches').select('id').limit(1);
    
    if (branchErr) {
      console.error('❌ Supabase Erro:', branchErr.message);
      return { 
        ready: false, 
        error: branchErr.message,
        code: branchErr.code
      };
    }
    return { ready: true };
  } catch (err: any) {
    console.error('❌ Supabase Catch Erro:', err);
    return { ready: false, error: err.message };
  }
};
