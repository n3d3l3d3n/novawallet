import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 ${className} ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}
    >
      {children}
    </div>
  );
};