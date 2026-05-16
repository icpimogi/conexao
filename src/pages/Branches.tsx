import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Branch } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone,
  ArrowRight,
  TrendingUp,
  Users as UsersIcon,
  X,
  Trash2,
  Pencil,
  Search,
  Loader2,
  MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: Partial<Branch>) => void;
  branch?: Branch | null;
}

const BranchModal: React.FC<BranchModalProps> = ({ isOpen, onClose, onSave, branch }) => {
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [fetchingCep, setFetchingCep] = useState(false);

  useEffect(() => {
    if (branch) {
      setFormData(branch);
    } else {
      setFormData({ 
        name: '', 
        phone: '', 
        cep: '', 
        street: '', 
        number: '', 
        neighborhood: '', 
        city: '', 
        state: '' 
      });
    }
  }, [branch, isOpen]);

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: cleanCep }));
    
    if (cleanCep.length === 8) {
      setFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
            address: `${data.logradouro}, ${prev.number || ''} - ${data.bairro}, ${data.localidade} - ${data.uf}`
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setFetchingCep(false);
      }
    }
  };

  const updateAddress = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    const formattedAddress = `${newData.street || ''}, ${newData.number || ''} - ${newData.neighborhood || ''}, ${newData.city || ''} - ${newData.state || ''}`;
    setFormData({ ...newData, address: formattedAddress });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-neutral-900 mb-6 font-display">
          {branch ? 'Editar Filial' : 'Nova Filial'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nome da Unidade</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  required
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Unidade Mogi Guaçu"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">CEP</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  required
                  className="w-full pl-10 pr-10 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.cep}
                  onChange={e => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={8}
                />
                {fetchingCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500 animate-spin" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Rua / Logradouro</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  required
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.street}
                  onChange={e => updateAddress('street', e.target.value)}
                  placeholder="Nome da rua..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Número</label>
              <input 
                required
                className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.number}
                onChange={e => updateAddress('number', e.target.value)}
                placeholder="123"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Bairro</label>
              <input 
                required
                className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.neighborhood}
                onChange={e => updateAddress('neighborhood', e.target.value)}
                placeholder="Ex: Centro"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Cidade</label>
              <input 
                required
                className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.city}
                onChange={e => updateAddress('city', e.target.value)}
                placeholder="Ex: Mogi Guaçu"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Estado (UF)</label>
              <input 
                required
                className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.state}
                onChange={e => updateAddress('state', e.target.value)}
                placeholder="Ex: SP"
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-neutral-100">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-11">Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-200">Salvar Filial</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const BranchDetailsModal: React.FC<{ isOpen: boolean; onClose: () => void; branch: Branch }> = ({ isOpen, onClose, branch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
        
        <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
          <Building2 className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 mb-1 font-display">{branch.name}</h2>
        <p className="text-xs text-neutral-500 mb-8 uppercase tracking-widest font-bold">Unidade Operacional</p>

        <div className="space-y-6">
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <MapIcon className="h-3 w-3" />
                Endereço Completo
             </h3>
             <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                   <div className="col-span-2">
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">Rua / Número</p>
                      <p className="text-sm font-semibold text-neutral-800">{branch.street || '-'}{branch.number ? `, ${branch.number}` : ''}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">Bairro</p>
                      <p className="text-sm font-semibold text-neutral-800">{branch.neighborhood || '-'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">CEP</p>
                      <p className="text-sm font-semibold text-neutral-800">{branch.cep || '-'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">Cidade</p>
                      <p className="text-sm font-semibold text-neutral-800">{branch.city || '-'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase mb-0.5">Estado</p>
                      <p className="text-sm font-semibold text-neutral-800">{branch.state || '-'}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Contato
             </h3>
             <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                <p className="text-sm font-semibold text-neutral-800">{branch.phone || 'Não informado'}</p>
             </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-8 rounded-2xl h-12 shadow-lg shadow-primary-100 font-bold">
           Fechar Detalhes
        </Button>
      </motion.div>
    </div>
  );
};

export const Branches: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedBranchForDetails, setSelectedBranchForDetails] = useState<Branch | null>(null);

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      // Try to load from localStorage first
      const savedBranches = localStorage.getItem('conexao_branches');
      let branchesList: Branch[] = [];

      if (savedBranches) {
        branchesList = JSON.parse(savedBranches);
      } else {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name');
        
        if (error) throw error;
        branchesList = data || [
          { 
            id: '1', 
            name: 'Sede Principal', 
            address: 'Rua Paula Bueno, 123 - Centro, Mogi Guaçu - SP', 
            street: 'Rua Paula Bueno',
            number: '123',
            neighborhood: 'Centro',
            city: 'Mogi Guaçu',
            state: 'SP',
            cep: '13840-000',
            phone: '(19) 3861-1234', 
            created_at: new Date().toISOString() 
          },
          { 
            id: '2', 
            name: 'Filial São Paulo', 
            address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP', 
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            cep: '01310-100',
            phone: '(11) 3232-4444', 
            created_at: new Date().toISOString() 
          },
        ];
      }

      // Ensure "Sede Principal" is first
      const sorted = [...branchesList].sort((a, b) => {
        if (a.name === 'Sede Principal') return -1;
        if (b.name === 'Sede Principal') return 1;
        return a.name.localeCompare(b.name);
      });

      setBranches(sorted);
      localStorage.setItem('conexao_branches', JSON.stringify(sorted));
    } catch (error) {
      console.error(error);
      const fallback = [
        { 
          id: '1', 
          name: 'Sede Principal', 
          address: 'Rua Paula Bueno, 123 - Centro, Mogi Guaçu - SP', 
          street: 'Rua Paula Bueno',
          number: '123',
          neighborhood: 'Centro',
          city: 'Mogi Guaçu',
          state: 'SP',
          cep: '13840-000',
          phone: '(19) 3861-1234', 
          created_at: new Date().toISOString() 
        },
        { 
          id: '2', 
          name: 'Filial São Paulo', 
          address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP', 
          street: 'Av. Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          cep: '01310-100',
          phone: '(11) 3232-4444', 
          created_at: new Date().toISOString() 
        },
      ];
      setBranches(fallback);
      localStorage.setItem('conexao_branches', JSON.stringify(fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (branchData: Partial<Branch>) => {
    let updatedBranches: Branch[];
    if (editingBranch) {
      updatedBranches = branches.map(b => b.id === editingBranch.id ? { ...b, ...branchData } as Branch : b);
    } else {
      const newBranch = {
        ...branchData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      } as Branch;
      updatedBranches = [newBranch, ...branches];
    }

    // Sort again
    const sorted = updatedBranches.sort((a, b) => {
      if (a.name === 'Sede Principal') return -1;
      if (b.name === 'Sede Principal') return 1;
      return a.name.localeCompare(b.name);
    });

    setBranches(sorted);
    localStorage.setItem('conexao_branches', JSON.stringify(sorted));
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDeleting(id);
  };

  const confirmDelete = (id: string) => {
    const updated = branches.filter(b => b.id !== id);
    // Sort again even after delete
    const sorted = updated.sort((a, b) => {
      if (a.name === 'Sede Principal') return -1;
      if (b.name === 'Sede Principal') return 1;
      return a.name.localeCompare(b.name);
    });
    setBranches(sorted);
    localStorage.setItem('conexao_branches', JSON.stringify(sorted));
    setIsDeleting(null);
  };

  // Get real contact count and growth from localStorage
  const getBranchStats = (branchId: string) => {
    try {
      const savedContacts = localStorage.getItem('conexao_contacts');
      if (!savedContacts) return { count: 0, growth: 0 };
      
      const contacts = JSON.parse(savedContacts) as any[];
      const branchContacts = contacts.filter(c => c.branch_id === branchId);
      
      // Real growth: percentage of contacts added in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentContacts = branchContacts.filter(c => {
        const createdDate = c.created_at ? new Date(c.created_at) : new Date();
        return createdDate > thirtyDaysAgo;
      });

      const growth = branchContacts.length > 0 
        ? Math.round((recentContacts.length / branchContacts.length) * 100)
        : 0;

      return { count: branchContacts.length, growth };
    } catch (e) {
      return { count: 0, growth: 0 };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-1">
              <Building2 className="h-3 w-3" />
              Gestão de Unidades
           </div>
          <h1 className="text-xl font-bold text-primary-950 font-display">Nossas Filiais</h1>
          <p className="text-xs text-neutral-500 mt-1">Gerencie a estrutura organizacional da sua rede.</p>
        </div>
        <Button 
          onClick={() => { setEditingBranch(null); setIsModalOpen(true); }}
          className="h-10 px-4 gap-2 rounded-2xl shadow-lg text-xs font-bold"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Nova Filial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {branches.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white border border-neutral-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500 overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Building2 className="h-24 w-24 -mr-6 -mt-6" />
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-5">
                  <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditingBranch(branch); setIsModalOpen(true); }}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {isDeleting === branch.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); confirmDelete(branch.id); }}
                          className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setIsDeleting(null); }}
                          className="p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(branch.id, e)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <h2 className="text-base font-semibold text-neutral-900 mb-2 truncate">{branch.name}</h2>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-3 text-xs text-neutral-500">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary-400" />
                    <span className="leading-tight">
                      {branch.street ? (
                        <>
                          {branch.street}{branch.number ? `, ${branch.number}` : ''}
                        </>
                      ) : (
                        branch.address || 'Endereço não informado'
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <Phone className="h-3.5 w-3.5 text-primary-400" />
                    <span>{branch.phone || 'Telefone não informado'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-neutral-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Contatos</span>
                    <div className="flex items-center gap-1.5 text-neutral-900 font-bold text-sm">
                      <UsersIcon className="h-3.5 w-3.5 text-primary-500" />
                      {getBranchStats(branch.id).count}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Crescimento</span>
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                      <TrendingUp className="h-3.5 w-3.5" />
                      +{getBranchStats(branch.id).growth}%
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedBranchForDetails(branch)}
                  className="w-full mt-5 rounded-2xl h-10 text-xs border border-neutral-100 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-all font-bold"
                >
                  Ver Detalhes
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <BranchModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBranch(null); }}
        onSave={handleSave}
        branch={editingBranch}
      />

      {selectedBranchForDetails && (
        <BranchDetailsModal 
          isOpen={!!selectedBranchForDetails}
          onClose={() => setSelectedBranchForDetails(null)}
          branch={selectedBranchForDetails}
        />
      )}
    </div>
  );
};
