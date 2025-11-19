
import React from 'react';
import { ViewState, NewsItem } from '../types';
import { ChevronLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, Image } from '../components/native';

interface NewsProps {
  onNavigate: (view: ViewState) => void;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin Breaks $65,000 Resistance Level Amid ETF Inflows',
    source: 'CryptoDaily',
    time: '2h ago',
    category: 'Market',
    sentiment: 'Positive'
  },
  {
    id: '2',
    title: 'New Regulatory Framework Proposed in EU for Stablecoins',
    source: 'BlockNews',
    time: '4h ago',
    category: 'Regulation',
    sentiment: 'Neutral'
  },
  {
    id: '3',
    title: 'Major DeFi Protocol Suffers Exploit Attempt, Funds Safe',
    source: 'TechWatch',
    time: '6h ago',
    category: 'Tech',
    sentiment: 'Negative'
  },
  {
    id: '4',
    title: 'Solana Ecosystem Sees Record High Transaction Volume',
    source: 'SolanaDaily',
    time: '8h ago',
    category: 'Market',
    sentiment: 'Positive'
  },
  {
    id: '5',
    title: 'Ethereum Layer 2 Solutions Reduce Gas Fees by 90%',
    source: 'EthHub',
    time: '12h ago',
    category: 'Tech',
    sentiment: 'Positive'
  }
];

export const News: React.FC<NewsProps> = ({ onNavigate }) => {
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return <TrendingUp size={14} className="text-emerald-400" />;
      case 'Negative': return <TrendingDown size={14} className="text-red-400" />;
      default: return <Minus size={14} className="text-slate-400" />;
    }
  };

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Crypto News</Text>
        </Row>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 pb-2">
          {['All', 'Market', 'Regulation', 'Tech', 'Metaverse'].map((cat, i) => (
             <TouchableOpacity 
               key={cat} 
               className={`px-4 py-1.5 rounded-full mr-2 border ${i === 0 ? 'bg-white border-white' : 'bg-surface border-white/5'}`}
             >
               <Text className={`text-sm font-medium ${i === 0 ? 'text-black' : 'text-slate-300'}`}>{cat}</Text>
             </TouchableOpacity>
          ))}
        </ScrollView>

        {/* News List */}
        <View className="gap-3">
           {MOCK_NEWS.map((item) => (
              <Card key={item.id} className="p-4">
                 <Row className="items-start gap-3 justify-between">
                    <View className="flex-1">
                       <Row className="items-center gap-2 mb-2">
                          <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{item.category}</Text>
                          <View className="w-1 h-1 rounded-full bg-slate-600" />
                          <Text className="text-[10px] text-slate-400">{item.time}</Text>
                       </Row>
                       <Text className="font-bold text-sm leading-snug mb-2">{item.title}</Text>
                       <Row className="items-center gap-3">
                          <Text className="text-xs text-slate-500">{item.source}</Text>
                          <Row className="items-center gap-1 px-2 py-0.5 bg-white/5 rounded">
                             {getSentimentIcon(item.sentiment)}
                             <Text className={`text-xs font-medium ${item.sentiment === 'Positive' ? 'text-emerald-400' : item.sentiment === 'Negative' ? 'text-red-400' : 'text-slate-400'}`}>
                               {item.sentiment}
                             </Text>
                          </Row>
                       </Row>
                    </View>
                    <View className="w-16 h-16 bg-slate-700 rounded-lg" />
                 </Row>
              </Card>
           ))}
        </View>
      </ScrollView>
    </View>
  );
};
