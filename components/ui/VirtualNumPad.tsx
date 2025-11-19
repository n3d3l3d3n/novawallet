
import React from 'react';
import { Delete } from 'lucide-react';

interface VirtualNumPadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
  className?: string;
}

export const VirtualNumPad: React.FC<VirtualNumPadProps> = ({ onPress, onDelete, className = '' }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className={`grid grid-cols-3 gap-3 p-4 ${className}`}>
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onPress(k)}
          className="h-14 bg-surface/50 hover:bg-white/10 border border-white/5 rounded-xl text-xl font-bold text-white transition-all active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-md"
        >
          {k}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="h-14 bg-surface/50 hover:bg-red-500/20 border border-white/5 rounded-xl text-white transition-all active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-md group"
      >
        <Delete size={24} className="text-slate-300 group-hover:text-red-400" />
      </button>
    </div>
  );
};
