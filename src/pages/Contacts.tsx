import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Contact, Branch, Tag, Message } from '@/src/types';
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
  Tags,
  Send,
  Clock,
  RefreshCw,
  Upload,
  Download
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
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    birth_date: '',
    gender: 'O' as 'M' | 'F' | 'O',
    branch_id: branches[0]?.id || '1',
    tag_ids: [] as string[]
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        phone: contact.phone || '',
        email: contact.email || '',
        notes: contact.notes || '',
        birth_date: contact.birth_date || '',
        gender: contact.gender || 'O',
        branch_id: contact.branch_id || branches[0]?.id || '1',
        tag_ids: contact.tag_ids || []
      });
    } else {
      setFormData({ 
        name: '', 
        phone: '', 
        email: '', 
        notes: '', 
        birth_date: '', 
        gender: 'O', 
        branch_id: branches[0]?.id || '1', 
        tag_ids: [] 
      });
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

interface ContactProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  branches: Branch[];
  tags: Tag[];
  onRefreshHistory: () => void;
}

const ContactProfileModal: React.FC<ContactProfileModalProps> = ({ isOpen, onClose, contact, branches, tags, onRefreshHistory }) => {
  const [history, setHistory] = useState<Message[]>([]);
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const historyRaw = localStorage.getItem('conexao_history');
      if (historyRaw) {
        const allHistory = JSON.parse(historyRaw);
        // Ensure comparison works regardless of string/number type
        setHistory(allHistory.filter((m: Message) => String(m.contact_id) === String(contact.id)));
      }
    }
  }, [isOpen, contact.id]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const configsRaw = localStorage.getItem('conexao_sms_configs');
      const configs = configsRaw ? JSON.parse(configsRaw) : {};
      
      let success = false;
      let errorMsg = '';

      if (activeChannel === 'sms') {
        const providerId = Object.keys(configs)[0] || 'facilita';
        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: providerId,
            config: configs[providerId],
            to: contact.phone,
            message: message
          })
        });
        const result = await response.json();
        success = result.success;
        errorMsg = result.error;
      } else {
        const waConfig = Object.values(configs).find((c: any) => c.accessToken && c.phoneNumberId);
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: waConfig ? 'official' : 'session',
            config: waConfig || {},
            to: contact.phone,
            message: message
          })
        });
        const result = await response.json();
        success = result.success;
        errorMsg = result.error;
      }

      if (success) {
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          contact_id: contact.id,
          user_id: '1',
          type: activeChannel,
          content: message,
          status: 'sent',
          created_at: new Date().toISOString()
        };

        const historyRaw = localStorage.getItem('conexao_history');
        const allHistory = historyRaw ? JSON.parse(historyRaw) : [];
        const updated = [newMessage, ...allHistory];
        localStorage.setItem('conexao_history', JSON.stringify(updated));
        setHistory([newMessage, ...history]);
        setMessage('');
        onRefreshHistory();
      } else {
        alert("Erro: " + errorMsg);
      }
    } catch (err: any) {
      alert("Falha ao enviar: " + err.message);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl flex overflow-hidden"
      >
        {/* Left Panel: Profile Info */}
        <div className="w-80 border-r border-neutral-100 bg-neutral-50/50 p-8 flex flex-col">
          <div className="flex-1 space-y-8">
            <div className="text-center space-y-4">
              <div className="h-24 w-24 mx-auto rounded-3xl bg-primary-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-primary-100">
                {contact.name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-display">{contact.name}</h2>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                   <Building2 className="h-3 w-3 text-neutral-400" />
                   <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                     {branches.find(b => b.id === contact.branch_id)?.name || 'Filial'}
                   </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Telefone</p>
                <div className="bg-white p-3 rounded-xl border border-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary-500" />
                  {contact.phone}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">E-mail</p>
                <div className="bg-white p-3 rounded-xl border border-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 text-primary-500" />
                  {contact.email || 'Nenhum e-mail'}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">Etiquetas</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {contact.tag_ids?.map(tid => {
                    const tag = tags.find(t => t.id === tid);
                    return tag ? (
                      <div key={tid} className={cn("px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border", tag.color)}>
                        {tag.name}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>

          <Button variant="ghost" onClick={onClose} className="mt-8 rounded-2xl h-12 gap-2 text-xs font-bold">
             <X className="h-4 w-4" />
             Fechar Detalhes
          </Button>
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 flex flex-col h-full bg-white">
           <div className="p-8 pb-4 border-b border-neutral-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-900 font-display">Comunicação</h3>
              <div className="flex bg-neutral-100 p-1 rounded-2xl">
                 <button 
                  onClick={() => setActiveChannel('whatsapp')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2", activeChannel === 'whatsapp' ? "bg-white text-green-600 shadow-sm" : "text-neutral-500")}
                 >
                   <MessageCircle className="h-3.5 w-3.5" />
                   WhatsApp
                 </button>
                 <button 
                  onClick={() => setActiveChannel('sms')}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2", activeChannel === 'sms' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-500")}
                 >
                   <Smartphone className="h-3.5 w-3.5" />
                   SMS
                 </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-neutral-50/20">
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Envio Rápido</h4>
                 <div className="relative">
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Escreva a mensagem de ${activeChannel}...`}
                      className="w-full h-32 p-5 bg-white border border-neutral-100 rounded-3xl outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm font-medium resize-none"
                    />
                    <div className="absolute bottom-4 right-4">
                       <Button 
                        disabled={sending || !message.trim()}
                        onClick={handleSend}
                        className={cn("h-11 px-6 rounded-2xl gap-2 font-bold shadow-lg", activeChannel === 'whatsapp' ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-primary-600 shadow-primary-100")}
                       >
                         {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                         {sending ? 'Enviando...' : 'Enviar'}
                       </Button>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Histórico Recente</h4>
                 <div className="space-y-3">
                    {history.length > 0 ? history.slice(0, 5).map(msg => (
                      <div key={msg.id} className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                         <div className="flex items-center justify-between mb-2">
                            <div className={cn("text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg flex items-center gap-1", msg.type === 'whatsapp' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600")}>
                               {msg.type === 'whatsapp' ? <MessageCircle className="h-2.5 w-2.5" /> : <Smartphone className="h-2.5 w-2.5" />}
                               {msg.type}
                            </div>
                            <span className="text-[9px] text-neutral-400 font-bold">
                               {new Date(msg.created_at).toLocaleDateString('pt-BR')} às {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <p className="text-xs text-neutral-600 leading-relaxed font-medium">{msg.content}</p>
                      </div>
                    )) : (
                      <div className="text-center py-12 border-2 border-dashed border-neutral-100 rounded-[2.5rem] bg-neutral-50/50">
                         <Clock className="h-8 w-8 text-neutral-200 mx-auto mb-2" />
                         <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nenhuma mensagem enviada</p>
                      </div>
                    )}
                    {history.length > 5 && (
                      <div className="text-center pt-2">
                         <button className="text-[10px] font-bold text-primary-600 hover:underline uppercase tracking-widest">Ver Histórico Completo</button>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
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
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  const [activeProfileContact, setActiveProfileContact] = useState<Contact | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setIsBulkModalOpen(true)}
            className="h-10 px-4 text-xs gap-2 rounded-2xl shadow-lg shadow-neutral-100 font-bold"
          >
            <Upload className="h-4 w-4" />
            Lote
          </Button>
          <Button 
            onClick={() => { setEditingContact(null); setIsModalOpen(true); }}
            className="h-10 px-4 text-xs gap-2 rounded-2xl shadow-lg shadow-primary-200 font-bold"
          >
            <UserPlus className="h-4 w-4" />
            Novo Contato
          </Button>
        </div>
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
                  <div 
                    className="flex justify-between items-start mb-4 cursor-pointer"
                    onClick={() => { setActiveProfileContact(contact); setIsProfileModalOpen(true); }}
                  >
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
                        onClick={(e) => { e.stopPropagation(); setEditingContact(contact); setIsModalOpen(true); }}
                        className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
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
                      onClick={() => { setActiveProfileContact(contact); setIsProfileModalOpen(true); }}
                      className="rounded-2xl h-9 text-[10px] gap-2 font-bold bg-green-600 hover:bg-green-700 border-none shadow-green-100"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => { setActiveProfileContact(contact); setIsProfileModalOpen(true); }}
                      className="rounded-2xl h-9 text-[10px] gap-2 font-bold"
                    >
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
                  className="bg-white border border-neutral-100 rounded-2xl p-4 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => { setActiveProfileContact(contact); setIsProfileModalOpen(true); }}
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
                        onClick={(e) => { e.stopPropagation(); setEditingContact(contact); setIsModalOpen(true); }}
                        className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 transition-all">
                      <Button 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setActiveProfileContact(contact); setIsProfileModalOpen(true); }}
                        className="bg-green-600 hover:bg-green-700 h-8 px-3 rounded-xl border-none text-[10px] font-bold shadow-sm shadow-green-100"
                      >
                        <MessageCircle className="h-3 w-3 mr-1.5" />
                        WhatsApp
                      </Button>
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={(e) => { e.stopPropagation(); setActiveProfileContact(contact); setIsProfileModalOpen(true); }}
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

      {activeProfileContact && (
        <ContactProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          contact={activeProfileContact}
          branches={branches}
          tags={tags}
          onRefreshHistory={() => {}}
        />
      )}

      <BulkUploadModal 
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        branches={branches}
        tags={tags}
        onSuccess={fetchContacts}
      />
    </div>
  );
};

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  tags: Tag[];
  onSuccess: () => void;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, branches, tags, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || '1');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = "nome,telefone,email,genero,nascimento,etiquetas\nJoão Silva,11999999999,joao@email.com,M,15-05-1990,Membro;Vip\nMaria Oliveira,11988888888,maria@email.com,F,20-11-1985,Visitante";
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_contatos_conexao.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const contactsToInsert: any[] = [];

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split while handling possible quotes if needed, but simple split for now
        const [name, phone, email, gender, birthDate, tagsStr] = line.split(',').map(s => s?.trim());
        
        if (name && phone) {
          // Process tags
          const tagIds: string[] = [];
          if (tagsStr) {
            const tagNames = tagsStr.split(';').map(t => t.trim().toLowerCase());
            tagNames.forEach(tName => {
              const foundTag = tags.find(t => t.name.toLowerCase() === tName);
              if (foundTag) tagIds.push(foundTag.id);
            });
          }

          // Convert DD-MM-YYYY to YYYY-MM-DD
          let formattedBirthDate = birthDate || null;
          if (birthDate && birthDate.includes('-')) {
            const parts = birthDate.split('-');
            if (parts[0].length === 2 && parts[2].length === 4) {
              formattedBirthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          contactsToInsert.push({
            name,
            phone: phone.replace(/\D/g, ''),
            email: email || null,
            gender: (gender === 'M' || gender === 'F') ? gender : 'O',
            birth_date: formattedBirthDate,
            branch_id: selectedBranch,
            notes: null,
            tag_ids: tagIds
          });
        }
      }

      if (contactsToInsert.length === 0) {
        alert("Nenhum contato válido encontrado no arquivo.");
        setIsUploading(false);
        return;
      }

      try {
        const savedContacts = localStorage.getItem('conexao_contacts');
        const currentContacts = savedContacts ? JSON.parse(savedContacts) : [];
        
        const newContacts = contactsToInsert.map(c => ({
          ...c,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        }));

        const updated = [...newContacts, ...currentContacts];
        localStorage.setItem('conexao_contacts', JSON.stringify(updated));
        
        setProgress(100);
        setTimeout(() => {
          onSuccess();
          onClose();
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 800);
      } catch (err: any) {
        alert("Erro ao importar: " + err.message);
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 font-display">Cadastrar em Lote</h2>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">Importação via arquivo CSV</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-50 rounded-xl text-neutral-400 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <Button 
               variant="ghost" 
               onClick={downloadTemplate}
               className="text-[10px] h-8 px-4 rounded-xl gap-2 font-bold text-primary-600 bg-primary-50 border border-primary-100"
            >
               <Download className="h-3 w-3" />
               Download Modelo CSV
            </Button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Filial Destino</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full pl-11 pr-4 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold appearance-none"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all cursor-pointer",
              isUploading ? "bg-neutral-50 border-neutral-200" : "bg-primary-50/20 border-primary-100 hover:border-primary-300 hover:bg-primary-50/40"
            )}
          >
             <input 
               type="file" 
               className="hidden" 
               ref={fileInputRef} 
               accept=".csv"
               onChange={handleFileUpload}
             />
             
             {isUploading ? (
               <div className="space-y-4">
                 <RefreshCw className="h-8 w-8 text-primary-600 animate-spin mx-auto" />
                 <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                      className="bg-primary-600 h-1.5 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                 </div>
                 <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Processando...</p>
               </div>
             ) : (
               <div className="space-y-3">
                 <div className="h-14 w-14 bg-white rounded-2xl shadow-sm border border-primary-50 flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 text-primary-500" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-neutral-900">Selecionar CSV</h4>
                    <p className="text-[10px] text-neutral-400 font-medium tracking-wide">Arraste ou clique para enviar</p>
                 </div>
               </div>
             )}
          </div>

          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
             <div className="flex gap-3">
                <div className="h-2 w-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                  Use o modelo para garantir que os dados sejam importados corretamente. O telefone deve conter apenas números. Gênero deve ser M ou F. Nascimento: DD-MM-AAAA. Etiquetas separadas por ponto e vírgula (;).
                </p>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
