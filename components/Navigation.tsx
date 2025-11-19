import React from 'react';
import { ViewState } from '../types';
import { Home, BarChart2, Sparkles, Wallet } from 'lucide-react';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewState.HOME, icon: Home, label: 'Home' },
    { id: ViewState.MARKET, icon: BarChart2, label: 'Market' },
    { id: ViewState.ADVISOR, icon: Sparkles, label: 'Nova AI' },
    { id: ViewState.WALLET, icon: Wallet, label: 'Wallet' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-white/10 px-6 py-4 pb-8 z-50 max-w-md mx-auto">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-primary -translate-y-1' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-primary/20' : 'bg-transparent'}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};