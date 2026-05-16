import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Tag } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { 
  Tags, 
  Plus, 
  X, 
  Trash2, 
  Pencil,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: Partial<Tag>) => void;
  tag?: Tag | null;
}

const COLORS = [
  { name: 'Azul', value: 'bg-blue-100 text-blue-700 border-blue-200' },
  { name: 'Verde', value: 'bg-green-100 text-green-700 border-green-200' },
  { name: 'Roxo', value: 'bg-purple-100 text-purple-700 border-purple-200' },
  { name: 'Vermelho', value: 'bg-red-100 text-red-700 border-red-200' },
  { name: 'Laranja', value: 'bg-orange-100 text-orange-700 border-orange-200' },
  { name: 'Rosa', value: 'bg-pink-100 text-pink-700 border-pink-200' },
  { name: 'Ciano', value: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { name: 'Âmbar', value: 'bg-amber-100 text-amber-700 border-amber-200' },
];

const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose, onSave, tag }) => {
  const [formData, setFormData] = useState<Partial<Tag>>({
    name: '',
    color: COLORS[0].value
  });

  useEffect(() => {
    if (tag) {
      setFormData(tag);
    } else {
      setFormData({ 
        name: '', 
        color: COLORS[0].value
      });
    }
  }, [tag, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:bg-neutral-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-neutral-900 mb-6 font-display">
          {tag ? 'Editar Etiqueta' : 'Nova Etiqueta'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Nome da Etiqueta</label>
            <input 
              required
              className="w-full px-4 h-11 rounded-xl bg-neutral-50 border border-neutral-100 outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Membro"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Cor</label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={cn(
                    "h-10 rounded-xl flex items-center justify-center transition-all border-2",
                    color.value.split(' ')[0], // Use base color
                    formData.color === color.value 
                      ? "border-primary-500 scale-105 shadow-sm" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  {formData.color === color.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-11">Cancelar</Button>
            <Button type="submit" className="flex-1 rounded-xl h-11 shadow-lg shadow-primary-200">Salvar</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tagData: Partial<Tag>) => {
    setLoading(true);
    try {
      if (editingTag) {
        const { error } = await supabase
          .from('tags')
          .update(tagData)
          .eq('id', editingTag.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tags')
          .insert([tagData]);
        if (error) throw error;
      }

      await fetchTags();
      setIsModalOpen(false);
      setEditingTag(null);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchTags();
      setIsDeleting(null);
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-widest mb-1">
              <Tags className="h-3 w-3" />
              Categorização
           </div>
          <h1 className="text-xl font-bold text-primary-950 font-display">Etiquetas</h1>
          <p className="text-xs text-neutral-500 mt-1">Gerencie as etiquetas para organizar seus contatos.</p>
        </div>
        <Button 
          onClick={() => { setEditingTag(null); setIsModalOpen(true); }}
          className="h-10 px-4 gap-2 rounded-2xl shadow-lg text-xs font-bold"
        >
          <Plus className="h-4 w-4" />
          Nova Etiqueta
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <AnimatePresence>
          {tags.map((tag, index) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  tag.color
                )}>
                  {tag.name}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingTag(tag); setIsModalOpen(true); }}
                    className="p-1 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsDeleting(tag.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isDeleting === tag.id && (
                <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-[10px] font-bold text-neutral-900 mb-3 uppercase tracking-widest">Excluir?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Excluir
                    </button>
                    <button
                      onClick={() => setIsDeleting(null)}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-[9px] font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Criada em</span>
                <span className="text-[11px] font-semibold text-neutral-700">
                  {new Date(tag.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <TagModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTag(null); }}
        onSave={handleSave}
        tag={editingTag}
      />
    </div>
  );
};
