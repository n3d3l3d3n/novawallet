
import React from 'react';
import { ViewState } from '../types';
import { Home, BarChart2, Sparkles, Wallet, User, MessageCircle } from 'lucide-react';
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
    { id: ViewState.MESSAGES, icon: MessageCircle, label: 'Social' },
    { id: ViewState.PROFILE, icon: User, label: 'Me' },
  ];

  const isProfileActive = 
    currentView === ViewState.PROFILE || 
    currentView === ViewState.SETTINGS || 
    currentView === ViewState.AFFILIATE || 
    currentView === ViewState.NEWS;
  
  const isMessagesActive = 
    currentView === ViewState.MESSAGES ||
    currentView === ViewState.CHAT;

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-white/5 pb-safe-bottom z-50 shadow-2xl">
      <View className="flex-row justify-between items-center px-4 pt-2 pb-3">
        {navItems.map((item) => {
          let isActive = currentView === item.id;
          if (item.id === ViewState.PROFILE) isActive = isProfileActive;
          if (item.id === ViewState.MESSAGES) isActive = isMessagesActive;
          
          const Icon = item.icon;
          
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onNavigate(item.id)}
              className="items-center justify-center flex-1 min-w-[3.5rem] py-1 group"
            >
              <View className="relative flex items-center justify-center">
                 {/* Active Glow Effect */}
                 {isActive && (
                     <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full transform scale-150" />
                 )}
                 
                 <View className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-transparent transform -translate-y-1' : 'bg-transparent'}`}>
                    <Icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={`transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-sm' : 'text-slate-400 group-hover:text-slate-200'}`} 
                    />
                 </View>

                 {/* Active Indicator Dot */}
                 {isActive && (
                    <View className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_4px_rgba(99,102,241,0.8)]" />
                 )}
              </View>
              
              <Text className={`text-[9px] font-bold mt-1 transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
