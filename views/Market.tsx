
import React, { useState } from 'react';
import { Asset } from '../types';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';
import { Search, Star } from 'lucide-react';

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
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Text className="text-2xl font-bold mt-4 mb-6">Market</Text>
        
        <View className="mb-6 relative">
          <Search className="absolute left-4 top-3 text-slate-400 z-10" size={20} />
          <TextInput 
            placeholder="Search coins..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pb-1">
          {['All', 'Watchlist', 'Gainers', 'Losers', 'New'].map((tab, i) => (
              <TouchableOpacity 
                key={tab} 
                className={`px-4 py-1.5 rounded-full mr-2 border ${i === 0 ? 'bg-white border-white' : 'bg-surface border-white/5'}`}
              >
                <Text className={`text-sm font-medium whitespace-nowrap ${i === 0 ? 'text-black' : 'text-slate-300'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
          ))}
        </ScrollView>

        <View>
          <Row className="justify-between px-2 mb-2">
            <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider">Name</Text>
            <Text className="text-xs text-slate-500 font-medium uppercase tracking-wider text-right">Price / 24h</Text>
          </Row>
          
          <View className="gap-1">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="py-3 px-4">
                <Row className="items-center justify-between">
                    <Row className="items-center gap-3">
                      <Star size={16} className="text-slate-600" />
                      <View className={`w-8 h-8 rounded-full items-center justify-center ${asset.color}`}>
                        <Text className="text-xs font-bold text-white">{asset.symbol[0]}</Text>
                      </View>
                      <View>
                        <Text className="font-bold text-sm text-white">{asset.name}</Text>
                        <Text className="text-xs text-slate-400">{asset.symbol}</Text>
                      </View>
                    </Row>
                    <View className="items-end">
                      <Text className="font-semibold text-sm text-white">${asset.price.toLocaleString()}</Text>
                      <Text className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                      </Text>
                    </View>
                </Row>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
