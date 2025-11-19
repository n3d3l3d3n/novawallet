
import React, { useState, useEffect } from 'react';
import { Asset, User, ViewState, NFT } from '../types';
import { View, Text, ScrollView, TouchableOpacity, Row, Image } from '../components/native';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Bell, Grid, List, Layers, Scan, Search, Plus, Users, Copy, MoreHorizontal, TrendingUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cryptoService } from '../services/cryptoService';
import { QRScanner } from '../components/ui/QRScanner';

interface HomeProps {
  assets: Asset[];
  totalBalance: number;
  user: User | null;
  onLogout: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onAssetClick?: (id: string) => void;
  onNavigate?: (view: ViewState, params?: any) => void;
  onOpenSearch?: () => void;
  onFaucet?: () => void; 
}

export const Home: React.FC<HomeProps> = ({ assets, totalBalance, user, onLogout, isRefreshing, onRefresh, onAssetClick, onNavigate, onOpenSearch, onFaucet }) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'nfts'>('crypto');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (activeTab === 'nfts') {
      loadNFTs();
    }
  }, [activeTab]);

  const loadNFTs = async () => {
    setIsLoadingNFTs(true);
    const data = await cryptoService.getUserNFTs();
    setNfts(data);
    setIsLoadingNFTs(false);
  };

  const handleNFTClick = (nft: NFT) => {
     if (onNavigate) {
         onNavigate(ViewState.NFT_DETAILS, { nftId: nft.id, nft });
     }
  };

  const handleScan = (data: string) => {
     setShowScanner(false);
     if (data.startsWith('0x') && onNavigate) {
         onNavigate(ViewState.SEND); 
     } else {
         alert(`Scanned: ${data}`);
     }
  };

  const copyAddress = () => {
     if (user?.walletAddress) {
         navigator.clipboard.writeText(user.walletAddress);
         alert('Address copied');
     }
  };

  return (
    <View className="flex-1 h-full bg-black">
      {showScanner && (
         <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Header with Enhanced Gradient */}
      <View className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-indigo-900/40 via-purple-900/10 to-transparent -z-0 pointer-events-none" />
      
      <View className="px-6 pt-6 pb-2 flex-row justify-between items-center z-10">
         <Row className="items-center gap-3">
            <TouchableOpacity 
               onPress={() => onNavigate && onNavigate(ViewState.PROFILE)}
               className="w-10 h-10 rounded-full bg-surface border border-white/10 items-center justify-center overflow-hidden active:scale-95 transition-transform"
            >
               {user?.profileImage ? (
                 <Image source={user.profileImage} className="w-full h-full object-cover" />
               ) : (
                 <Text className="font-bold text-lg">{user?.name[0]}</Text>
               )}
            </TouchableOpacity>
            <View>
               <Text className="text-xs text-slate-400 font-medium">Welcome back,</Text>
               <Text className="text-sm font-bold text-white">{user?.name.split(' ')[0]}</Text>
            </View>
         </Row>
         <Row className="gap-3">
            <TouchableOpacity 
              onPress={onOpenSearch}
              className="w-10 h-10 items-center justify-center bg-surface/30 rounded-full border border-white/5 backdrop-blur-md active:bg-surface"
            >
               <Search size={18} className="text-slate-300" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowScanner(true)}
              className="w-10 h-10 items-center justify-center bg-surface/30 rounded-full border border-white/5 backdrop-blur-md active:bg-surface"
            >
               <Scan size={18} className="text-slate-300" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 items-center justify-center bg-surface/30 rounded-full border border-white/5 backdrop-blur-md active:bg-surface relative">
               <Bell size={18} className="text-slate-300" />
               <View className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-surface" />
            </TouchableOpacity>
         </Row>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1" contentContainerStyle="pb-32 px-6">
        
        {/* Responsive Grid Layout for Tablet */}
        <View className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* Left Column (Tablet): Balance & Actions */}
          <View className="lg:w-1/3 lg:sticky lg:top-6">
             {/* Balance Card */}
             <View className="mt-6 py-8 items-center relative bg-surface/10 border border-white/5 rounded-3xl backdrop-blur-sm">
                <Text className="text-slate-400 text-sm font-medium mb-1 tracking-wide">Total Balance</Text>
                <Text className="text-5xl font-bold tracking-tighter mb-4 text-white drop-shadow-lg">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                
                <Row className="items-center gap-2 mb-4">
                   <View className="flex-row items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <Text className="text-xs font-bold text-emerald-400">+2.4% (24h)</Text>
                   </View>
                </Row>

                <Row className="items-center gap-3">
                   <TouchableOpacity onPress={copyAddress} className="flex-row items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 active:bg-white/10">
                       <Text className="text-xs text-slate-300 font-mono truncate max-w-[100px]">
                          {user?.walletAddress || 'No Wallet'}
                       </Text>
                       <Copy size={12} className="text-slate-400" />
                   </TouchableOpacity>
                   {onFaucet && (
                      <TouchableOpacity onPress={onFaucet} className="bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/30 active:bg-indigo-500/30">
                          <Text className="text-[10px] text-indigo-300 font-bold">FAUCET</Text>
                      </TouchableOpacity>
                   )}
                </Row>
             </View>

             {/* Quick Actions */}
             <View className="flex-row justify-between mt-6 gap-3">
                {[
                  { icon: ArrowUpRight, label: 'Send', bg: 'bg-primary', text: 'text-white', view: ViewState.SEND },
                  { icon: ArrowDownLeft, label: 'Receive', bg: 'bg-surface', text: 'text-slate-300', view: ViewState.RECEIVE },
                  { icon: CreditCard, label: 'Buy', bg: 'bg-surface', text: 'text-slate-300', view: ViewState.BUY },
                  { icon: Users, label: 'P2P', bg: 'bg-surface', text: 'text-slate-300', view: ViewState.P2P_MARKET },
                ].map((action, i) => (
                  <TouchableOpacity 
                     key={i} 
                     className="flex-1 items-center gap-2 group"
                     onPress={() => onNavigate && onNavigate(action.view)}
                  >
                    <View className={`w-14 h-14 lg:w-16 lg:h-16 rounded-2xl ${action.bg} items-center justify-center shadow-lg border border-white/5 group-active:scale-95 transition-transform`}>
                      <action.icon className="text-white" size={24} />
                    </View>
                    <Text className="text-xs font-medium text-slate-400">{action.label}</Text>
                  </TouchableOpacity>
                ))}
             </View>
          </View>

          {/* Right Column (Tablet): Assets List */}
          <View className="flex-1 mt-8 lg:mt-0">
             {/* Tabs */}
             <View className="flex-row mb-6 p-1 bg-surface/50 backdrop-blur-sm rounded-xl border border-white/5 max-w-md">
                <TouchableOpacity 
                  onPress={() => setActiveTab('crypto')}
                  className={`flex-1 py-2.5 items-center rounded-lg flex-row justify-center gap-2 transition-all ${activeTab === 'crypto' ? 'bg-white/10 shadow-sm' : 'opacity-60'}`}
                >
                   <List size={16} className={activeTab === 'crypto' ? 'text-white' : 'text-slate-400'} />
                   <Text className={`text-sm font-bold ${activeTab === 'crypto' ? 'text-white' : 'text-slate-400'}`}>Tokens</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setActiveTab('nfts')}
                  className={`flex-1 py-2.5 items-center rounded-lg flex-row justify-center gap-2 transition-all ${activeTab === 'nfts' ? 'bg-white/10 shadow-sm' : 'opacity-60'}`}
                >
                   <Grid size={16} className={activeTab === 'nfts' ? 'text-white' : 'text-slate-400'} />
                   <Text className={`text-sm font-bold ${activeTab === 'nfts' ? 'text-white' : 'text-slate-400'}`}>Collectibles</Text>
                </TouchableOpacity>
             </View>

             {/* Content Switch */}
             {activeTab === 'crypto' ? (
               <View>
                 <Row className="justify-between items-center mb-4 px-1">
                   <Text className="text-lg font-bold text-white">Your Assets</Text>
                   <TouchableOpacity onPress={() => onNavigate && onNavigate(ViewState.MARKET)}>
                     <Text className="text-primary text-sm font-bold">See All</Text>
                   </TouchableOpacity>
                 </Row>
                 
                 {assets.length === 0 ? (
                    <View className="items-center py-12 border border-dashed border-white/10 rounded-2xl bg-surface/20">
                       {isRefreshing ? <Text className="text-slate-500">Syncing blockchain...</Text> : <Text className="text-slate-500">No assets found.</Text>}
                    </View>
                 ) : (
                     <View className="gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
                       {assets.map((asset) => (
                         <TouchableOpacity 
                           key={asset.id} 
                           onPress={() => onAssetClick && onAssetClick(asset.id)}
                           className="flex-row items-center justify-between p-4 bg-surface/40 border border-white/5 rounded-2xl active:bg-surface/60 transition-colors hover:border-white/10"
                         >
                           <Row className="items-center gap-4 flex-1">
                             <View className={`w-11 h-11 rounded-full items-center justify-center ${asset.color} shadow-sm`}>
                               <Text className="font-bold text-white text-lg">{asset.symbol ? asset.symbol[0] : '?'}</Text>
                             </View>
                             <View>
                               <Text className="font-bold text-base text-white">{asset.name}</Text>
                               <Row className="gap-2 items-center mt-0.5">
                                   <Text className="text-xs text-slate-400">{asset.balance.toFixed(4)} {asset.symbol}</Text>
                               </Row>
                             </View>
                           </Row>
                           
                           {/* Mini Chart - Visible on Tablet/Desktop */}
                           <View className="hidden sm:block w-20 h-10 opacity-50 mx-4">
                              {asset.chartData && asset.chartData.length > 0 && (
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={asset.chartData}>
                                      <Area 
                                       type="monotone" 
                                       dataKey="value" 
                                       stroke={asset.change24h >= 0 ? "#10b981" : "#ef4444"} 
                                       fill="transparent" 
                                       strokeWidth={2} 
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                              )}
                           </View>
           
                           <View className="items-end">
                             <Text className="font-bold text-base text-white">${(asset.price * asset.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
                             <Text className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                               {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                             </Text>
                           </View>
                         </TouchableOpacity>
                       ))}
                     </View>
                 )}
               </View>
             ) : (
               <View>
                  <Row className="justify-between items-center mb-4 px-1">
                    <Text className="text-lg font-bold text-white">Your Gallery</Text>
                    <View className="px-2.5 py-1 bg-surface rounded-full text-xs text-slate-400 border border-white/10 font-medium">
                      {nfts.length} items
                    </View>
                  </Row>

                  {isLoadingNFTs ? (
                     <View className="items-center py-20">
                        <Text className="text-slate-500 animate-pulse">Loading collectibles...</Text>
                     </View>
                  ) : (
                     <View className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {nfts.length === 0 && (
                           <div className="col-span-2 items-center py-10 border border-dashed border-white/10 rounded-2xl bg-surface/20">
                               <Text className="text-slate-500">No collectibles found.</Text>
                           </div>
                        )}

                        {nfts.map(nft => (
                           <TouchableOpacity 
                              key={nft.id}
                              onPress={() => handleNFTClick(nft)}
                              className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden active:scale-98 transition-transform hover:border-white/20"
                           >
                              <View className="aspect-square w-full bg-slate-800 relative">
                                 <Image source={nft.imageUrl} className="w-full h-full object-cover" />
                                 <View className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                    <Text className="text-[10px] font-bold text-white">{nft.chain}</Text>
                                 </View>
                              </View>
                              <View className="p-3">
                                 <Text className="font-bold text-xs mb-1 truncate text-white">{nft.name}</Text>
                                 <Text className="text-[10px] text-slate-400 truncate">{nft.collectionName}</Text>
                                 <Row className="mt-2 items-center gap-1.5">
                                    <Layers size={10} className="text-indigo-400" />
                                    <Text className="text-[10px] font-bold text-indigo-300">{nft.floorPrice} {nft.currency}</Text>
                                 </Row>
                              </View>
                           </TouchableOpacity>
                        ))}
                     </View>
                  )}
               </View>
             )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
