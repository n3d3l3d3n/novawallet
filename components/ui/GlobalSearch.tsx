
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Row } from '../native';
import { Search, X, ChevronRight, Wallet, CreditCard, User, BarChart2, Settings, Globe, Image as ImageIcon } from 'lucide-react';
import { ViewState } from '../../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const MOCK_INDEX = [
    { type: 'asset', title: 'Bitcoin', subtitle: 'Crypto', icon: Wallet, view: ViewState.MARKET },
    { type: 'asset', title: 'Ethereum', subtitle: 'Crypto', icon: Wallet, view: ViewState.MARKET },
    { type: 'action', title: 'Send Crypto', subtitle: 'Action', icon: CreditCard, view: ViewState.SEND },
    { type: 'action', title: 'Receive Crypto', subtitle: 'Action', icon: CreditCard, view: ViewState.RECEIVE },
    { type: 'nav', title: 'Profile Settings', subtitle: 'Settings', icon: Settings, view: ViewState.SETTINGS },
    { type: 'nav', title: 'Market Analysis', subtitle: 'AI Advisor', icon: BarChart2, view: ViewState.ADVISOR },
  ];

  useEffect(() => {
     if (query) {
        const lower = query.toLowerCase();
        setResults(MOCK_INDEX.filter(item => item.title.toLowerCase().includes(lower)));
     } else {
        setResults([]);
     }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
       <View className="px-4 pt-12 pb-4 border-b border-white/10 bg-background">
          <Row className="items-center gap-3 bg-surface border border-white/10 rounded-2xl px-4 py-3">
             <Search size={20} className="text-slate-400" />
             <TextInput 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assets, actions, or contacts..."
                className="flex-1 text-lg bg-transparent border-none outline-none text-white placeholder:text-slate-500"
             />
             {query && (
                 <TouchableOpacity onPress={() => setQuery('')}>
                    <X size={18} className="text-slate-400" />
                 </TouchableOpacity>
             )}
          </Row>
       </View>

       <ScrollView className="flex-1 p-4">
          {!query ? (
              <View>
                 <Text className="text-xs font-bold text-slate-500 uppercase mb-3 ml-2">Suggested</Text>
                 <View className="gap-2">
                     {MOCK_INDEX.slice(2, 6).map((item, i) => (
                        <TouchableOpacity 
                            key={i}
                            onPress={() => {
                                onNavigate(item.view);
                                onClose();
                            }}
                            className="flex-row items-center justify-between p-4 bg-surface/50 border border-white/5 rounded-xl active:bg-surface"
                        >
                            <Row className="items-center gap-3">
                                <View className="p-2 bg-white/5 rounded-lg">
                                    <item.icon size={18} className="text-slate-300" />
                                </View>
                                <View>
                                    <Text className="font-bold text-sm">{item.title}</Text>
                                    <Text className="text-[10px] text-slate-400">{item.subtitle}</Text>
                                </View>
                            </Row>
                            <ChevronRight size={16} className="text-slate-600" />
                        </TouchableOpacity>
                     ))}
                 </View>
              </View>
          ) : (
              <View className="gap-2">
                 {results.map((item, i) => (
                    <TouchableOpacity 
                        key={i}
                        onPress={() => {
                            onNavigate(item.view);
                            onClose();
                        }}
                        className="flex-row items-center justify-between p-4 bg-surface/50 border border-white/5 rounded-xl active:bg-surface"
                    >
                        <Row className="items-center gap-3">
                            <View className="p-2 bg-white/5 rounded-lg">
                                <item.icon size={18} className="text-slate-300" />
                            </View>
                            <View>
                                <Text className="font-bold text-sm">{item.title}</Text>
                                <Text className="text-[10px] text-slate-400">{item.subtitle}</Text>
                            </View>
                        </Row>
                        <ChevronRight size={16} className="text-slate-600" />
                    </TouchableOpacity>
                 ))}
                 {results.length === 0 && (
                    <Text className="text-center text-slate-500 mt-10">No results found.</Text>
                 )}
              </View>
          )}
       </ScrollView>

       <TouchableOpacity 
          onPress={onClose}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-surface border border-white/10 rounded-full"
       >
          <Text className="text-sm font-bold text-slate-300">Close</Text>
       </TouchableOpacity>
    </div>
  );
};
