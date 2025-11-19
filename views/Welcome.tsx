import React from 'react';
import { ViewState } from '../types';
import { Wallet, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

interface WelcomeProps {
  onNavigate: (view: ViewState) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col justify-between p-6 relative overflow-hidden animate-in fade-in duration-700">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="mt-12 space-y-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
          <Wallet className="text-white" size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            The future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              crypto wealth
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage assets, track markets, and get AI-powered insights in one secure place.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="p-1 bg-emerald-500/10 rounded-full">
                <ShieldCheck size={14} className="text-emerald-400" />
            </div>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <div className="p-1 bg-blue-500/10 rounded-full">
                <Globe size={14} className="text-blue-400" />
            </div>
            <span>Global</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => onNavigate(ViewState.SIGNUP)}
          className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          Create New Wallet <ArrowRight size={18} />
        </button>
        
        <button
          onClick={() => onNavigate(ViewState.LOGIN)}
          className="w-full bg-surface hover:bg-slate-800 text-white font-semibold py-4 rounded-xl border border-white/10 transition-all active:scale-95"
        >
          I already have a wallet
        </button>
      </div>
    </div>
  );
};