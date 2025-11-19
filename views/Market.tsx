
import React, { useState } from 'react';
import { Asset } from '../types';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';
import { Search, Star, TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MarketProps {
  assets: Asset[];
}

export const Market: React.FC<MarketProps> = ({ assets }) => {
  const [search, setSearch] = useState('');

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 h-full bg-black">
      {/* Header Area */}
      <View className="px-5 pt-6 pb-4 bg-black/80 backdrop-blur-lg border-b border-white/5 sticky top-0 z-20">
          <Text className="text-2xl font-bold text-white mb-4">Market</Text>
          
          {/* Search Bar */}
          <View className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
            <TextInput 
              placeholder="Search assets..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-slate-500 focus:border-primary/50 transition-colors"
            />
          </View>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-1">
            {['All Assets', 'Watchlist', 'Top Gainers', 'New Listings', 'Metaverse'].map((tab, i) => (
                <TouchableOpacity 
                  key={tab} 
                  className={`px-4 py-2 rounded-full mr-2 border transition-all ${i === 0 ? 'bg-white border-white' : 'bg-surface border-white/10 active:bg-white/10'}`}
                >
                  <Text className={`text-xs font-bold whitespace-nowrap ${i === 0 ? 'text-black' : 'text-slate-400'}`}>
                    {tab}
                  </Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
      </View>

      <ScrollView contentContainerStyle="p-5 pb-24">
        <View>
          {/* Column Headers - Hidden on mobile, visible on large screens if we wanted a table, 
              but we are doing a Card Grid for better touch targets */}
          
          <View className="gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {filteredAssets.map((asset) => {
              const isPositive = asset.change24h >= 0;
              const color = isPositive ? "#10b981" : "#ef4444";

              return (
                <Card key={asset.id} className="py-3 px-4 active:bg-surface/80 transition-colors border-white/5 hover:border-white/10 h-full">
                  <Row className="items-center justify-between h-12">
                      {/* Left: Icon & Name */}
                      <Row className="items-center gap-3 w-[35%]">
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${asset.color} shadow-sm`}>
                          <Text className="text-xs font-bold text-white">{asset.symbol[0]}</Text>
                        </View>
                        <View>
                          <Text className="font-bold text-sm text-white">{asset.symbol}</Text>
                          <Text className="text-[10px] text-slate-400 truncate max-w-[80px]">{asset.name}</Text>
                        </View>
                      </Row>

                      {/* Center: Sparkline Chart */}
                      <View className="w-[30%] h-12 px-1 -my-1 opacity-80">
                          {asset.chartData && asset.chartData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={asset.chartData}>
                                 <defs>
                                   <linearGradient id={`color-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                                     <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                   </linearGradient>
                                 </defs>
                                 <Area 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke={color} 
                                  fill={`url(#color-${asset.id})`} 
                                  strokeWidth={2} 
                                  isAnimationActive={false}
                                 />
                               </AreaChart>
                             </ResponsiveContainer>
                          ) : (
                              <View className="h-full w-full items-center justify-center">
                                  <Text className="text-[9px] text-slate-700">No Data</Text>
                              </View>
                          )}
                      </View>
      
                      {/* Right: Price */}
                      <View className="items-end w-[35%]">
                        <Text className="font-bold text-sm text-white tracking-wide">${asset.price.toLocaleString()}</Text>
                        <View className={`flex-row items-center gap-1 ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'} px-1.5 py-0.5 rounded mt-0.5`}>
                             {isPositive ? <TrendingUp size={10} className="text-emerald-400" /> : <TrendingDown size={10} className="text-red-400" />}
                             <Text className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                 {Math.abs(asset.change24h)}%
                             </Text>
                        </View>
                      </View>
                  </Row>
                </Card>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
