import React, { useState } from 'react';
import { Asset } from '../types';
import { Card } from '../components/ui/Card';
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
    <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right-10 duration-500">
      <h1 className="text-2xl font-bold mt-4">Market</h1>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search coins..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Watchlist', 'Gainers', 'Losers', 'New'].map((tab, i) => (
            <button 
              key={tab} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-white text-black' : 'bg-surface text-slate-300 border border-white/5'}`}
            >
              {tab}
            </button>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between px-2 text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
          <span>Name</span>
          <span className="text-right">Price / 24h</span>
        </div>
        
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="flex items-center justify-between py-3 px-4 active:bg-surface/80 transition-colors">
            <div className="flex items-center gap-3">
               <Star size={16} className="text-slate-600" />
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${asset.color}`}>
                {asset.symbol[0]}
              </div>
              <div>
                <h3 className="font-bold text-sm">{asset.name}</h3>
                <span className="text-xs text-slate-400">{asset.symbol}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">${asset.price.toLocaleString()}</div>
              <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};