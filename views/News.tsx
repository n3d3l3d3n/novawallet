import React from 'react';
import { ViewState, NewsItem } from '../types';
import { ChevronLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../components/ui/Card';

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
    <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
           <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Crypto News</h1>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {['All', 'Market', 'Regulation', 'Tech', 'Metaverse'].map((cat, i) => (
           <button 
             key={cat} 
             className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-white text-black' : 'bg-surface text-slate-300 border border-white/5'}`}
           >
             {cat}
           </button>
        ))}
      </div>

      {/* News List */}
      <div className="space-y-3">
         {MOCK_NEWS.map((item) => (
            <Card key={item.id} className="p-4 hover:bg-surface/80 transition-colors cursor-pointer">
               <div className="flex justify-between items-start gap-3">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{item.category}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                     </div>
                     <h3 className="font-bold text-sm leading-snug mb-2">{item.title}</h3>
                     <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{item.source}</span>
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 rounded text-xs font-medium">
                           {getSentimentIcon(item.sentiment)}
                           <span className={`${item.sentiment === 'Positive' ? 'text-emerald-400' : item.sentiment === 'Negative' ? 'text-red-400' : 'text-slate-400'}`}>
                             {item.sentiment}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="w-16 h-16 bg-slate-700 rounded-lg flex-shrink-0" />
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
};