import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const [error, setError] = React.useState(false);
  const logoPath = 'https://icpimogi.com/wp-content/uploads/2026/05/logo_conexao.png';

  const containerSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-24 w-24'
  };

  if (error) {
    return (
      <div className={cn(
        "bg-primary-600 rounded-xl flex items-center justify-center text-white shrink-0",
        containerSizes[size],
        className
      )}>
        <Zap className={cn(
          size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-12 w-12'
        )} />
      </div>
    );
  }

  return (
    <img 
      src={logoPath} 
      alt="Conexão ICPI Logo" 
      className={cn(
        size === 'sm' ? 'h-8 w-auto' : size === 'md' ? 'h-10 w-auto' : 'h-24 w-auto', 
        "object-contain",
        className
      )} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
};
