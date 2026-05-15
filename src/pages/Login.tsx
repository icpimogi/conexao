import React, { useState, useEffect } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Mail, ArrowRight, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, signIn, authError, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado e sem erros de perfil
  useEffect(() => {
    if (user && !authError) {
      navigate('/', { replace: true });
    }
  }, [user, authError, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      console.error('Login Error:', error);
      let msg = error.message || 'Erro ao realizar login.';
      
      if (error.message?.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha inválidos. Verifique se digitou corretamente.';
      } else if (error.message?.includes('Email not confirmed')) {
        msg = 'E-mail não confirmado. Verifique sua caixa de entrada.';
      }
      alert(msg);
    } finally {
      // Sempre resetar o estado de carregamento do botão
      setLoading(false);
    }
  };

  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-50 via-neutral-50 to-white text-neutral-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {authError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-[11px] font-semibold space-y-3">
            <p className="font-bold">⚠️ Erro de Perfil</p>
            <p className="leading-relaxed">{authError}</p>
            <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 bg-white" onClick={signOut}>
               Tentar outro usuário
            </Button>
          </div>
        )}

        {!isConfigured && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium space-y-2">
            <p className="font-bold">⚠️ Configuração Pendente</p>
            <p>Você precisa configurar as variáveis no painel <strong>Secrets</strong> do AI Studio (ícone de engrenagem à esquerda):</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>VITE_SUPABASE_URL</li>
              <li>VITE_SUPABASE_ANON_KEY</li>
            </ul>
          </div>
        )}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-3xl shadow-xl border border-neutral-100 flex items-center justify-center">
              <Logo size="lg" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary-950 mb-2">Conexão ICPI</h1>
          <p className="text-neutral-500">Gestão Inteligente de Contatos</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-primary-200/20 border border-neutral-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="E-mail"
              placeholder="nome@exemplo.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-5 w-5" />}
            />
            
            <div className="space-y-1.5">
              <Input
                label="Senha"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
              />
              <div className="flex justify-end px-1">
                <button 
                  type="button"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  onClick={() => alert('Funcionalidade de recuperação de senha em breve.')}
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg mt-2" isLoading={loading}>
              Entrar no Sistema
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <p className="text-[10px] text-center text-neutral-400 uppercase tracking-widest font-medium">
              Acesse com seus dados cadastrados
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
