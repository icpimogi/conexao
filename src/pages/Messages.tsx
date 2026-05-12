import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Zap, 
  Send, 
  Smartphone, 
  MessageCircle, 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Settings2,
  ChevronRight,
  History,
  MoreVertical,
  Plus,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { Contact, Automation, Message, Branch, Tag } from '@/src/types';

export const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manual' | 'bulk' | 'automations' | 'history'>('manual');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  // States for manual message
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [searchContact, setSearchContact] = useState('');
  const [sending, setSending] = useState(false);

  // States for bulk message
  const [bulkFilters, setBulkFilters] = useState({
    gender: 'all' as 'all' | 'M' | 'F' | 'O',
    branch_id: 'all',
    tag_ids: [] as string[]
  });
  const [bulkMessageText, setBulkMessageText] = useState('');
  const [bulkChannel, setBulkChannel] = useState<'whatsapp' | 'sms'>('whatsapp');

  // States for automations
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  useEffect(() => {
    // Load contacts
    const contactsRaw = localStorage.getItem('conexao_contacts');
    if (contactsRaw) setContacts(JSON.parse(contactsRaw));

    // Load branches
    const branchesRaw = localStorage.getItem('conexao_branches');
    if (branchesRaw) setBranches(JSON.parse(branchesRaw));

    // Load tags
    const tagsRaw = localStorage.getItem('conexao_tags');
    if (tagsRaw) setTags(JSON.parse(tagsRaw));

    // Load history
    const historyRaw = localStorage.getItem('conexao_history');
    if (historyRaw) {
      const parsedHistory = JSON.parse(historyRaw);
      setHistory(parsedHistory);
    } else {
      const initialHistory: Message[] = [
        { id: '1', contact_id: '1', user_id: '1', type: 'whatsapp', content: 'Olá! Como você está?', status: 'sent', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', contact_id: '2', user_id: '1', type: 'sms', content: 'Seu código de confirmação é 123456', status: 'sent', created_at: new Date(Date.now() - 7200000).toISOString() },
      ];
      setHistory(initialHistory);
      localStorage.setItem('conexao_history', JSON.stringify(initialHistory));
    }

    // Load automations
    const automationsRaw = localStorage.getItem('conexao_automations');
    if (automationsRaw) {
      setAutomations(JSON.parse(automationsRaw));
    } else {
      const initialAutomations: Automation[] = [
        { 
          id: '1', 
          name: 'Aniversariantes do Dia', 
          type: 'birthday', 
          enabled: true, 
          channel: 'both', 
          whatsapp_template: 'Parabéns {{nome}}! 🎂 Desejamos um dia abençoado e cheio de alegria!',
          sms_template: 'Parabéns {{nome}}! Desejamos um feliz aniversário!',
          created_at: new Date().toISOString() 
        }
      ];
      setAutomations(initialAutomations);
      localStorage.setItem('conexao_automations', JSON.stringify(initialAutomations));
    }

    setLoading(false);

    // Simulate Birthday logic on load
    const lastRunStr = localStorage.getItem('conexao_birthday_last_run');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastRunStr !== today) {
      const currentAutomations = JSON.parse(localStorage.getItem('conexao_automations') || '[]');
      const birthdayAutomation = currentAutomations.find((a: any) => a.type === 'birthday' && a.enabled);
      
      if (birthdayAutomation) {
        const allContacts = JSON.parse(localStorage.getItem('conexao_contacts') || '[]');
        const todayMonthDay = new Date().toISOString().slice(5, 10); // MM-DD
        
        const birthdayPeople = allContacts.filter((c: any) => c.birth_date && c.birth_date.slice(5, 10) === todayMonthDay);
        
        if (birthdayPeople.length > 0) {
          const currentHistory = JSON.parse(localStorage.getItem('conexao_history') || '[]');
          const newMessages: any[] = [];
          
          birthdayPeople.forEach((person: any) => {
            // WhatsApp message
            newMessages.push({
              id: Math.random().toString(36).substr(2, 9),
              contact_id: person.id,
              user_id: '1',
              type: 'whatsapp',
              content: birthdayAutomation.whatsapp_template.replace('{{nome}}', person.name),
              status: 'sent',
              created_at: new Date().toISOString()
            });
            // SMS message
            newMessages.push({
              id: Math.random().toString(36).substr(2, 9),
              contact_id: person.id,
              user_id: '1',
              type: 'sms',
              content: birthdayAutomation.sms_template.replace('{{nome}}', person.name),
              status: 'sent',
              created_at: new Date().toISOString()
            });
          });
          
          const updatedHistory = [...newMessages, ...currentHistory];
          localStorage.setItem('conexao_history', JSON.stringify(updatedHistory));
          setHistory(updatedHistory);
        }
        
        localStorage.setItem('conexao_birthday_last_run', today);
      }
    }
  }, []);

  const handleSendMessage = async () => {
    if (!selectedContact || !messageText.trim()) return;

    setSending(true);
    try {
      const configsRaw = localStorage.getItem('conexao_sms_configs');
      const configs = configsRaw ? JSON.parse(configsRaw) : {};
      
      if (sendChannel === 'sms') {
        const providerId = Object.keys(configs)[0] || 'facilita';
        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: providerId,
            config: configs[providerId],
            to: selectedContact.phone,
            message: messageText
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      } else {
        // WhatsApp logic
        // We look for a config that has official API credentials
        const waConfig = Object.values(configs).find((c: any) => c.accessToken && c.phoneNumberId);
        
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: waConfig ? 'official' : 'session',
            config: waConfig || {},
            to: selectedContact.phone,
            message: messageText
          })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
      }

      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        contact_id: selectedContact.id,
        user_id: '1',
        type: sendChannel,
        content: messageText,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      const updatedHistory = [newMessage, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('conexao_history', JSON.stringify(updatedHistory));
      
      setMessageText('');
    } catch (err: any) {
      alert("Falha ao enviar: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async () => {
    if (!bulkMessageText.trim()) return;
    
    setSending(true);
    try {
      const filtered = contacts.filter(c => {
        const matchesGender = bulkFilters.gender === 'all' || c.gender === bulkFilters.gender;
        const matchesBranch = bulkFilters.branch_id === 'all' || c.branch_id === bulkFilters.branch_id;
        const matchesTags = bulkFilters.tag_ids.length === 0 || 
                         bulkFilters.tag_ids.some(tid => c.tag_ids?.includes(tid));
        return matchesGender && matchesBranch && matchesTags;
      });

      const configsRaw = localStorage.getItem('conexao_sms_configs');
      const configs = configsRaw ? JSON.parse(configsRaw) : {};
      const smsProviderId = Object.keys(configs)[0] || 'facilita';
      const waConfig = Object.values(configs).find((c: any) => c.accessToken && c.phoneNumberId);

      const newMessages: Message[] = [];

      // Sequential sending for safety in demo
      for (const person of filtered) {
        if (bulkChannel === 'sms') {
          await fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: smsProviderId,
              config: configs[smsProviderId],
              to: person.phone,
              message: bulkMessageText.replace('{{nome}}', person.name)
            })
          });
        } else {
          await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platform: waConfig ? 'official' : 'session',
              config: waConfig || {},
              to: person.phone,
              message: bulkMessageText.replace('{{nome}}', person.name)
            })
          });
        }

        newMessages.push({
          id: Math.random().toString(36).substr(2, 9),
          contact_id: person.id,
          user_id: '1',
          type: bulkChannel,
          content: bulkMessageText.replace('{{nome}}', person.name),
          status: 'sent',
          created_at: new Date().toISOString()
        });
      }

      const updatedHistory = [...newMessages, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('conexao_history', JSON.stringify(updatedHistory));
      
      setBulkMessageText('');
      setActiveTab('history');
    } catch (err: any) {
      alert("Erro no disparo em massa: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const toggleAutomation = (id: string) => {
    const updated = automations.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    setAutomations(updated);
    localStorage.setItem('conexao_automations', JSON.stringify(updated));
  };

  const saveAutomation = (data: Partial<Automation>) => {
    const updated = automations.map(a => 
      a.id === data.id ? { ...a, ...data } : a
    );
    setAutomations(updated);
    localStorage.setItem('conexao_automations', JSON.stringify(updated));
    setEditingAutomation(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-1">
              <MessageSquare className="h-3 w-3" />
              Central de Comunicação
           </div>
          <h1 className="text-2xl font-bold text-primary-950 font-display">Mensagens</h1>
          <p className="text-xs text-neutral-500 mt-1">Gerencie envios manuais e automações inteligentes.</p>
        </div>

        <div className="bg-neutral-100/50 p-1 rounded-2xl flex items-center gap-1 self-start">
          {[
            { id: 'manual', label: 'Envio Manual', icon: Send },
            { id: 'bulk', label: 'Envio em Massa', icon: Users },
            { id: 'automations', label: 'Automações', icon: Zap },
            { id: 'history', label: 'Histórico', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-white text-primary-600 shadow-sm" 
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'manual' && (
          <motion.div 
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Contact Selector */}
            <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-neutral-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input 
                    className="w-full pl-10 pr-4 h-10 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                    placeholder="Buscar contato..."
                    value={searchContact}
                    onChange={(e) => setSearchContact(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {contacts.filter(c => c.name.toLowerCase().includes(searchContact.toLowerCase())).map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group",
                      selectedContact?.id === contact.id ? "bg-primary-50 border-primary-100" : "hover:bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all",
                      selectedContact?.id === contact.id ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-400"
                    )}>
                      {contact.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-800 truncate">{contact.name}</p>
                      <p className="text-[10px] text-neutral-400 font-medium">{contact.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="lg:col-span-2 space-y-6">
              {selectedContact ? (
                <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-8 flex flex-col h-[600px]">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-bold">
                        {selectedContact.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 leading-tight">{selectedContact.name}</h3>
                        <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest">{selectedContact.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-2xl">
                      <button 
                        onClick={() => setSendChannel('whatsapp')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                          sendChannel === 'whatsapp' ? "bg-white text-green-600 shadow-sm" : "text-neutral-400"
                        )}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                      <button 
                         onClick={() => setSendChannel('sms')}
                         className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                          sendChannel === 'sms' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-400"
                        )}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        SMS
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 relative">
                       <textarea
                        className="w-full h-full p-6 bg-neutral-50 rounded-3xl border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none font-medium text-neutral-700"
                        placeholder="Escreva sua mensagem aqui..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <span className="text-[10px] text-neutral-400 font-bold">{messageText.length} caracteres</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-1 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <p className="text-[10px] text-orange-700 font-semibold leading-snug">
                          Lembre-se: O envio será processado através da sua conexão ativa em "Conexões".
                        </p>
                      </div>
                      <Button 
                        disabled={sending || !messageText.trim()}
                        onClick={handleSendMessage}
                        className={cn(
                          "h-14 px-8 rounded-2xl font-bold gap-3 shadow-lg transition-all w-full md:w-auto",
                          sendChannel === 'whatsapp' ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-primary-600 hover:bg-primary-700"
                        )}
                      >
                        {sending ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Enviar Agora
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-8 flex flex-col items-center justify-center h-[600px] text-center">
                  <div className="h-20 w-20 bg-neutral-50 rounded-3xl flex items-center justify-center mb-6">
                    <MessageSquare className="h-10 w-10 text-neutral-300" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-800 font-display">Sem destinatário</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mt-2 leading-relaxed">
                    Selecione um contato na lista ao lado para iniciar o envio de mensagens individuais.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'bulk' && (
          <motion.div 
            key="bulk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Filters */}
            <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-8 space-y-8">
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                    <Filter className="h-5 w-5" />
                 </div>
                 <h2 className="text-lg font-bold text-neutral-900 font-display">Filtros de Audiência</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Gênero</label>
                  <div className="flex bg-neutral-50 p-1 rounded-xl">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'M', label: 'Masc.' },
                      { id: 'F', label: 'Fem.' },
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => setBulkFilters({ ...bulkFilters, gender: g.id as any })}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all",
                          bulkFilters.gender === g.id ? "bg-white text-primary-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Filial</label>
                  <select 
                    value={bulkFilters.branch_id}
                    onChange={(e) => setBulkFilters({ ...bulkFilters, branch_id: e.target.value })}
                    className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-xs font-semibold appearance-none"
                  >
                    <option value="all">Todas as Filiais</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Etiquetas</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const current = bulkFilters.tag_ids;
                          setBulkFilters({
                            ...bulkFilters,
                            tag_ids: current.includes(tag.id) 
                              ? current.filter(id => id !== tag.id) 
                              : [...current, tag.id]
                          });
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                          bulkFilters.tag_ids.includes(tag.id)
                            ? tag.color
                            : "bg-white text-neutral-400 border-neutral-100 hover:border-neutral-300"
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-50">
                   <div className="bg-primary-50 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Users className="h-4 w-4 text-primary-600" />
                         <span className="text-xs font-bold text-primary-950">Audiência Estimada</span>
                      </div>
                      <span className="text-sm font-black text-primary-600">
                        {contacts.filter(c => {
                          const matchesGender = bulkFilters.gender === 'all' || c.gender === bulkFilters.gender;
                          const matchesBranch = bulkFilters.branch_id === 'all' || c.branch_id === bulkFilters.branch_id;
                          const matchesTags = bulkFilters.tag_ids.length === 0 || 
                                           bulkFilters.tag_ids.some(tid => c.tag_ids?.includes(tid));
                          return matchesGender && matchesBranch && matchesTags;
                        }).length}
                      </span>
                   </div>
                </div>
              </div>
            </div>

            {/* Bulk Composer */}
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-8 flex flex-col h-[600px]">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-50">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 font-display">Mensagem em Massa</h2>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Defina o conteúdo do disparo</p>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-50 p-1.5 rounded-2xl">
                      <button 
                        onClick={() => setBulkChannel('whatsapp')}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                          bulkChannel === 'whatsapp' ? "bg-white text-green-600 shadow-sm" : "text-neutral-400"
                        )}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </button>
                      <button 
                         onClick={() => setBulkChannel('sms')}
                         className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all",
                          bulkChannel === 'sms' ? "bg-white text-blue-600 shadow-sm" : "text-neutral-400"
                        )}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        SMS
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1 relative">
                       <textarea
                        className="w-full h-full p-6 bg-neutral-50 rounded-3xl border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none font-medium text-neutral-700"
                        placeholder="Escreva a mensagem que será enviada para todos os contatos filtrados..."
                        value={bulkMessageText}
                        onChange={(e) => setBulkMessageText(e.target.value)}
                      />
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        <button className="px-3 py-1 bg-white border border-neutral-100 rounded-lg text-[9px] font-bold text-neutral-500 hover:border-primary-200 hover:text-primary-600 transition-all">
                           {"{{nome}}"}
                        </button>
                        <button className="px-3 py-1 bg-white border border-neutral-100 rounded-lg text-[9px] font-bold text-neutral-500 hover:border-primary-200 hover:text-primary-600 transition-all">
                           {"{{filial}}"}
                        </button>
                      </div>
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <span className="text-[10px] text-neutral-400 font-bold">{bulkMessageText.length} caracteres</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="flex-1 p-4 bg-primary-50 border border-primary-100 rounded-2xl flex items-center gap-3">
                        <Zap className="h-4 w-4 text-primary-500" />
                        <p className="text-[10px] text-primary-700 font-semibold leading-snug">
                          Atenção: O disparo em massa pode levar alguns minutos dependendo do tamanho da audiência.
                        </p>
                      </div>
                      <Button 
                        disabled={sending || !bulkMessageText.trim()}
                        onClick={handleBulkSend}
                        className={cn(
                          "h-14 px-8 rounded-2xl font-bold gap-3 shadow-lg transition-all w-full md:w-auto",
                          bulkChannel === 'whatsapp' ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-primary-600 hover:bg-primary-700"
                        )}
                      >
                        {sending ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Users className="h-5 w-5" />
                            Disparar em Massa
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'automations' && (
          <motion.div 
            key="automations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {automations.map(automation => (
                <div key={automation.id} className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
                  <div className="p-8 border-b border-neutral-50">
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all",
                        automation.enabled ? "bg-primary-100 text-primary-600" : "bg-neutral-100 text-neutral-400"
                      )}>
                        {automation.type === 'birthday' ? <Calendar className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
                      </div>
                      <button 
                        onClick={() => toggleAutomation(automation.id)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          automation.enabled ? "bg-green-500" : "bg-neutral-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          automation.enabled ? "right-1" : "left-1"
                        )}></div>
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 font-display">{automation.name}</h3>
                    <p className="text-xs text-neutral-500 mt-1">Sempre ativo às 09:00.</p>
                  </div>
                  
                  <div className="p-8 space-y-6 flex-1">
                     <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <MessageCircle className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-semibold text-neutral-700">Template WhatsApp</span>
                           </div>
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-blue-600" />
                              <span className="text-xs font-semibold text-neutral-700">Template SMS</span>
                           </div>
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                     </div>

                     <div className="bg-primary-50/50 p-4 rounded-2xl border border-primary-100/50">
                        <p className="text-[10px] text-primary-700 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Clock className="h-3 w-3" />
                           Última Execução
                        </p>
                        <p className="text-[11px] font-semibold text-neutral-700">Hoje às 09:00 - 12 contatos atingidos</p>
                     </div>
                  </div>

                  <div className="p-6 bg-neutral-50/50 flex gap-4">
                     <Button 
                      onClick={() => setEditingAutomation(automation)}
                      className="flex-1 rounded-2xl h-12 gap-2 text-xs font-bold"
                     >
                        <Settings2 className="h-4 w-4" />
                        Configurar Template
                     </Button>
                  </div>
                </div>
              ))}

              <button className="bg-white rounded-[2.5rem] border-2 border-dashed border-neutral-200 p-8 flex flex-col items-center justify-center group hover:border-primary-300 hover:bg-primary-50/10 transition-all">
                <div className="h-14 w-14 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:bg-primary-100 group-hover:text-primary-600 transition-all mb-4">
                  <Plus className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-bold text-neutral-800">Nova Automação</h4>
                <p className="text-[10px] text-neutral-400 font-medium">Crie gatilhos personalizados.</p>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden"
          >
             <table className="w-full">
                <thead>
                   <tr className="bg-neutral-50/50 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-left">
                      <th className="px-8 py-5">Destinatário</th>
                      <th className="px-8 py-5">Tipo</th>
                      <th className="px-8 py-5">Mensagem</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Data/Hora</th>
                      <th className="px-8 py-5 text-right">Ação</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                   {history.map(msg => {
                      const contact = contacts.find(c => c.id === msg.contact_id);
                      return (
                        <tr key={msg.id} className="group hover:bg-neutral-50/50 transition-colors">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                                    {contact?.name[0]}
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-neutral-800">{contact?.name || 'Inconhecido'}</p>
                                    <p className="text-[9px] text-neutral-400 font-medium">{contact?.phone}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-5">
                              <div className={cn(
                                 "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                                 msg.type === 'whatsapp' ? "text-green-600" : "text-blue-600"
                              )}>
                                 {msg.type === 'whatsapp' ? <MessageCircle className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                                 {msg.type}
                              </div>
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-xs text-neutral-600 max-w-xs truncate">{msg.content}</p>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 w-fit text-[9px] font-bold uppercase">
                                 <CheckCircle2 className="h-2.5 w-2.5" />
                                 {msg.status}
                              </div>
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-[10px] font-bold text-neutral-500">
                                 {new Date(msg.created_at).toLocaleString('pt-BR')}
                              </p>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button className="p-2 text-neutral-300 hover:text-neutral-500 hover:bg-white rounded-xl transition-all">
                                 <MoreVertical className="h-4 w-4" />
                              </button>
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
             {history.length === 0 && (
                <div className="p-20 text-center">
                   <p className="text-sm font-medium text-neutral-400">Nenhuma mensagem enviada recentemente.</p>
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Automation Edit Modal */}
      {editingAutomation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative"
          >
            <h2 className="text-2xl font-bold text-neutral-900 mb-2 font-display">Configurar Automação</h2>
            <p className="text-sm text-neutral-500 mb-10">{editingAutomation.name}</p>

            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <MessageCircle className="h-3 w-3 text-green-600" />
                     Template WhatsApp
                  </label>
                  <textarea 
                    className="w-full h-24 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    value={editingAutomation.whatsapp_template || ''}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, whatsapp_template: e.target.value })}
                  />
                  <p className="text-[9px] text-neutral-400 font-bold ml-1 uppercase">Dica: Use {"{{nome}}"} para personalizar com o nome do contato.</p>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Smartphone className="h-3 w-3 text-blue-600" />
                     Template SMS
                  </label>
                  <textarea 
                    className="w-full h-24 p-5 bg-neutral-50 rounded-2xl border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                    value={editingAutomation.sms_template || ''}
                    onChange={(e) => setEditingAutomation({ ...editingAutomation, sms_template: e.target.value })}
                  />
               </div>

               <div className="flex gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setEditingAutomation(null)} className="flex-1 rounded-2xl h-14 font-bold">Cancelar</Button>
                  <Button onClick={() => saveAutomation(editingAutomation)} className="flex-1 rounded-2xl h-14 font-bold shadow-lg shadow-primary-100">Salvar Automação</Button>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
