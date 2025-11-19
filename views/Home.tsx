
import React, { useState, useEffect } from 'react';
import { Asset, User, ViewState, NFT } from '../types';
import { View, Text, ScrollView, TouchableOpacity, Row, Image } from '../components/native';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard, Wallet, Bell, RefreshCw, Grid, List, Layers } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cryptoService } from '../services/cryptoService';

interface HomeProps {
  assets: Asset[];
  totalBalance: number;
  user: User | null;
  onLogout: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onAssetClick?: (id: string) => void;
  onNavigate?: (view: ViewState, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ assets, totalBalance, user, onLogout, isRefreshing, onRefresh, onAssetClick, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'nfts'>('crypto');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  useEffect(() => {
    if (activeTab === 'nfts' && nfts.length === 0) {
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

  return (
    <View className="flex-1 h-full">
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center z-10">
         <Row className="items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-surface border border-white/10 items-center justify-center overflow-hidden">
               {user?.profileImage ? (
                 <Image source={user.profileImage} className="w-full h-full object-cover" />
               ) : (
                 <Text className="font-bold text-lg">{user?.name[0]}</Text>
               )}
            </View>
            <View>
               <Text className="text-xs text-slate-400">Welcome back,</Text>
               <Text className="text-sm font-bold">{user?.name.split(' ')[0]}</Text>
            </View>
         </Row>
         <Row className="gap-3">
            {onRefresh && (
                <TouchableOpacity 
                    onPress={onRefresh}
                    className={`p-2.5 bg-surface rounded-full border border-white/5 ${isRefreshing ? 'opacity-50' : ''}`}
                    disabled={isRefreshing}
                >
                   <RefreshCw size={20} className={`text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </TouchableOpacity>
            )}
            <TouchableOpacity className="p-2.5 bg-surface rounded-full border border-white/5">
               <Bell size={20} className="text-white" />
               <View className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-surface" />
            </TouchableOpacity>
         </Row>
      </View>

      <ScrollView className="flex-1" contentContainerStyle="pb-32 px-5">
        
        {/* Balance Card */}
        <View className="mt-2 py-6">
          <Text className="text-slate-400 text-sm font-medium mb-1">Total Balance</Text>
          <Text className="text-5xl font-bold tracking-tighter mb-4">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Row className="items-center gap-2 bg-emerald-500/10 self-start px-3 py-1.5 rounded-full border border-emerald-500/20">
            <ArrowUpRight size={16} className="text-emerald-400" />
            <Text className="text-emerald-400 text-xs font-bold">+$1,240.50 (2.4%)</Text>
          </Row>
        </View>

        {/* Quick Actions */}
        <Row className="justify-between mb-8">
          {[
            { icon: ArrowUpRight, label: 'Send', color: 'bg-primary', view: ViewState.SEND },
            { icon: ArrowDownLeft, label: 'Receive', color: 'bg-slate-800', view: ViewState.RECEIVE },
            { icon: ArrowLeftRight, label: 'Swap', color: 'bg-slate-800', view: ViewState.SWAP },
            { icon: CreditCard, label: 'Buy', color: 'bg-slate-800', view: ViewState.MARKET },
          ].map((action, i) => (
            <TouchableOpacity 
               key={i} 
               className="items-center gap-2"
               onPress={() => onNavigate && onNavigate(action.view)}
            >
              <View className={`w-16 h-16 rounded-[20px] ${action.color} items-center justify-center shadow-lg shadow-black/40`}>
                <action.icon className="text-white" size={26} />
              </View>
              <Text className="text-xs font-medium text-slate-300">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Row>

        {/* Tabs */}
        <View className="flex-row mb-6 p-1 bg-surface rounded-xl border border-white/5">
           <TouchableOpacity 
             onPress={() => setActiveTab('crypto')}
             className={`flex-1 py-2.5 items-center rounded-lg flex-row justify-center gap-2 ${activeTab === 'crypto' ? 'bg-white/10' : ''}`}
           >
              <List size={16} className={activeTab === 'crypto' ? 'text-white' : 'text-slate-400'} />
              <Text className={`text-sm font-bold ${activeTab === 'crypto' ? 'text-white' : 'text-slate-400'}`}>Tokens</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={() => setActiveTab('nfts')}
             className={`flex-1 py-2.5 items-center rounded-lg flex-row justify-center gap-2 ${activeTab === 'nfts' ? 'bg-white/10' : ''}`}
           >
              <Grid size={16} className={activeTab === 'nfts' ? 'text-white' : 'text-slate-400'} />
              <Text className={`text-sm font-bold ${activeTab === 'nfts' ? 'text-white' : 'text-slate-400'}`}>Collectibles</Text>
           </TouchableOpacity>
        </View>

        {/* Content Switch */}
        {activeTab === 'crypto' ? (
          <View className="mb-6">
            <Row className="justify-between items-center mb-4">
              <Text className="text-lg font-bold">Your Assets</Text>
              <TouchableOpacity onPress={() => onNavigate && onNavigate(ViewState.MARKET)}>
                <Text className="text-primary text-sm font-bold">See All</Text>
              </TouchableOpacity>
            </Row>
            
            {assets.length === 0 ? (
               <View className="items-center py-10">
                  {isRefreshing ? <Text className="text-slate-500">Loading market data...</Text> : <Text className="text-slate-500">No assets found.</Text>}
               </View>
            ) : (
                <View className="gap-3">
                  {assets.map((asset) => (
                    <TouchableOpacity 
                      key={asset.id} 
                      onPress={() => onAssetClick && onAssetClick(asset.id)}
                      className="flex-row items-center justify-between p-4 bg-surface/50 border border-white/5 rounded-2xl active:bg-surface/80"
                    >
                      <Row className="items-center gap-4">
                        <View className={`w-11 h-11 rounded-full items-center justify-center ${asset.color}`}>
                          <Text className="font-bold text-white">{asset.symbol ? asset.symbol[0] : '?'}</Text>
                        </View>
                        <View>
                          <Text className="font-bold text-base">{asset.name}</Text>
                          <Text className="text-xs text-slate-400">{asset.balance} {asset.symbol}</Text>
                        </View>
                      </Row>
                      
                      <View className="w-20 h-10 opacity-50">
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
                        <Text className="font-bold text-base">${(asset.price * asset.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
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
          <View className="mb-6">
             <Row className="justify-between items-center mb-4">
               <Text className="text-lg font-bold">Your Gallery</Text>
               <View className="px-2 py-1 bg-surface rounded text-xs text-slate-400 border border-white/10">
                 {nfts.length} items
               </View>
             </Row>

             {isLoadingNFTs ? (
                <View className="items-center py-20">
                   <Text className="text-slate-500">Loading collectibles...</Text>
                </View>
             ) : (
                <View className="grid grid-cols-2 gap-3">
                   {nfts.map(nft => (
                      <TouchableOpacity 
                         key={nft.id}
                         onPress={() => handleNFTClick(nft)}
                         className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden"
                      >
                         <View className="aspect-square w-full bg-slate-800 relative">
                            <Image source={nft.imageUrl} className="w-full h-full object-cover" />
                            <View className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                               <Text className="text-[10px] font-bold text-white">{nft.chain}</Text>
                            </View>
                         </View>
                         <View className="p-3">
                            <Text className="font-bold text-xs mb-1 truncate">{nft.name}</Text>
                            <Text className="text-[10px] text-slate-400 truncate">{nft.collectionName}</Text>
                            <Row className="mt-2 items-center gap-1">
                               <Layers size={10} className="text-indigo-400" />
                               <Text className="text-[10px] font-bold text-indigo-400">{nft.floorPrice} {nft.currency}</Text>
                            </Row>
                         </View>
                      </TouchableOpacity>
                   ))}
                </View>
             )}
          </View>
        )}
        
        {/* Promo Banner */}
        <TouchableOpacity className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-5 mb-4 active:scale-[0.99]">
           <View className="z-10">
              <Text className="font-bold text-lg mb-1">Invite Friends</Text>
              <Text className="text-sm text-white/80 mb-4 max-w-[70%]">Earn $20 in Bitcoin for every friend who joins Nova.</Text>
              <View className="bg-white self-start px-4 py-2 rounded-full shadow-sm">
                 <Text className="text-indigo-600 text-xs font-bold">Share Invite Link</Text>
              </View>
           </View>
           <View className="absolute -right-4 -bottom-8 opacity-30 rotate-12">
              <Wallet size={140} className="text-white" />
           </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
