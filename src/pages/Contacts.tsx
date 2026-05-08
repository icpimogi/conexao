import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Contact, Branch, Tag } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  MessageCircle, 
  Smartphone,
  Filter,
  MapPin,
  Building2,
  Mail,
  X,
  User,
  Phone,
  Layout,
  List,
  Trash2,
  Pencil,
  Cake,
  Check,
  Tags
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
  contact?: Contact | null;
  branches: Branch[];
  allTags: Tag[];
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSave, contact, branches, allTags }) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    phone: '',
    email: '',
    notes: '',
    birth_date: '',
    gender: 'O',
    branch_id: branches[0]?.id || '1',
    tag_ids: []
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        birth_date: contact.birth_date || '',
        gender: contact.gender || 'O',
        tag_ids: contact.tag_ids || []
      });
    } else {
      setFormData({ name: '', phone: '', email: '', notes: '', birth_date: '', gender: 'O', branch_id: branches[0]?.id || '1', tag_ids: [] });
    }
  }, [contact, isOpen, branches]);

  const toggleTag = (tagId: string) => {
    const currentTags = formData.tag_ids || [];
    if (currentTags.includes(tagId)) {
      setFormData({ ...formData, tag_ids: currentTags.filter(id => id !== tagId) });
    } else {
      setFormData({ ...formData, tag_ids: [...currentTags, tagId] });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-neutral-900 mb-6 font-display">
          {contact ? 'Editar Contato' : 'Novo Contato'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                required
                className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  required
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Filial</label>
              <div className="relative">
                <Layout className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select 
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
                  value={formData.branch_id}
                  onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="email"
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Gênero</label>
              <div className="flex bg-neutral-50 p-1 rounded-xl h-11">
                {[
                  { id: 'M', label: 'Masc.' },
                  { id: 'F', label: 'Fem.' },
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: g.id as any })}
                    className={cn(
                      "flex-1 py-1 text-[10px] font-bold rounded-lg transition-all",
                      formData.gender === g.id ? "bg-white text-primary-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nascimento</label>
              <div className="relative">
                <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input 
                  type="date"
                  className="w-full pl-10 pr-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none"
                  value={formData.birth_date}
                  onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Etiquetas</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                    formData.tag_ids?.includes(tag.id)
                      ? tag.color
                      : "bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300"
                  )}
                >
                  {tag.name}
                  {formData.tag_ids?.includes(tag.id) && <Check className="h-3 w-3" />}
                </button>
              ))}
              {allTags.length === 0 && (
                <p className="text-[10px] text-neutral-400 font-medium italic">Nenhuma etiqueta cadastrada.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-11">Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-200">Salvar Contato</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    // Load branches first
    const savedBranches = localStorage.getItem('conexao_branches');
    if (savedBranches) {
      setBranches(JSON.parse(savedBranches));
    } else {
      setBranches([
        { id: '1', name: 'Matriz Mogi Guaçu' } as any,
        { id: '2', name: 'Filial São Paulo' } as any,
      ]);
    }

    // Load tags
    const savedTags = localStorage.getItem('conexao_tags');
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    } else {
      setTags([
        { id: '1', name: 'Membro', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        { id: '2', name: 'Visitante', color: 'bg-green-100 text-green-700 border-green-200' },
      ] as any);
    }

    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const savedContacts = localStorage.getItem('conexao_contacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
        return;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          branches (name)
        `)
        .order('name');
      
      if (error) throw error;
      const initialContacts = data || [
        { id: '1', name: 'João Delgado', phone: '11999999999', email: 'joao@techflow.com', branch_id: '1', birth_date: '1990-05-15', notes: 'Lead qualificado' },
        { id: '2', name: 'Ricardo Alves', phone: '21988888888', email: 'r.alves@global.com', branch_id: '2', birth_date: '1985-11-20', notes: 'Cliente recorrente' },
        { id: '3', name: 'Beatriz Oliveira', phone: '31977777777', email: 'bea@fintech.co', branch_id: '1', birth_date: '1995-02-10', notes: 'Interesse em SMS' },
      ];
      setContacts(initialContacts as Contact[]);
      localStorage.setItem('conexao_contacts', JSON.stringify(initialContacts));
    } catch (error) {
      console.error(error);
      const fallback = [
        { id: '1', name: 'João Delgado', phone: '11999999999', email: 'joao@techflow.com', branch_id: '1', birth_date: '1990-05-15', notes: 'Lead qualificado' },
        { id: '2', name: 'Ricardo Alves', phone: '21988888888', email: 'r.alves@global.com', branch_id: '2', birth_date: '1985-11-20', notes: 'Cliente recorrente' },
        { id: '3', name: 'Beatriz Oliveira', phone: '31977777777', email: 'bea@fintech.co', branch_id: '1', birth_date: '1995-02-10', notes: 'Interesse em SMS' },
      ] as any;
      setContacts(fallback);
      localStorage.setItem('conexao_contacts', JSON.stringify(fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (contactData: Partial<Contact>) => {
    let updated: Contact[];
    if (editingContact) {
      updated = contacts.map(c => c.id === editingContact.id ? { ...c, ...contactData } as Contact : c);
    } else {
      const newContact = {
        ...contactData,
        id: Math.random().toString(36).substr(2, 9),
      } as Contact;
      updated = [newContact, ...contacts];
    }
    setContacts(updated);
    localStorage.setItem('conexao_contacts', JSON.stringify(updated));
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este contato?')) {
      const updated = contacts.filter(c => c.id !== id);
      setContacts(updated);
      localStorage.setItem('conexao_contacts', JSON.stringify(updated));
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleaned}`, '_blank');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-xl font-semibold text-primary-950 font-display">Gestão de Contatos</h1>
          <p className="text-xs text-neutral-500 mt-1">Gerencie seu networking e inicie conversas instantâneas.</p>
        </div>
        <Button 
          onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
          className="h-10 px-4 text-xs gap-2 rounded-2xl shadow-lg shadow-primary-200 font-bold"
        >
          <UserPlus className="h-4 w-4" />
          Novo Contato
        </Button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, email ou telefone..."
            className="w-full pl-12 pr-4 py-3 bg-neutral-50 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="pl-11 pr-8 py-3 bg-neutral-50 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none min-w-[160px]"
            >
              <option value="all">Todas as Filiais</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 z-10" />
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="pl-11 pr-8 py-3 bg-neutral-50 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all font-semibold appearance-none min-w-[140px]"
            >
              <option value="all">Todos Gêneros</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </div>
          
          <div className="bg-neutral-50 p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'grid' ? "bg-white shadow-sm text-primary-600" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <Layout className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === 'list' ? "bg-white shadow-sm text-primary-600" : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
          : "space-y-3"
      )}>
        <AnimatePresence>
          {contacts
            .filter(c => {
              const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                                   c.phone.includes(search) || 
                                   (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
              const matchesBranch = selectedBranchId === 'all' || c.branch_id === selectedBranchId;
              const matchesGender = selectedGender === 'all' || c.gender === selectedGender;
              return matchesSearch && matchesBranch && matchesGender;
            })
            .map((contact, index) => (
              viewMode === 'grid' ? (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg group-hover:from-primary-600 group-hover:to-primary-700 group-hover:text-white transition-all duration-300">
                        {contact.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors text-sm">{contact.name}</h3>
                        <div className="flex items-center gap-1.5 text-neutral-400">
                           <Building2 className="h-3 w-3" />
                           <span className="text-[10px] font-bold uppercase tracking-wider">
                              {branches.find(b => b.id === contact.branch_id)?.name || 'Filial'}
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}
                        className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {contact.tag_ids && contact.tag_ids.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {contact.tag_ids.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <div key={tagId} className={cn("px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border", tag.color)}>
                            {tag.name}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
                      <Smartphone className="h-3.5 w-3.5 text-primary-400" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium truncate">
                      <Mail className="h-3.5 w-3.5 text-primary-400" />
                      {contact.email || 'Nenhum email'}
                    </div>
                    {contact.birth_date && (
                      <div className="flex items-center gap-3 text-xs text-neutral-600 font-medium">
                        <Cake className="h-3.5 w-3.5 text-primary-400" />
                        {new Date(contact.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => openWhatsApp(contact.phone)}
                      className="rounded-2xl h-9 text-[10px] gap-2 font-bold bg-green-600 hover:bg-green-700 border-none shadow-green-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                    <Button variant="secondary" className="rounded-2xl h-9 text-[10px] gap-2 font-bold">
                      <Smartphone className="h-3.5 w-3.5" />
                      SMS
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center justify-between group hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-all">
                      {contact.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-neutral-900 text-sm">{contact.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1">
                          <Smartphone className="h-2.5 w-2.5" />
                          {contact.phone}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-1 uppercase tracking-wider">
                          <Building2 className="h-2.5 w-2.5" />
                          {branches.find(b => b.id === contact.branch_id)?.name || 'Filial'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    {contact.tag_ids?.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <div key={tagId} className={cn("px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border", tag.color)}>
                          {tag.name}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                      <button 
                        onClick={() => { setEditingContact(contact); setIsModalOpen(true); }}
                        className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 transition-all">
                      <Button 
                        size="sm"
                        onClick={() => openWhatsApp(contact.phone)}
                        className="bg-green-600 hover:bg-green-700 h-8 px-3 rounded-xl border-none text-[10px] font-bold shadow-sm shadow-green-100"
                      >
                        <MessageCircle className="h-3 w-3 mr-1.5" />
                        WhatsApp
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        className="h-8 px-3 rounded-xl text-[10px] font-bold border-neutral-100"
                      >
                        <Smartphone className="h-3 w-3 mr-1.5" />
                        SMS
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
        </AnimatePresence>
      </div>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
        onSave={handleSave}
        contact={editingContact}
        branches={branches}
        allTags={tags}
      />
    </div>
  );
};
