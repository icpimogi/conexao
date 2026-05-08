import React from 'react';
import { X, Camera, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';

import { useAuth } from '@/src/hooks/useAuth';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'photo' | 'password';
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, type }) => {
  const { updateUser } = useAuth();
  const [step, setStep] = React.useState<'form' | 'success'>('form');
  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // If it's a photo update, we update the context
    if (type === 'photo' && preview) {
      updateUser({ avatar_url: preview });
    }

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                  {type === 'photo' ? <Camera className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    {type === 'photo' ? 'Alterar Foto de Perfil' : 'Alterar Senha de Acesso'}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {type === 'photo' ? 'Mantenha sua imagem de perfil atualizada.' : 'Mantenha sua conta segura trocando sua senha periodicamente.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {type === 'photo' ? (
                  <div className="space-y-4">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 w-24 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400 gap-2 overflow-hidden hover:border-primary-300 hover:bg-primary-50 transition-all group"
                      >
                        {preview ? (
                          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Camera className="h-8 w-8 group-hover:text-primary-500 transition-colors" />
                            <span className="text-[10px] uppercase font-bold tracking-wider text-center px-2 group-hover:text-primary-600">Clique para selecionar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                      <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                        Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider ml-1">Senha Atual</label>
                      <input 
                        type="password" 
                        required
                        className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider ml-1">Nova Senha</label>
                      <input 
                        type="password" 
                        required
                        className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
                      <input 
                        type="password" 
                        required
                        className="w-full h-11 px-4 rounded-xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:border-primary-300 focus:ring-4 focus:ring-primary-50 transition-all outline-none text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose}
                    className="flex-1 rounded-xl h-11 text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    loading={loading}
                    className="flex-1 rounded-xl h-11 text-xs shadow-lg shadow-primary-200"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 flex flex-col items-center text-center space-y-4"
            >
              <div className="h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Alterado com Sucesso!</h2>
                <p className="text-sm text-neutral-500 mt-2">Suas informações foram atualizadas no sistema.</p>
              </div>
              <Button onClick={onClose} className="w-full max-w-[200px] mt-4 rounded-xl h-11 text-xs">
                Fechar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
