
import React from 'react';

interface PermissionModalProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onAllowFull: () => void;
  onAllowLimited?: () => void;
  onDeny: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ 
  title, 
  description, 
  icon, 
  onAllowFull, 
  onAllowLimited, 
  onDeny 
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
       <div className="w-full max-w-xs bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
             {icon}
          </div>
          <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
             {description}
          </p>
          
          <div className="w-full space-y-2">
             <button 
               onClick={onAllowFull}
               className="w-full py-3 bg-primary hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors"
             >
               Allow Full Access
             </button>
             {onAllowLimited && (
               <button 
                 onClick={onAllowLimited}
                 className="w-full py-3 bg-surface hover:bg-white/5 text-white font-medium border border-white/10 rounded-xl text-sm transition-colors"
               >
                 Select Photos...
               </button>
             )}
             <button 
               onClick={onDeny}
               className="w-full py-3 text-slate-500 hover:text-white font-medium text-sm transition-colors"
             >
               Don't Allow
             </button>
          </div>
       </div>
    </div>
  );
};
