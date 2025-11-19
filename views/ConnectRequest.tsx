import React, { useState } from 'react';
import { ViewState, User, ConnectedApp } from '../types';
import { authService } from '../services/authService';
import { ShieldCheck, Check, X, ChevronLeft, AlertCircle, Globe, Info } from 'lucide-react';

interface ConnectRequestProps {
  user: User;
  requestData: Partial<ConnectedApp>;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const ConnectRequest: React.FC<ConnectRequestProps> = ({ user, requestData, onNavigate, onUpdateUser }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      const newApp: ConnectedApp = {
        id: requestData.id || 'app_' + Date.now(),
        name: requestData.name || 'Unknown App',
        domain: requestData.domain || 'unknown.com',
        icon: requestData.icon || '🌐',
        permissions: requestData.permissions || ['view_profile'],
        connectedAt: Date.now()
      };

      const updatedUser = await authService.authorizeApp(user.id, newApp);
      onUpdateUser(updatedUser);
      onNavigate(ViewState.CONNECTED_APPS);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col animate-in slide-in-from-bottom duration-500">
      <button 
        onClick={() => onNavigate(ViewState.CONNECTED_APPS)}
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mb-4"
      >
        <ChevronLeft size={20} /> Cancel
      </button>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
        
        {/* Logos */}
        <div className="flex items-center gap-4 mb-4">
           <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-3xl shadow-lg">
              {requestData.icon}
           </div>
           <div className="w-8 h-px bg-slate-600 border-t border-dashed border-slate-400" />
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="font-bold text-xl text-white">N</span>
           </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Connect to {requestData.name}?</h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-white/5 text-xs text-slate-400">
             <Globe size={12} />
             {requestData.domain}
          </div>
        </div>

        <div className="w-full bg-surface/50 border border-white/10 rounded-2xl p-4 text-left space-y-3">
           <div className="flex items-start gap-3">
              <Info className="text-slate-400 mt-0.5" size={18} />
              <p className="text-sm text-slate-300">This application is requesting permission to:</p>
           </div>
           <ul className="space-y-3 pl-2">
              <li className="flex items-center gap-3 text-sm font-medium">
                 <div className="p-1 bg-emerald-500/20 rounded-full">
                   <Check size={12} className="text-emerald-400" />
                 </div>
                 View your username and avatar
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                 <div className="p-1 bg-emerald-500/20 rounded-full">
                   <Check size={12} className="text-emerald-400" />
                 </div>
                 View your public wallet address
              </li>
              {requestData.permissions?.includes('view_balance') && (
                <li className="flex items-center gap-3 text-sm font-medium">
                   <div className="p-1 bg-yellow-500/20 rounded-full">
                     <AlertCircle size={12} className="text-yellow-400" />
                   </div>
                   View your asset balances
                </li>
              )}
           </ul>
        </div>

        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3 text-left">
           <ShieldCheck className="text-indigo-400 flex-shrink-0" size={20} />
           <p className="text-xs text-indigo-200/80">
             Nova Wallet does not share your private keys or recovery phrase with any connected application.
           </p>
        </div>

      </div>

      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={handleAllow}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
        >
           {isLoading ? 'Connecting...' : 'Authorize'}
        </button>
        <button
          onClick={() => onNavigate(ViewState.CONNECTED_APPS)}
          className="w-full bg-surface border border-white/10 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};