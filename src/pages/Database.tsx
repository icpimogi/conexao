import React from 'react';
import { 
  Database as DatabaseIcon, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  FileJson,
  RefreshCw,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';

export const Database: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null);

  const handleBackup = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/backup', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar backup');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setStatus({ type: 'success', message: 'Backup concluído e baixado com sucesso!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRestoreFile(e.target.files[0]);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    
    const confirm = window.confirm('TEM CERTEZA? A restauração irá sobrescrever ou atualizar dados existentes com base no arquivo. Recomenda-se fazer um backup antes.');
    if (!confirm) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          
          const { data: { session } } = await supabase.auth.getSession();
          const response = await fetch('/api/restore', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ data: content })
          });

          const result = await response.json();
          if (result.success) {
            setStatus({ 
              type: 'success', 
              message: 'Restauração concluída com sucesso!' 
            });
            setRestoreFile(null);
          } else {
            throw new Error(result.error || 'Erro desconhecido na restauração');
          }
        } catch (err: any) {
          setStatus({ type: 'error', message: `Erro no processamento do arquivo: ${err.message}` });
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(restoreFile);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold text-primary-950 font-display">Gerenciamento de Dados</h1>
        <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-bold">Backup e Restauração do Sistema</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backup Card */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
            <Download className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Exportar Backup</h2>
          <p className="text-sm text-neutral-500 mb-8 px-4">
            Gere uma cópia completa dos seus contatos, filiais, etiquetas, usuários e atividades em formato JSON para segurança extra.
          </p>
          <Button 
            onClick={handleBackup} 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 rounded-2xl flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />}
            Gerar Backup Agora
          </Button>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <History className="h-3 w-3" />
            Recomendado: Semanalmente
          </div>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Importar Backup</h2>
          <p className="text-sm text-neutral-500 mb-8 px-4">
            Restaure os dados do sistema a partir de um arquivo de backup (.json) gerado anteriormente por este aplicativo.
          </p>
          
          <div className="w-full space-y-4">
            <div className="relative group">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileChange}
                className="hidden" 
                id="restore-upload"
              />
              <label 
                htmlFor="restore-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                  restoreFile ? "border-amber-400 bg-amber-50/50" : "border-neutral-200 hover:border-amber-300 hover:bg-amber-50/20"
                )}
              >
                {restoreFile ? (
                  <div className="flex flex-col items-center">
                    <FileJson className="h-8 w-8 text-amber-500 mb-2" />
                    <span className="text-xs font-bold text-amber-700 truncate max-w-[200px]">{restoreFile.name}</span>
                    <span className="text-[10px] text-amber-600 mt-1 uppercase">Clique para trocar</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 text-neutral-400 mb-2 group-hover:text-amber-500 transition-colors" />
                    <span className="text-xs font-semibold text-neutral-500">Selecionar arquivo .json</span>
                  </div>
                )}
              </label>
            </div>

            <Button 
              onClick={handleRestore} 
              disabled={loading || !restoreFile}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-2xl flex items-center justify-center gap-2 group disabled:grayscale"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />}
              Restaurar Base de Dados
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <AlertCircle className="h-3 w-3" />
            Cuidado: Sobrescreve dados
          </div>
        </div>
      </div>
    </div>
  );
};
