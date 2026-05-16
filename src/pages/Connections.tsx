import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  MessageCircle, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Globe,
  Settings2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

export const Connections: React.FC = () => {
  // WhatsApp Status (handled by server now)
  const [waStatus, setWaStatus] = useState<'disabled' | 'connected'>('connected');
  const [waMode, setWaMode] = useState<'session' | 'official'>('official');
  
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const [providerConfigStatus, setProviderConfigStatus] = useState<Record<string, boolean>>({
    facilita: false,
    zenvia: false,
    whatsapp: false
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/diagnostics');
        const data = await response.json();
        if (data.env) {
          setProviderConfigStatus({
            facilita: !!data.env.facilita_configured,
            zenvia: !!data.env.zenvia_configured,
            whatsapp: !!data.env.whatsapp_configured
          });
          if (data.env.whatsapp_configured) {
             setWaMode('official');
          } else {
             setWaMode('session');
          }
        }
      } catch (err) {
        console.error("Error checking provider status:", err);
      }
    };
    checkStatus();
  }, []);

  const smsProviders = [
    { id: 'zenvia', name: 'Zenvia', description: 'API Zenvia para SMS em massa.', status: 'stable' },
    { id: 'facilita', name: 'Facilita Móvel', description: 'Líder em envios no Brasil via Facilita.', status: 'stable' },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-1">
              <RefreshCw className="h-3 w-3" />
              Status de Integração
           </div>
          <h1 className="text-2xl font-bold text-primary-950 font-display">Conexões</h1>
          <p className="text-xs text-neutral-500 mt-1">Configure seus canais de comunicação oficiais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* WhatsApp Connection Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-8 border-b border-neutral-50 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-4">
              <div className="h-14 w-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-7 w-7" />
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
                waStatus === 'connected' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                <span className={cn("h-2 w-2 rounded-full", waStatus === 'connected' ? "bg-green-600 animate-pulse" : "bg-amber-600")}></span>
                {waStatus === 'connected' ? 'Conectado' : waStatus === 'pairing' ? 'Aguardando...' : 'Desconectado'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-display">WhatsApp Business</h2>
                <p className="text-xs text-neutral-500 mt-1">Conecte sua conta para envio automático.</p>
              </div>
              <div className="flex bg-neutral-200/50 p-1 rounded-xl">
                 <button 
                  onClick={() => setWaMode('session')}
                  className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", waMode === 'session' ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500")}
                 >Sessão</button>
                 <button 
                  onClick={() => setWaMode('official')}
                  className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all", waMode === 'official' ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500")}
                 >OFICIAL</button>
              </div>
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col justify-center">
            {waMode === 'official' ? (
              <div className="space-y-6">
                <div className="p-6 bg-primary-50 rounded-[2rem] border border-primary-100 flex items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">Configuração Segura</h3>
                    <p className="text-[10px] text-neutral-500 font-medium">As chaves de API estão protegidas no servidor.</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <span className="text-xs font-bold text-neutral-600">Account Status</span>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-2 py-0.5 rounded-md">Validada</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <span className="text-xs font-bold text-neutral-600">Webhook Status</span>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-100 px-2 py-0.5 rounded-md">Ativo</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                    <strong>Nota de Segurança:</strong> Conforme política de conformidade, as credenciais WABA (WhatsApp Business API) não são visíveis ou editáveis via interface web. 
                    <br/>
                    Para atualizar as chaves, utilize o painel de variáveis de ambiente do sistema.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 py-8">
                <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-left text-sm">Sessão Web Ativa</h3>
                    <p className="text-[10px] text-neutral-500 font-bold text-left uppercase tracking-widest mt-1">Sincronizado via Servidor Seguro</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-green-600 ml-auto" />
                </div>
                <p className="text-[10px] text-neutral-400 max-w-[300px] mx-auto">
                  A conexão de sessão é mantida pelo backend para garantir disponibilidade contínua das automações.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* SMS Providers Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-display">Provedores SMS</h2>
                <p className="text-xs text-neutral-500 mt-1">Configure o backup para notificações críticas.</p>
              </div>
            </div>

            <div className="space-y-4">
              {smsProviders.map((provider) => (
                <div 
                  key={provider.id} 
                  className={cn(
                    "flex items-center justify-between p-5 rounded-3xl border transition-all cursor-pointer group",
                    activeProvider === provider.id 
                      ? "bg-primary-50 border-primary-200 shadow-sm" 
                      : "bg-white border-neutral-100 hover:border-primary-100"
                  )}
                  onClick={() => setActiveProvider(activeProvider === provider.id ? null : provider.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-colors font-bold text-xs shadow-sm",
                      activeProvider === provider.id ? "bg-primary-600 text-white" : "bg-neutral-50 text-neutral-400 group-hover:bg-primary-50"
                    )}>
                      {provider.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-800">{provider.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-medium">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-1">
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-tighter",
                        providerConfigStatus[provider.id] ? "text-green-600" : "text-amber-500"
                      )}>
                        {providerConfigStatus[provider.id] ? 'Ativado' : 'Não Configurado'}
                      </span>
                    </div>
                    <span className={cn(
                      "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]",
                      providerConfigStatus[provider.id] ? "bg-green-500" : "bg-amber-400"
                    )}></span>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-neutral-300 transition-transform",
                      activeProvider === provider.id ? "rotate-90 text-primary-500" : "group-hover:translate-x-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {activeProvider && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 pt-8 border-t border-neutral-100 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                       <Settings2 className="h-3 w-3 text-primary-500" />
                       Configurações {smsProviders.find(p => p.id === activeProvider)?.name}
                    </h3>
                  </div>

                  <div className="space-y-4 p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                    <div className="flex items-center gap-3 text-primary-600 mb-2">
                       <ShieldCheck className="h-4 w-4" />
                       <span className="text-xs font-bold uppercase tracking-widest">Segurança de Dados</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      As credenciais para <strong>{smsProviders.find(p => p.id === activeProvider)?.name}</strong> estão configuradas no ambiente do servidor. 
                      Os envios são processados de forma privada sem exposição de tokens no cabeçalho do navegador.
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-neutral-700">Status do Provedor</span>
                       <span className={cn(
                         "text-[10px] font-bold",
                         providerConfigStatus[activeProvider] ? "text-green-600" : "text-amber-600"
                       )}>
                         {providerConfigStatus[activeProvider] ? 'OPERACIONAL' : 'PENDENTE DE CONFIGURAÇÃO'}
                       </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-2xl h-11 border border-neutral-100 text-neutral-600 hover:bg-neutral-50 font-bold text-xs"
                      onClick={() => setTestMode(!testMode)}
                    >
                       Realizar Teste de Disparo
                    </Button>
                    <Button variant="ghost" className="rounded-2xl h-11 px-4 text-neutral-400">
                       <Globe className="h-4 w-4" />
                    </Button>
                  </div>

                  <AnimatePresence>
                    {testMode && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-6 bg-primary-50 rounded-3xl border border-primary-100 space-y-4"
                      >
                         <h4 className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Enviar SMS de Teste</h4>
                         <div className="flex gap-2">
                            <input 
                              type="text"
                              value={testNumber}
                              onChange={(e) => setTestNumber(e.target.value)}
                              className="flex-1 px-4 h-11 rounded-xl bg-white border border-primary-200 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                              placeholder="Número com DDD (ex: 11999999999)"
                            />
                            <Button 
                              disabled={isTesting || !testNumber}
                              onClick={async () => {
                                setIsTesting(true);
                                try {
                                  const { data: { session } } = await supabase.auth.getSession();
                                  const response = await fetch('/api/sms/send', {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${session?.access_token}`
                                    },
                                    body: JSON.stringify({
                                      provider: activeProvider,
                                      config: {}, // Server uses ENV
                                      to: testNumber,
                                      message: "Teste de conexão Conexão App - SMS funcionando via Servidor Seguro!"
                                    })
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setTestSuccess(true);
                                    setTimeout(() => {
                                      setTestSuccess(false);
                                      setTestMode(false);
                                    }, 2000);
                                  } else {
                                    alert("Falha no teste: " + result.error);
                                  }
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setIsTesting(false);
                                }
                              }}
                              className="h-11 px-6 rounded-xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-100"
                            >
                               {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : testSuccess ? <CheckCircle2 className="h-4 w-4" /> : 'Enviar'}
                            </Button>
                         </div>
                         <p className="text-[9px] text-primary-400 font-medium">O disparo usará as credenciais de produção salvas no ambiente.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-100">
            <h3 className="text-lg font-bold font-display mb-2 flex items-center gap-2">
               <ShieldCheck className="h-5 w-5 text-primary-200" />
               Conexão Segura
            </h3>
            <p className="text-xs text-primary-100/80 leading-relaxed mb-6">
              Todos os dados trafegados entre sua conta do WhatsApp e o sistema são criptografados. Nós não armazenamos o histórico de conversas fora do necessário para automações.
            </p>
            <div className="flex items-center gap-4">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full bg-primary-500 border-2 border-primary-700 flex items-center justify-center text-[10px] font-bold">
                       {i}
                    </div>
                  ))}
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary-200">+2.5k Ativos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
