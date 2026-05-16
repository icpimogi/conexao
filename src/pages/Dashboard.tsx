import React from 'react';
import { 
  Users, 
  Building2, 
  MessageSquare, 
  TrendingUp, 
  Tags, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-3">
      <div className={cn("p-2.5 rounded-2xl", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className={cn(
        "flex items-center text-[10px] font-bold px-2 py-1 rounded-full",
        change >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
      )}>
        {change >= 0 ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
        {Math.abs(change)}%
      </div>
    </div>
    <h3 className="text-neutral-500 text-xs font-medium">{title}</h3>
    <p className="text-2xl font-bold text-neutral-900 mt-1 font-display tracking-tight">{value}</p>
  </div>
);

import { cn } from '@/src/lib/utils';
import { supabase, checkTablesReady } from '../lib/supabase';

export const Dashboard: React.FC = () => {
  const [supabaseStatus, setSupabaseStatus] = React.useState<{ ready?: boolean; error?: string; details?: any }>({});
  const [checking, setChecking] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalContacts: 0,
    totalBranches: 0,
    totalTags: 0,
    contactsGrowth: 0,
    branchesGrowth: 0,
    activityToday: 0
  });

  const fetchStats = async () => {
    try {
      const [
        { count: contactCount },
        { count: branchCount },
        { count: tagCount },
        { count: activityTodayCount }
      ] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('branches').select('*', { count: 'exact', head: true }),
        supabase.from('tags').select('*', { count: 'exact', head: true }),
        supabase.from('activities').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      setStats({
        totalContacts: contactCount || 0,
        totalBranches: branchCount || 0,
        totalTags: tagCount || 0,
        contactsGrowth: 0, // Poderia ser calculado comparando com mês anterior
        branchesGrowth: 0,
        activityToday: activityTodayCount || 0
      });
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  React.useEffect(() => {
    const checkStatus = async () => {
      setChecking(true);
      const status = await checkTablesReady();
      setSupabaseStatus(status);
      if (status.ready) {
        fetchStats();
      }
      setChecking(false);
    };
    checkStatus();
  }, []);

  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary-950 font-display">Olá, Administrador!</h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-bold">Painel de Controle Principal</p>
        </div>
        <div className="flex items-center gap-2">
          {checking && <div className="text-[10px] text-neutral-400 font-bold uppercase animate-pulse">Verificando Banco...</div>}
          {supabaseStatus.ready && (
            <div className="bg-green-50 text-green-600 px-3 py-1 rounded-xl text-[10px] font-bold border border-green-100 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              SISTEMA ONLINE
            </div>
          )}
          {!checking && !supabaseStatus.ready && (
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-[10px] font-bold border border-amber-200 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              CONFIGURAÇÃO PENDENTE
            </div>
          )}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-neutral-100 shadow-sm ml-2">
            <Clock className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-neutral-600">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Contatos" 
          value={stats.totalContacts.toLocaleString()} 
          change={stats.contactsGrowth} 
          icon={Users} 
          color="bg-primary-100 text-primary-600"
        />
        <StatCard 
          title="Total de Filiais" 
          value={stats.totalBranches} 
          change={stats.branchesGrowth} 
          icon={Building2} 
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="Etiquetas Ativas" 
          value={stats.totalTags} 
          change={stats.totalTags > 0 ? 10 : 0} 
          icon={Tags} 
          color="bg-amber-100 text-amber-600"
        />
        <StatCard 
          title="Atividade Hoje" 
          value={stats.activityToday} 
          change={12} 
          icon={MessageSquare} 
          color="bg-emerald-100 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-900">Crescimento de Contatos</h2>
            <select className="text-xs border-none bg-neutral-50 rounded-lg px-2 py-1 outline-none font-medium">
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[40, 60, 45, 80, 70, 90, 85].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                className={cn(
                  "flex-1 rounded-t-xl transition-all duration-500",
                  i === 5 ? "bg-primary-600" : "bg-primary-100"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map(d => (
              <span key={d} className="text-[10px] font-bold text-neutral-400">{d}</span>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
           <div className="h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center overflow-hidden p-3">
              <Logo size="md" className="opacity-80" />
           </div>
           <h3 className="font-display font-bold text-base text-primary-900 uppercase tracking-widest">Conexão ICPI</h3>
           <p className="text-xs text-neutral-500 px-4">Mantenha seu banco de dados sempre atualizado para melhores resultados.</p>
           <button className="w-full py-2.5 bg-neutral-900 text-white rounded-2xl text-xs font-bold hover:bg-neutral-800 transition-colors">
              Explorar Relatórios
           </button>
        </div>
      </div>
    </div>
  );
};
