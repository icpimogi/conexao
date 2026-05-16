import React from 'react';
import { 
  Zap, 
  Cake, 
  Mail, 
  MessageSquare, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { Automation } from '@/src/types';

export const Automations: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [automation, setAutomation] = React.useState<Automation | null>(null);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const fetchAutomation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('type', 'birthday')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAutomation(data);
    } catch (err: any) {
      console.error('Error fetching automation:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAutomation();
  }, []);

  const handleSave = async () => {
    if (!automation) return;
    setSaving(true);
    setStatus({ type: null, message: '' });

    try {
      const { error } = await supabase
        .from('automations')
        .update({
          enabled: automation.enabled,
          message_template: automation.message_template,
          channel: automation.channel
        })
        .eq('id', automation.id);

      if (error) throw error;
      setStatus({ type: 'success', message: 'Configurações de automação salvas com sucesso!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: `Erro ao salvar: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    setSaving(true);
    setStatus({ type: null, message: '' });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/automations/run-birthday', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setStatus({ 
          type: 'success', 
          message: `Processamento manual concluído! ${result.count} mensagens enviadas.` 
        });
        fetchAutomation();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: `Erro ao executar: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-primary-950 font-display">Automações</h1>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-bold">Configure mensagens automáticas do sistema</p>
      </div>

      {status.type && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl flex items-start gap-3",
            status.type === 'success' ? "bg-green-50 border border-green-100 text-green-700" : "bg-red-50 border border-red-100 text-red-700"
          )}
        >
          {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <div className="text-sm font-medium">{status.message}</div>
        </motion.div>
      )}

      {automation ? (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                <Cake className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{automation.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-neutral-400" />
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Executa diariamente às 08:30h</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setAutomation({ ...automation, enabled: !automation.enabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                automation.enabled ? "bg-primary-600" : "bg-neutral-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  automation.enabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Canal de Envio</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setAutomation({ ...automation, channel: 'sms' })}
                  className={cn(
                    "p-4 rounded-2xl border-2 flex items-center gap-3 transition-all",
                    automation.channel === 'sms' ? "border-primary-600 bg-primary-50/50 text-primary-700" : "border-neutral-100 hover:border-neutral-200 text-neutral-500"
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="font-bold text-sm">Apenas SMS</span>
                </button>
                <button
                  onClick={() => setAutomation({ ...automation, channel: 'whatsapp' })}
                  className={cn(
                    "p-4 rounded-2xl border-2 flex items-center gap-3 transition-all",
                    automation.channel === 'whatsapp' ? "border-green-600 bg-green-50/50 text-green-700" : "border-neutral-100 hover:border-neutral-200 text-neutral-500"
                  )}
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-bold text-sm">Apenas WhatsApp</span>
                </button>
                <button
                  onClick={() => setAutomation({ ...automation, channel: 'both' })}
                  className={cn(
                    "p-4 rounded-2xl border-2 flex items-center gap-3 transition-all",
                    automation.channel === 'both' ? "border-amber-600 bg-amber-50/50 text-amber-700" : "border-neutral-100 hover:border-neutral-200 text-neutral-500"
                  )}
                >
                  <Zap className="h-5 w-5" />
                  <span className="font-bold text-sm">Ambos (SMS + WA)</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Modelo da Mensagem</label>
                <span className="text-[10px] text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-full">Dica: Use {"{name}"} para o nome</span>
              </div>
              <textarea
                value={automation.message_template}
                onChange={(e) => setAutomation({ ...automation, message_template: e.target.value })}
                className="w-full h-32 p-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none text-sm"
                placeholder="Escreva sua mensagem aqui..."
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-300"></div>
                Última execução: {automation.last_run ? new Date(automation.last_run).toLocaleString('pt-BR') : 'Nunca'}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost"
                  onClick={handleRunNow}
                  disabled={saving || !automation.enabled}
                  className="rounded-2xl flex items-center gap-2 border border-neutral-100 hover:bg-neutral-50 px-6"
                >
                  <Send className="h-4 w-4" />
                  Testar para Hoje
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl px-8 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-50 p-12 rounded-3xl border border-dashed border-neutral-200 text-center">
          <Zap className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-500">Nenhuma automação encontrada</h3>
          <p className="text-sm text-neutral-400 mt-2">Execute o script de migração do banco de dados.</p>
        </div>
      )}
    </div>
  );
};
