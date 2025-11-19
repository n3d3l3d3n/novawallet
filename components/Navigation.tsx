
import React from 'react';
import { ViewState } from '../types';
import { Home, BarChart2, Sparkles, Wallet, User, MessageCircle, GlobeLock } from 'lucide-react';

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
    { id: ViewState.DARK_BROWSER, icon: GlobeLock, label: 'Dark Web' },
    { id: ViewState.MESSAGES, icon: MessageCircle, label: 'Chat' },
    { id: ViewState.PROFILE, icon: User, label: 'Profile' },
  ];

  // Check if we are in a sub-view of Profile to highlight the Profile tab
  const isProfileActive = 
    currentView === ViewState.PROFILE || 
    currentView === ViewState.SETTINGS || 
    currentView === ViewState.AFFILIATE || 
    currentView === ViewState.NEWS ||
    currentView === ViewState.CONNECTED_APPS;
  
  const isMessagesActive = 
    currentView === ViewState.MESSAGES ||
    currentView === ViewState.CHAT;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-white/10 px-2 py-4 pb-8 z-50 max-w-md mx-auto">
      <div className="flex justify-between items-center px-1">
        {navItems.map((item) => {
          let isActive = currentView === item.id;
          if (item.id === ViewState.PROFILE) isActive = isProfileActive;
          if (item.id === ViewState.MESSAGES) isActive = isMessagesActive;
          
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[3rem] ${isActive ? 'text-primary -translate-y-1' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-primary/20' : 'bg-transparent'}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-medium whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
