import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { User, Branch } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { 
  UserCog, 
  ShieldCheck, 
  ShieldAlert, 
  User as UserIcon,
  Mail,
  UserPlus,
  Trash2,
  Lock,
  X,
  Building2,
  Shield,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
  user?: User | null;
  branches: Branch[];
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, branches }) => {
  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    name: '',
    email: '',
    role: 'user',
    branch_id: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({ ...user, password: '' });
    } else {
      setFormData({ name: '', email: '', role: 'user', branch_id: '', password: '' });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full transition-colors">
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-neutral-900 mb-6 font-display">
          {user ? 'Editar Acessos' : 'Cadastrar Usuário'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nome do Colaborador</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                required
                className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João da Silva"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="email"
                  required
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@conexao.com"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
                {user ? 'Nova Senha (opcional)' : 'Senha de Acesso'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="password"
                  required={!user}
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nível de Acesso</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select 
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="user">Operador</option>
                  <option value="admin">Administrador</option>
                  <option value="master">Master</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Filial Responsável</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select 
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
                  value={formData.branch_id || ''}
                  onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                >
                  <option value="">Acesso Global</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-11">Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-200">Salvar Alterações</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchBranches()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const fetchBranches = async () => {
    try {
      // Prioritize localStorage as used in Branches.tsx
      const savedBranches = localStorage.getItem('conexao_branches');
      if (savedBranches) {
        setBranches(JSON.parse(savedBranches));
        return;
      }

      // Fallback to supabase
      const { data, error } = await supabase.from('branches').select('*');
      if (error) throw error;
      
      const branchData = data || [
        { id: '1', name: 'Sede Principal', created_at: '' },
      ];
      setBranches(branchData);
      localStorage.setItem('conexao_branches', JSON.stringify(branchData));
    } catch (error) {
      console.error('Error fetching branches:', error);
      setBranches([
        { id: '1', name: 'Sede Principal', created_at: '' },
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error(error);
      // Fallback - Just the main admin if database fails
      setUsers([
        { id: '1', name: 'Admin Master', email: 'master@conexao.com', role: 'master', created_at: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (userData: Partial<User> & { password?: string }) => {
    const { password, ...userFields } = userData;
    
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userFields } as User : u));
    } else {
      const newUser = {
        ...userFields,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as User;
      setUsers(prev => [newUser, ...prev]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este usuário do sistema? Esta ação revogará todo o acesso instantaneamente.')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  if (currentUser?.role !== 'master' && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="h-20 w-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
           <Lock className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Acesso Restrito</h1>
        <p className="text-neutral-500 max-w-sm">
           Apenas usuários com nível de acesso <strong>Administrador</strong> ou <strong>Master</strong> podem visualizar esta área.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-primary-950 font-display">Equipe & Acessos</h1>
          <p className="text-xs text-neutral-500 mt-1">Gerencie quem pode acessar esta plataforma e seus níveis de permissão.</p>
        </div>
        {currentUser?.role === 'master' && (
          <Button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="h-10 px-4 gap-2 rounded-2xl shadow-lg shadow-primary-100 text-xs font-bold"
          >
            <UserPlus className="h-4 w-4" />
            Cadastrar Usuário
          </Button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-50 bg-neutral-50/50">
                <th className="px-6 py-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest text-center">Usuário</th>
                <th className="px-6 py-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest text-center">Nível</th>
                <th className="px-6 py-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest text-center">Filial/Global</th>
                <th className="px-6 py-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr 
                    key={user.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="group hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors text-sm">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900 leading-tight text-sm">{user.name}</p>
                          <p className="text-[10px] text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                        user.role === 'master' ? "bg-amber-100 text-amber-700" :
                        user.role === 'admin' ? "bg-primary-100 text-primary-700" :
                        "bg-neutral-100 text-neutral-700"
                      )}>
                        {user.role.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
                         {user.branch_id ? (branches.find(b => b.id === user.branch_id)?.name || 'Filial não encontrada') : 'Global'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <div className="flex items-center justify-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Ativo</span>
                       </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {currentUser?.role === 'master' && (
                        <div className="flex justify-end gap-1">
                          <Button 
                            onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-xl hover:bg-white hover:shadow-sm"
                          >
                            <Pencil className="h-4 w-4 text-neutral-400 group-hover:text-primary-500" />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(user.id)}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-xl hover:bg-red-50"
                            disabled={user.role === 'master' || user.id === currentUser?.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-300 group-hover:text-red-500" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onSave={handleSave}
        user={editingUser}
        branches={branches}
      />
    </div>
  );
};
