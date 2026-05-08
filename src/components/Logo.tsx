import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const [error, setError] = React.useState(false);
  // Try different potential paths for the artifact, latest first
  const logoPaths = [
    '/artifact/input_file_2.png',
    '/artifact/input_file_1.png',
    '/artifact/input_file_0.png',
    'input_file_0.png',
    './input_file_0.png'
  ];
  const [currentPathIndex, setCurrentPathIndex] = React.useState(0);

  const containerSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const handleError = () => {
    if (currentPathIndex < logoPaths.length - 1) {
      setCurrentPathIndex(prev => prev + 1);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className={cn(
        "bg-primary-600 rounded-xl flex items-center justify-center text-white shrink-0",
        containerSizes[size],
        className
      )}>
        <Zap className={cn(
          size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-10 w-10'
        )} />
      </div>
    );
  }

  return (
    <img 
      src={logoPaths[currentPathIndex]} 
      alt="Conexão ICPI Logo" 
      className={cn(
        size === 'sm' ? 'h-8 w-auto' : size === 'md' ? 'h-10 w-auto' : 'h-16 w-auto', 
        "object-contain",
        className
      )} 
      referrerPolicy="no-referrer"
      onError={handleError}
    />
  );
};
