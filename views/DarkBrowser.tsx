
import React, { useState, useEffect } from 'react';
import { Search, Shield, Lock, Globe, RefreshCw, ChevronLeft, ChevronRight, EyeOff, Radio, ExternalLink } from 'lucide-react';
import { View, Text, TouchableOpacity, Row, TextInput, ScrollView, Image } from '../components/native';

export const DarkBrowser: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [url, setUrl] = useState('https://duckduckgo.com');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnionInfo, setShowOnionInfo] = useState(false);

  // Simulated connection sequence
  useEffect(() => {
    if (!isConnected) {
      const sequence = [
        { msg: 'Establishing encrypted tunnel...', delay: 500 },
        { msg: 'Loading relay descriptors...', delay: 1200 },
        { msg: 'Connecting to Guard Node (France)...', delay: 2000 },
        { msg: 'Routing via Middle Node (Germany)...', delay: 2800 },
        { msg: 'Exiting via Exit Node (Switzerland)...', delay: 3500 },
        { msg: 'Circuit established.', delay: 4000 },
      ];

      let timeouts: NodeJS.Timeout[] = [];

      sequence.forEach(({ msg, delay }) => {
        const timeout = setTimeout(() => {
          setBootLogs(prev => [...prev, msg]);
        }, delay);
        timeouts.push(timeout);
      });

      const finalTimeout = setTimeout(() => {
        setIsConnected(true);
      }, 4500);
      timeouts.push(finalTimeout);

      return () => timeouts.forEach(clearTimeout);
    }
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  if (!isConnected) {
    return (
      <View className="flex-1 h-full p-6 items-center justify-center bg-black">
        <View className="mb-8 relative items-center justify-center">
          <View className="w-24 h-24 border-4 border-emerald-500/30 rounded-full animate-ping absolute" />
          <View className="w-24 h-24 border-4 border-emerald-500/50 rounded-full items-center justify-center bg-black z-10 relative">
             <Globe size={48} className="text-emerald-500" />
          </View>
        </View>
        
        <Text className="text-xl font-bold text-emerald-500 mb-6 tracking-wider">NOVA ONION ROUTING</Text>
        
        <View className="w-full max-w-xs bg-slate-900 border border-emerald-500/20 rounded-lg p-4 h-48 shadow-lg shadow-emerald-500/10">
          <ScrollView className="h-full">
            {bootLogs.map((log, i) => (
              <Row key={i} className="gap-2 mb-1">
                <Text className="text-emerald-400/50 font-mono text-xs">{`>`}</Text>
                <Text className="text-emerald-400/80 font-mono text-xs">{log}</Text>
              </Row>
            ))}
            <View className="w-2 h-4 bg-emerald-500 animate-pulse mt-1" />
          </ScrollView>
        </View>
        
        <Text className="mt-8 text-slate-500 text-xs text-center max-w-xs">
          Connecting to the decentralized network. Your IP address is being masked.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 h-full bg-slate-900 pb-20">
      {/* Address Bar */}
      <View className="p-3 bg-slate-800 border-b border-white/5 shadow-xl z-10">
        <Row className="items-center gap-2">
           <Row className="items-center gap-2">
             <TouchableOpacity><ChevronLeft size={20} className="text-slate-400" /></TouchableOpacity>
             <TouchableOpacity><ChevronRight size={20} className="text-slate-400" /></TouchableOpacity>
           </Row>
           
           <View className="flex-1 relative">
             <View className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                <Lock size={12} className="text-emerald-500" />
             </View>
             <TextInput 
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               className="w-full bg-black/40 border border-emerald-500/20 rounded-lg py-2 pl-8 pr-8 text-sm text-emerald-100 font-mono"
             />
             {url.includes('.onion') && (
                <View className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             )}
           </View>

           <TouchableOpacity onPress={() => setIsLoading(true)} className="p-2">
             <RefreshCw size={18} className={`text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
           </TouchableOpacity>
        </Row>
      </View>

      {/* Browser Content Area (Mocked) */}
      <View className="flex-1 bg-white relative overflow-hidden">
        {/* Tor Circuit Visualizer Overlay */}
        <View className="absolute top-0 left-0 w-full bg-slate-800 py-1 px-3 flex-row justify-between items-center z-10 border-b border-white/10">
           <Row className="items-center gap-2">
             <Row className="items-center gap-1">
                 <Radio size={10} className="text-emerald-400" /> 
                 <Text className="text-emerald-400 text-[10px]">Circuit #8492</Text>
             </Row>
             <Text className="text-slate-500 text-[10px]">|</Text>
             <Text className="text-slate-400 text-[10px]">Guard (FR) → Middle (DE) → Exit (CH)</Text>
           </Row>
           <TouchableOpacity 
             onPress={() => setShowOnionInfo(!showOnionInfo)} 
             className="bg-emerald-500/10 px-2 py-0.5 rounded"
           >
             <Text className="text-emerald-400 text-[10px]">New Identity</Text>
           </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center bg-slate-100">
            <View className="w-12 h-12 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <Text className="text-slate-500 font-mono text-sm">Relaying request...</Text>
          </View>
        ) : (
          <ScrollView className="flex-1 pt-8 h-full">
            {/* Mock Content - DuckDuckGo Style */}
            {url.includes('duckduckgo') ? (
               <View className="items-center pt-20 px-6 w-full">
                  <Image source="https://duckduckgo.com/assets/logo_header.v109.svg" className="h-12 w-48 mb-6 opacity-80" />
                  <View className="w-full max-w-md space-y-4">
                     <Row className="gap-2 items-center border border-slate-300 rounded-lg px-4 py-3 shadow-sm w-full">
                        <Search className="text-slate-400" size={18} />
                        <TextInput placeholder="Search without being tracked" className="flex-1 text-black text-sm placeholder:text-slate-400" />
                     </Row>
                     <View className="items-center">
                        <Text className="text-xs text-slate-500 text-center">Your traffic is routed through the Tor network.</Text>
                        <Text className="text-xs text-slate-500 text-center">IP Address: <Text className="text-emerald-600 font-mono font-bold">192.168.X.X (Hidden)</Text></Text>
                     </View>
                  </View>
                  
                  <View className="mt-12 w-full max-w-md space-y-4">
                     <TouchableOpacity className="p-4 border border-slate-200 rounded-lg">
                        <Text className="text-blue-700 font-medium text-sm underline mb-1">Hidden Wiki - The Onion Router</Text>
                        <Text className="text-green-700 text-xs truncate">http://zqktlwi4fecvo6ri.onion/wiki/index.php/Main_Page</Text>
                        <Text className="text-slate-500 text-xs mt-1">Directory of .onion sites.</Text>
                     </TouchableOpacity>
                     <TouchableOpacity className="p-4 border border-slate-200 rounded-lg">
                        <Text className="text-blue-700 font-medium text-sm underline mb-1">Nova Secure Swap</Text>
                        <Text className="text-green-700 text-xs truncate">http://novaswap72498.onion</Text>
                        <Text className="text-slate-500 text-xs mt-1">Anonymous crypto swapping protocol.</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            ) : (
               <View className="p-8 items-center">
                 <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                    <EyeOff size={32} className="text-slate-400" />
                 </View>
                 <Text className="text-lg font-bold text-slate-800">Simulated View</Text>
                 <Text className="text-slate-500 text-sm mt-2 text-center max-w-xs">
                    This is a UI demonstration of a Tor-enabled browser integration. 
                    Real Tor routing requires native modules not available in this web preview.
                 </Text>
                 <TouchableOpacity 
                   onPress={() => setUrl('https://duckduckgo.com')}
                   className="mt-6 px-4 py-2 bg-emerald-500 rounded-lg shadow-lg"
                 >
                   <Text className="text-white text-sm font-medium">Return to Safety</Text>
                 </TouchableOpacity>
               </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Security Banner */}
      <View className="bg-emerald-900/20 border-t border-emerald-500/20 p-2 items-center justify-center">
         <Row className="gap-4">
             <Row className="items-center gap-1">
                 <Shield size={10} className="text-emerald-500" /> 
                 <Text className="text-emerald-500 text-[10px] font-bold uppercase">JavaScript Disabled</Text>
             </Row>
             <Row className="items-center gap-1">
                 <Globe size={10} className="text-emerald-500" /> 
                 <Text className="text-emerald-500 text-[10px] font-bold uppercase">No Tracking</Text>
             </Row>
         </Row>
      </View>
    </View>
  );
};
