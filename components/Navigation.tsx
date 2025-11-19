import React from 'react';
import { ViewState } from '../types';
import { Home, BarChart2, Sparkles, Wallet, User, MessageCircle, GlobeLock } from 'lucide-react';
import { View, Text, TouchableOpacity } from './native';

interface NavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewState.HOME, icon: Home, label: 'Home' },
    { id: ViewState.MARKET, icon: BarChart2, label: 'Market' },
    { id: ViewState.ADVISOR, icon: Sparkles, label: 'Nova' },
    { id: ViewState.WALLET, icon: Wallet, label: 'Wallet' },
    { id: ViewState.DARK_BROWSER, icon: GlobeLock, label: 'Web3' },
    { id: ViewState.MESSAGES, icon: MessageCircle, label: 'Chat' },
    { id: ViewState.PROFILE, icon: User, label: 'Me' },
  ];

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
    <View className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-white/10 pb-safe-bottom z-50">
      <View className="flex-row justify-between items-center px-2 py-3">
        {navItems.map((item) => {
          let isActive = currentView === item.id;
          if (item.id === ViewState.PROFILE) isActive = isProfileActive;
          if (item.id === ViewState.MESSAGES) isActive = isMessagesActive;
          
          const Icon = item.icon;
          
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onNavigate(item.id)}
              className={`items-center justify-center flex-1 min-w-[3rem] py-1 ${isActive ? '-translate-y-1' : ''}`}
            >
              <View className={`p-1.5 rounded-full ${isActive ? 'bg-primary/20' : 'bg-transparent'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary' : 'text-slate-400'} />
              </View>
              <Text className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};