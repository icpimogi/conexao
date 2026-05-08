import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { User } from '@/src/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AuthProvider initialized, checking session...');
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Session found for user:', session.user.id);
        fetchUserProfile(session.user.id);
      } else {
        console.log('No active session.');
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (session) {
        setAuthError(null);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      // Check local cache first for session persistence
      const cached = localStorage.getItem(`profile_${userId}`);
      if (cached) {
        setUser(JSON.parse(cached));
        setLoading(false);
        return;
      }

      console.log('Tentando carregar perfil para o ID:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro na consulta da tabela users:', error);
        if (error.code === 'PGRST116') {
          setAuthError(`Login OK, mas o ID "${userId}" não existe na tabela "users". Você inseriu o registro no SQL Editor?`);
        } else {
          setAuthError(`Erro Supabase (Código ${error.code}): ${error.message}`);
        }
        setUser(null);
      } else {
        console.log('Perfil carregado com sucesso!');
        setUser(data);
      }
    } catch (err: any) {
      console.error('Erro inesperado no fetch:', err);
      setAuthError(`Erro inesperado: ${err.message || 'Falha na conexão'}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password?: string) => {
    setAuthError(null);
    if (password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthError(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Persist locally for session
      try {
        localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedUser));
      } catch (e) {
        console.error('Failed to persist profile update', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
