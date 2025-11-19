
import React, { useState, useEffect } from 'react';
import { BrowserTab, Chain, DAppTransaction } from '../types';
import { Search, Shield, Lock, Globe, RefreshCw, ChevronLeft, ChevronRight, Plus, X, ExternalLink, Settings, AlertTriangle, EyeOff, Home, Wallet, ArrowRightLeft } from 'lucide-react';
import { View, Text, TouchableOpacity, Row, TextInput, ScrollView, Image } from '../components/native';

interface DarkBrowserProps {
  onConnect?: (url: string, name: string, icon: string) => void;
  onSign?: (tx: DAppTransaction) => void;
  connectedDomains?: string[];
}

export const DarkBrowser: React.FC<DarkBrowserProps> = ({ onConnect, onSign, connectedDomains = [] }) => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab_1', url: 'about:home', title: 'Web3 Hub', isActive: true, isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab_1');
  const [urlInput, setUrlInput] = useState('');
  const [showTabs, setShowTabs] = useState(false);

  // Mock DApps
  const DAPPS = [
     { name: 'Uniswap', url: 'https://app.uniswap.org', icon: '🦄', desc: 'Swap tokens' },
     { name: 'OpenSea', url: 'https://opensea.io', icon: '⛵', desc: 'NFT Marketplace' },
     { name: 'Aave', url: 'https://app.aave.com', icon: '👻', desc: 'Lending Protocol' },
     { name: 'Nova Swap', url: 'http://novaswap.onion', icon: '🌌', desc: 'Private DEX' },
  ];

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const isConnected = connectedDomains.includes(new URL(activeTab.url.startsWith('http') ? activeTab.url : 'http://example.com').hostname);

  // Sync URL input
  useEffect(() => {
    setUrlInput(activeTab.url === 'about:home' ? '' : activeTab.url);
  }, [activeTab.url, activeTabId]);

  const handleNavigate = (url: string) => {
    let finalUrl = url;
    if (url === 'about:home') {
        finalUrl = 'about:home';
    } else if (!url.startsWith('http') && !url.startsWith('about:')) {
       if (url.includes('.') || url.includes('onion')) {
         finalUrl = 'https://' + url;
       } else {
         finalUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(url);
       }
    }

    setTabs(prev => prev.map(t => 
       t.id === activeTabId 
         ? { ...t, url: finalUrl, title: getDomain(finalUrl), isLoading: finalUrl !== 'about:home' } 
         : t
    ));

    if (finalUrl !== 'about:home') {
        setTimeout(() => {
           setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, isLoading: false } : t));
        }, 1500);
    }
  };

  const getDomain = (url: string) => {
     if (url === 'about:home') return 'Web3 Hub';
     try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '');
     } catch { return url; }
  };

  const handleNewTab = () => {
    const newId = 'tab_' + Date.now();
    const newTab: BrowserTab = { id: newId, url: 'about:home', title: 'Web3 Hub', isActive: true, isLoading: false };
    setTabs(prev => prev.map(t => ({ ...t, isActive: false })).concat(newTab));
    setActiveTabId(newId);
    setShowTabs(false);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      handleNavigate('about:home');
      return;
    }
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (id === activeTabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  // --- Mock DApp Logic ---
  const triggerConnect = () => {
      if (onConnect) {
          const domain = new URL(activeTab.url).hostname;
          const dapp = DAPPS.find(d => activeTab.url.includes(d.url)) || { name: domain, icon: '🌐' };
          onConnect(activeTab.url, dapp.name, dapp.icon);
      }
  };

  const triggerSwap = () => {
      if (onSign) {
          onSign({
              dAppName: 'Uniswap',
              dAppUrl: 'https://app.uniswap.org',
              dAppIcon: '🦄',
              action: 'swap',
              network: 'Ethereum',
              details: {
                  fromAmount: 1.0,
                  fromSymbol: 'ETH',
                  toAmount: 1850.50,
                  toSymbol: 'USDC',
                  gasFee: 4.20
              }
          });
      }
  };

  // Render specific content based on URL
  const renderPageContent = () => {
     if (activeTab.url === 'about:home') {
         return (
             <View className="flex-1 p-6 items-center pt-20">
                 <View className="mb-8 items-center">
                     <Shield size={48} className="text-primary mb-2" />
                     <Text className="text-2xl font-bold text-white">Nova Secure Browser</Text>
                     <Text className="text-slate-400 text-sm">Tor-enabled • Tracker Free • Web3 Ready</Text>
                 </View>
                 
                 <View className="w-full max-w-md">
                     <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Favorites</Text>
                     <div className="grid grid-cols-4 gap-4">
                         {DAPPS.map((dapp, i) => (
                             <TouchableOpacity 
                                key={i} 
                                onPress={() => handleNavigate(dapp.url)}
                                className="items-center gap-2"
                             >
                                 <View className="w-14 h-14 bg-surface border border-white/10 rounded-2xl items-center justify-center shadow-lg hover:bg-white/5 transition-colors">
                                     <Text className="text-2xl">{dapp.icon}</Text>
                                 </View>
                                 <Text className="text-xs text-slate-300">{dapp.name}</Text>
                             </TouchableOpacity>
                         ))}
                     </div>
                 </View>
             </View>
         );
     }

     // Mock Uniswap
     if (activeTab.url.includes('uniswap')) {
         return (
             <View className="flex-1 bg-[#13141b] items-center justify-center p-4">
                 <View className="w-full max-w-sm bg-[#191B1F] rounded-3xl p-4 border border-[#2c2f36] shadow-xl">
                     <Row className="justify-between items-center mb-4">
                         <Text className="text-white font-bold">Swap</Text>
                         <Settings size={18} className="text-slate-400" />
                     </Row>
                     
                     <View className="bg-[#212429] rounded-2xl p-4 mb-1">
                         <Text className="text-slate-400 text-xs mb-2">You pay</Text>
                         <Row className="justify-between">
                             <Text className="text-3xl text-white font-bold">1.0</Text>
                             <div className="bg-[#2c2f36] px-2 py-1 rounded-xl flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-slate-400" />
                                 <Text className="text-white font-bold">ETH</Text>
                             </div>
                         </Row>
                     </View>
                     
                     <View className="items-center -my-3 z-10">
                         <div className="bg-[#191B1F] p-1 rounded-lg border-4 border-[#13141b]">
                             <ArrowRightLeft size={16} className="text-slate-400" />
                         </div>
                     </View>

                     <View className="bg-[#212429] rounded-2xl p-4 mb-4">
                         <Text className="text-slate-400 text-xs mb-2">You receive</Text>
                         <Row className="justify-between">
                             <Text className="text-3xl text-white font-bold">1850.50</Text>
                             <div className="bg-[#2c2f36] px-2 py-1 rounded-xl flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-blue-500" />
                                 <Text className="text-white font-bold">USDC</Text>
                             </div>
                         </Row>
                     </View>

                     {!isConnected ? (
                         <TouchableOpacity onPress={triggerConnect} className="w-full bg-[#4C82FB]/20 py-4 rounded-2xl items-center">
                             <Text className="text-[#4C82FB] font-bold text-lg">Connect Wallet</Text>
                         </TouchableOpacity>
                     ) : (
                         <TouchableOpacity onPress={triggerSwap} className="w-full bg-[#4C82FB] py-4 rounded-2xl items-center">
                             <Text className="text-white font-bold text-lg">Swap</Text>
                         </TouchableOpacity>
                     )}
                 </View>
             </View>
         );
     }

     // Default Fallback
     return (
         <View className="flex-1 items-center justify-center bg-white">
             <Text className="text-black text-lg">Browsing {activeTab.title}...</Text>
             <Text className="text-slate-500 text-sm mt-2">This is a simulated page view.</Text>
         </View>
     );
  };

  return (
    <View className="flex-1 h-full bg-slate-900 flex-col">
      
      {/* Top Bar */}
      <View className="px-3 py-2 bg-slate-800 border-b border-white/5 flex-row items-center gap-2 z-20">
         <TouchableOpacity onPress={() => setShowTabs(!showTabs)} className="w-8 h-8 items-center justify-center border border-white/20 rounded-lg">
             <Text className="text-xs font-bold text-white">{tabs.length}</Text>
         </TouchableOpacity>
         
         <View className="flex-1 h-10 bg-black/40 border border-white/10 rounded-lg flex-row items-center px-3 relative">
             {activeTab.url.includes('onion') ? <Lock size={12} className="text-purple-400 mr-2" /> : <Globe size={12} className="text-slate-400 mr-2" />}
             <TextInput 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(urlInput)}
                className="flex-1 text-white text-sm font-mono bg-transparent border-none outline-none"
                placeholder="Search or enter address"
             />
             {activeTab.isLoading && <RefreshCw size={12} className="animate-spin text-slate-400 ml-2" />}
         </View>

         <TouchableOpacity className="p-2">
             {isConnected ? <div className="w-2 h-2 bg-emerald-500 rounded-full" /> : <Settings size={20} className="text-slate-400" />}
         </TouchableOpacity>
      </View>

      {/* Tab Switcher Overlay */}
      {showTabs && (
         <div className="absolute inset-x-0 top-[56px] bottom-0 bg-slate-900/95 backdrop-blur-xl z-30 p-4 grid grid-cols-2 gap-4 overflow-y-auto content-start animate-in slide-in-from-bottom duration-200">
             {tabs.map(tab => (
                <TouchableOpacity 
                   key={tab.id}
                   onPress={() => { setActiveTabId(tab.id); setShowTabs(false); }}
                   className={`relative aspect-[3/4] rounded-xl border p-3 flex flex-col justify-between ${tab.id === activeTabId ? 'bg-slate-800 border-primary' : 'bg-slate-800/50 border-white/10'}`}
                >
                    <View>
                       <Text className="font-bold text-sm mb-1 line-clamp-1">{tab.title}</Text>
                       <Text className="text-[10px] text-slate-500 line-clamp-1">{tab.url}</Text>
                    </View>
                    <div className="flex-1 my-2 bg-black/20 rounded border border-white/5" />
                    <Row className="justify-between items-center">
                       <TouchableOpacity onPress={(e) => handleCloseTab(tab.id, e)} className="p-1 bg-black/40 rounded-full">
                          <X size={14} className="text-slate-400" />
                       </TouchableOpacity>
                    </Row>
                </TouchableOpacity>
             ))}
             <TouchableOpacity 
                onPress={handleNewTab}
                className="aspect-[3/4] rounded-xl border border-dashed border-white/20 flex items-center justify-center bg-white/5 hover:bg-white/10"
             >
                <Plus size={32} className="text-slate-400" />
             </TouchableOpacity>
         </div>
      )}

      {/* Browser View */}
      <View className="flex-1 relative overflow-hidden">
         {activeTab.isLoading ? (
            <View className="absolute inset-0 bg-slate-900 z-10 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
               <Text className="text-slate-500 font-mono text-xs">Loading...</Text>
            </View>
         ) : (
             <ScrollView className="flex-1 h-full">
                 {renderPageContent()}
             </ScrollView>
         )}
      </View>

      {/* Bottom Controls */}
      <View className="bg-slate-800 border-t border-white/5 p-3 pb-6 safe-bottom">
          <Row className="justify-around items-center">
             <TouchableOpacity onPress={() => handleNavigate('about:home')}><Home size={24} className="text-slate-400" /></TouchableOpacity>
             <TouchableOpacity><ChevronLeft size={24} className="text-slate-500" /></TouchableOpacity>
             <TouchableOpacity><ChevronRight size={24} className="text-slate-500" /></TouchableOpacity>
             <TouchableOpacity onPress={handleNewTab}><Plus size={28} className="text-white" /></TouchableOpacity>
             <TouchableOpacity onPress={() => setShowTabs(true)} className="w-6 h-6 border-2 border-white rounded text-center items-center justify-center">
                <Text className="text-[10px] font-bold text-white">{tabs.length}</Text>
             </TouchableOpacity>
          </Row>
      </View>
    </View>
  );
};
