import React, { useState } from 'react';
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

export const Connections: React.FC = () => {
  const [waStatus, setWaStatus] = useState<'disabled' | 'pairing' | 'connected'>('disabled');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [qrTimer, setQrTimer] = useState<number>(60);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testNumber, setTestNumber] = useState('');

  // WhatsApp QR Code generation and timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (waStatus === 'pairing') {
      if (qrTimer > 0) {
        interval = setInterval(() => setQrTimer(prev => prev - 1), 1000);
      } else {
        setWaStatus('disabled'); // Time out, go back to start
      }
    }
    return () => clearInterval(interval);
  }, [waStatus, qrTimer]);

  const startWhatsAppConnection = () => {
    // Formato de string mais próximo de um pareamento real (UserID@CrypticString)
    const sessionId = `2@${btoa(Math.random().toString()).substring(0, 40)},${btoa(Math.random().toString()).substring(0, 40)}`;
    setQrCodeData(sessionId);
    setQrTimer(60);
    setWaStatus('pairing');
  };

  const [configs, setConfigs] = useState<Record<string, { apiKey: string, senderId: string, password?: string }>>({});
  const [currentSettings, setCurrentSettings] = useState({ apiKey: '', senderId: '', password: '' });

  const smsProviders = [
    { id: 'zenvia', name: 'Zenvia', description: 'API brasileira de alta performance para SMS.', status: 'stable' },
    { id: 'facilita', name: 'Facilita Móvel', description: 'Líder em envios no Brasil com a Facilita Móvel.', status: 'stable' },
    { id: 'twilio', name: 'Twilio', description: 'Plataforma global de comunicação programável.', status: 'stable' },
    { id: 'aws', name: 'AWS Pinpoint', description: 'Escalabilidade global usando infraestrutura Amazon.', status: 'beta' },
  ];

  // Load saved configs
  React.useEffect(() => {
    const savedConfigs = localStorage.getItem('conexao_sms_configs');
    if (savedConfigs) {
      setConfigs(JSON.parse(savedConfigs));
    }
  }, []);

  // Update form when provider changes
  React.useEffect(() => {
    if (activeProvider) {
      setCurrentSettings(configs[activeProvider] || { apiKey: '', senderId: '', password: '' });
    }
  }, [activeProvider, configs]);

  const handleSaveSettings = () => {
    if (!activeProvider) return;
    
    const updatedConfigs = {
      ...configs,
      [activeProvider]: currentSettings
    };
    
    setConfigs(updatedConfigs);
    localStorage.setItem('conexao_sms_configs', JSON.stringify(updatedConfigs));
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

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
            <h2 className="text-xl font-bold text-neutral-900 font-display">WhatsApp Business</h2>
            <p className="text-xs text-neutral-500 mt-1">Conecte sua conta para envio automático de mensagens.</p>
          </div>

          <div className="p-8 flex-1 flex flex-col justify-center">
            {waStatus === 'disabled' ? (
              <div className="text-center space-y-6 py-8">
                <div className="bg-neutral-50 h-32 w-32 mx-auto rounded-3xl flex items-center justify-center border-2 border-dashed border-neutral-200">
                  <QrCode className="h-12 w-12 text-neutral-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-800">Conexão via QR Code</p>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                    Escaneie o código para sincronizar suas mensagens e contatos em tempo real.
                  </p>
                </div>
                <Button 
                  onClick={startWhatsAppConnection}
                  className="bg-green-600 hover:bg-green-700 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-green-100"
                >
                  Iniciar Conexão
                </Button>
              </div>
            ) : waStatus === 'pairing' ? (
              <div className="text-center space-y-8 py-4">
                <div className="bg-white p-4 h-64 w-64 mx-auto rounded-3xl shadow-2xl border border-neutral-100 relative group">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData)}`} 
                    alt="QR Code" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[0.5px] pointer-events-none">
                     <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg flex flex-col items-center gap-2 border border-white/50">
                        <RefreshCw className="h-4 w-4 text-green-600 animate-[spin_3s_linear_infinite]" />
                        <span className="text-[10px] font-bold text-neutral-800 tabular-nums">{qrTimer}s</span>
                     </div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-tighter rounded-md border border-amber-200">
                    Simulação
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-900">Escaneie com seu celular</p>
                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 py-2 px-3 rounded-xl border border-amber-100 mx-auto max-w-[240px]">
                      Aviso: Este QR Code é uma simulação de interface e não conectará seu aparelho real.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => setWaStatus('connected')}
                      className="text-xs text-primary-600 hover:text-primary-700 font-bold"
                    >
                      Simular Conexão bem-sucedida
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setWaStatus('disabled')}
                      className="text-[10px] text-neutral-400 font-bold"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-green-50 rounded-3xl p-6 border border-green-100 flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                    <Smartphone className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">iPhone 15 Pro de icpi...</h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Sincronizado há 2 minutos</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className="h-4 w-4 text-primary-500" />
                         <span className="text-xs font-semibold text-neutral-700">Segurança de Ponta-a-Ponta</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                         <RefreshCw className="h-4 w-4 text-primary-500" />
                         <span className="text-xs font-semibold text-neutral-700">Auto-Reconnect Ativado</span>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                   </div>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setWaStatus('disabled')}
                  className="w-full h-12 rounded-2xl border border-red-50 text-red-600 hover:bg-red-50 font-bold text-xs"
                >
                  Desconectar Whatsapp
                </Button>
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
                        configs[provider.id]?.apiKey ? "text-green-600" : "text-neutral-300"
                      )}>
                        {configs[provider.id]?.apiKey ? 'Conectado' : 'Offline'}
                      </span>
                    </div>
                    <span className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      configs[provider.id]?.apiKey ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-neutral-200"
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

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
                        {activeProvider === 'facilita' ? 'Usuário' : 'Sender ID / Número Remetente'}
                      </label>
                      <input 
                        value={currentSettings.senderId}
                        onChange={(e) => setCurrentSettings({ ...currentSettings, senderId: e.target.value })}
                        className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        placeholder={activeProvider === 'facilita' ? 'Seu usuário' : 'Ex: CONEXAO_SMS'}
                      />
                    </div>
                    
                    {activeProvider === 'facilita' && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Senha</label>
                        <input 
                          type="password"
                          value={currentSettings.password || ''}
                          onChange={(e) => setCurrentSettings({ ...currentSettings, password: e.target.value })}
                          className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                          placeholder="••••••••"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">
                        {activeProvider === 'facilita' ? 'Hash de segurança / Token' : 'API KEY / TOKEN'}
                      </label>
                      <input 
                        type="password"
                        value={currentSettings.apiKey}
                        onChange={(e) => setCurrentSettings({ ...currentSettings, apiKey: e.target.value })}
                        className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                        placeholder="••••••••••••••••••••••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSaveSettings}
                      className={cn(
                        "flex-1 rounded-2xl h-11 shadow-lg transition-all",
                        saveSuccess ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "shadow-primary-200"
                      )}
                    >
                      {saveSuccess ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Salvo com Sucesso
                        </span>
                      ) : 'Salvar Alterações'}
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="rounded-2xl h-11 px-6 border border-neutral-100 text-neutral-600 hover:bg-neutral-50 font-bold text-xs"
                      onClick={() => setTestMode(!testMode)}
                    >
                       Testar Conexão
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
                                  const response = await fetch('/api/sms/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      provider: activeProvider,
                                      config: currentSettings,
                                      to: testNumber,
                                      message: "Teste de conexão Conexão App - SMS funcionando!"
                                    })
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setSaveSuccess(true);
                                    setTimeout(() => {
                                      setSaveSuccess(false);
                                      setTestMode(false);
                                    }, 2000);
                                  } else {
                                    console.error(result.error);
                                  }
                                } catch (err) {
                                  console.error(err);
                                } finally {
                                  setIsTesting(false);
                                }
                              }}
                              className="h-11 px-6 rounded-xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-100"
                            >
                              {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Enviar'}
                            </Button>
                         </div>
                         <p className="text-[9px] text-primary-400 font-medium">Sua chave e usuário atuais serão usados para este disparo.</p>
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
