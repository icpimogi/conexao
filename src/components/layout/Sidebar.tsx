import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Zap,
  UserCog,
  Lock,
  Tags,
  ChevronUp,
  Database,
  Radio
} from 'lucide-react';
import { useAuth } from '@/src/hooks/useAuth';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileSettingsModal } from '../ProfileSettingsModal';
import { Logo } from '../Logo';

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = React.useState(true);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [settingsModal, setSettingsModal] = React.useState<{ isOpen: boolean; type: 'photo' | 'password' }>({
    isOpen: false,
    type: 'photo'
  });

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Contatos', icon: Users, path: '/contacts' },
    { name: 'Filiais', icon: Building2, path: '/branches' },
    { name: 'Etiquetas', icon: Tags, path: '/tags' },
    { name: 'Automações', icon: Zap, path: '/automations' },
    { name: 'Conexões', icon: Radio, path: '/connections' },
    { name: 'Mensagens', icon: MessageSquare, path: '/messages' },
  ];

  if (user?.role === 'master') {
    navItems.push({ name: 'Usuários', icon: Settings, path: '/users' });
    navItems.push({ name: 'Backup', icon: Database, path: '/database' });
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-white rounded-lg shadow-lg border border-neutral-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-neutral-200 transition-transform duration-300 transform md:translate-x-0 flex flex-col",
        !isOpen && "-translate-x-full"
      )}>
        <div className="p-5">
          <div className="flex items-center gap-3">
             <Logo size="sm" />
             <div className="flex flex-col">
               <span className="font-display font-semibold text-base leading-tight text-primary-900">Conexão ICPI</span>
               <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest whitespace-nowrap">CAMPO DE UTINGA</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-primary-50 text-primary-600 font-semibold" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors",
                "group-hover:text-primary-600"
              )} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-100 space-y-2">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "w-full flex items-center gap-2 p-2 rounded-2xl transition-colors text-left",
              showUserMenu ? "bg-primary-50" : "bg-neutral-50 hover:bg-neutral-100"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase overflow-hidden shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.name?.[0] || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-900 truncate">{user?.name || 'Administrador'}</p>
              <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{user?.role || 'Usuário'}</p>
            </div>
            <ChevronUp className={cn(
              "h-3.5 w-3.5 text-neutral-400 transition-transform duration-200",
              showUserMenu ? "rotate-0" : "rotate-180"
            )} />
          </button>
          
          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-0.5"
              >
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                  onClick={() => setSettingsModal({ isOpen: true, type: 'photo' })}
                >
                  <UserCog className="h-3.5 w-3.5" />
                  Alterar Foto
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                  onClick={() => setSettingsModal({ isOpen: true, type: 'password' })}
                >
                  <Lock className="h-3.5 w-3.5" />
                  Alterar Senha
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-8 text-[11px] text-neutral-400 hover:text-red-500 transition-colors mt-2"
            onClick={signOut}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sair do Sistema</span>
          </Button>
        </div>
      </div>

      <ProfileSettingsModal 
        isOpen={settingsModal.isOpen}
        type={settingsModal.type}
        onClose={() => setSettingsModal(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
