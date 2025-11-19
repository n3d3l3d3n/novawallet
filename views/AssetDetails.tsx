
import React from 'react';
import { Asset, Transaction } from '../types';
import { View, Text, ScrollView, TouchableOpacity, Row } from '../components/native';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface AssetDetailsProps {
  asset: Asset;
  onBack: () => void;
  onSend: () => void;
  onReceive: () => void;
  onAskAI?: (prompt: string) => void;
  transactions: Transaction[];
}

export const AssetDetails: React.FC<AssetDetailsProps> = ({ asset, onBack, onSend, onReceive, onAskAI, transactions }) => {
  
  const handleAskAI = () => {
     if (onAskAI) {
        const prompt = `Analyze ${asset.name} (${asset.symbol}) based on its current price of $${asset.price} and 24h change of ${asset.change24h}%. Should I hold my ${asset.balance} ${asset.symbol}?`;
        onAskAI(prompt);
     }
  };

  return (
    <View className="flex-1 h-full bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={onBack} className="p-2 rounded-full bg-surface border border-white/10">
           <ChevronLeft size={20} className="text-white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">{asset.name}</Text>
        <TouchableOpacity onPress={handleAskAI} className="p-2 rounded-full bg-indigo-500/20 border border-indigo-500/30">
           <Sparkles size={20} className="text-indigo-400" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle="pb-24">
        {/* Price Block */}
        <View className="items-center py-6">
           <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${asset.color} shadow-lg`}>
              <Text className="text-3xl font-bold text-white">{asset.symbol[0]}</Text>
           </View>
           <Text className="text-slate-400 text-sm mb-1">Current Price</Text>
           <Text className="text-4xl font-bold tracking-tight">${asset.price.toLocaleString()}</Text>
           <Row className={`items-center gap-1 px-3 py-1 rounded-full mt-2 ${asset.change24h >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <TrendingUp size={14} className={asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'} />
              <Text className={`text-sm font-bold ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                 {asset.change24h > 0 ? '+' : ''}{asset.change24h}% (24h)
              </Text>
           </Row>
        </View>

        {/* Chart */}
        <View className="h-64 w-full relative mb-8">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={asset.chartData}>
               <defs>
                 <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor={asset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                   <stop offset="95%" stopColor={asset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
               <Area 
                 type="monotone" 
                 dataKey="value" 
                 stroke={asset.change24h >= 0 ? "#10b981" : "#ef4444"} 
                 strokeWidth={3}
                 fill="url(#colorVal)" 
               />
             </AreaChart>
           </ResponsiveContainer>
           {/* Timeframes shim */}
           <Row className="justify-between px-6 mt-2">
              {['1H', '1D', '1W', '1M', '1Y', 'ALL'].map((t, i) => (
                 <Text key={t} className={`text-xs font-bold ${i === 1 ? 'text-white' : 'text-slate-600'}`}>{t}</Text>
              ))}
           </Row>
        </View>

        {/* AI Insight Banner */}
        <TouchableOpacity onPress={handleAskAI} className="mx-5 mb-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-4 flex-row items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Sparkles size={20} className="text-indigo-300" />
            </div>
            <View className="flex-1">
                <Text className="font-bold text-sm text-indigo-100">Ask Nova Analysis</Text>
                <Text className="text-xs text-slate-400">Get AI-driven predictions for {asset.symbol}</Text>
            </View>
            <View className="bg-indigo-500 px-3 py-1.5 rounded-lg">
                <Text className="text-xs font-bold text-white">Ask</Text>
            </View>
        </TouchableOpacity>

        {/* Your Position */}
        <View className="px-5 mb-8">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Position</Text>
           <View className="bg-surface border border-white/10 rounded-2xl p-5">
              <Row className="justify-between items-center mb-4">
                 <View>
                    <Text className="text-sm text-slate-400 mb-1">Total Balance</Text>
                    <Text className="text-2xl font-bold">{asset.balance} {asset.symbol}</Text>
                 </View>
                 <View className="items-end">
                    <Text className="text-sm text-slate-400 mb-1">Value</Text>
                    <Text className="text-2xl font-bold">${(asset.balance * asset.price).toLocaleString(undefined, {maximumFractionDigits: 2})}</Text>
                 </View>
              </Row>
              
              <Row className="gap-3">
                 <TouchableOpacity onPress={onSend} className="flex-1 bg-surface border border-white/10 py-3 rounded-xl flex-row items-center justify-center gap-2">
                    <ArrowUpRight size={18} className="text-white" />
                    <Text className="font-bold text-white">Send</Text>
                 </TouchableOpacity>
                 <TouchableOpacity onPress={onReceive} className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-500/30">
                    <ArrowDownLeft size={18} className="text-white" />
                    <Text className="font-bold text-white">Receive</Text>
                 </TouchableOpacity>
              </Row>
           </View>
        </View>

        {/* Activity */}
        <View className="px-5">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</Text>
           {transactions.length === 0 ? (
              <View className="items-center py-8 border border-dashed border-white/10 rounded-xl">
                 <Activity size={24} className="text-slate-600 mb-2" />
                 <Text className="text-slate-500 text-sm">No transactions yet.</Text>
              </View>
           ) : (
              <View className="gap-2">
                 {transactions.map(tx => (
                    <View key={tx.id} className="flex-row justify-between items-center p-4 bg-surface/50 border border-white/5 rounded-xl">
                       <Row className="items-center gap-3">
                          <View className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-emerald-500/10' : 'bg-slate-700'}`}>
                             {tx.type === 'receive' ? <ArrowDownLeft size={16} className="text-emerald-400" /> : <ArrowUpRight size={16} className="text-white" />}
                          </View>
                          <View>
                             <Text className="font-bold text-sm capitalize">{tx.type}</Text>
                             <Text className="text-[10px] text-slate-500">{tx.date}</Text>
                          </View>
                       </Row>
                       <View className="items-end">
                          <Text className={`font-bold text-sm ${tx.type === 'receive' ? 'text-emerald-400' : 'text-white'}`}>
                             {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.assetSymbol}
                          </Text>
                          <Text className="text-[10px] text-slate-500">${tx.valueUsd.toFixed(2)}</Text>
                       </View>
                    </View>
                 ))}
              </View>
           )}
        </View>

      </ScrollView>
    </View>
  );
};
