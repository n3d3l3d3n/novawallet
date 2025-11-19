import React, { useState, useEffect } from 'react';
import { ViewState, Asset, Transaction } from './types';
import { Navigation } from './components/Navigation';
import { Home } from './views/Home';
import { Market } from './views/Market';
import { Advisor } from './views/Advisor';
import { Card } from './components/ui/Card';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, Search, Filter } from 'lucide-react';

// Mock Data
const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.42,
    price: 64230.50,
    change24h: 2.4,
    color: 'bg-orange-500',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 60000 + Math.random() * 5000 + i * 100 }))
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 4.5,
    price: 3450.20,
    change24h: -1.2,
    color: 'bg-blue-600',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 3200 + Math.random() * 400 + i * 20 }))
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    balance: 145.0,
    price: 148.90,
    change24h: 5.7,
    color: 'bg-purple-600',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 130 + Math.random() * 30 + i * 5 }))
  },
  {
    id: '4',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 5430.0,
    price: 1.00,
    change24h: 0.01,
    color: 'bg-blue-400',
    chartData: Array.from({ length: 20 }, () => ({ value: 1.00 + (Math.random() - 0.5) * 0.001 }))
  },
  {
    id: '5',
    symbol: 'DOGE',
    name: 'Dogecoin',
    balance: 0,
    price: 0.12,
    change24h: 8.4,
    color: 'bg-yellow-500',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 0.10 + Math.random() * 0.05 }))
  },
  {
    id: '6',
    symbol: 'DOT',
    name: 'Polkadot',
    balance: 0,
    price: 7.20,
    change24h: -3.5,
    color: 'bg-pink-600',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 8 - i * 0.1 + Math.random() }))
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'receive', assetSymbol: 'BTC', amount: 0.0042, valueUsd: 269.76, date: 'Today, 10:23 AM', status: 'completed' },
  { id: 't2', type: 'send', assetSymbol: 'ETH', amount: 1.2, valueUsd: 4140.24, date: 'Yesterday, 4:15 PM', status: 'completed' },
  { id: 't3', type: 'swap', assetSymbol: 'SOL', amount: 45, valueUsd: 6700.50, date: 'Oct 24, 9:30 AM', status: 'completed' },
  { id: 't4', type: 'buy', assetSymbol: 'USDC', amount: 500, valueUsd: 500.00, date: 'Oct 22, 2:10 PM', status: 'completed' },
  { id: 't5', type: 'receive', assetSymbol: 'DOGE', amount: 1000, valueUsd: 120.00, date: 'Oct 20, 11:00 AM', status: 'completed' },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [assets] = useState<Asset[]>(INITIAL_ASSETS);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const total = assets.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
    setTotalBalance(total);
  }, [assets]);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <Home assets={assets.filter(a => a.balance > 0)} totalBalance={totalBalance} />;
      case ViewState.MARKET:
        return <Market assets={assets} />;
      case ViewState.ADVISOR:
        return <Advisor assets={assets} />;
      case ViewState.WALLET:
        return (
          <div className="p-5 space-y-6 pb-24 animate-in fade-in duration-500">
             <div className="flex items-center justify-between mt-4">
                <h1 className="text-2xl font-bold">History</h1>
                <div className="flex gap-2">
                   <button className="p-2 rounded-lg bg-surface border border-white/10 text-slate-400 hover:text-white active:bg-surface/80 transition-colors">
                      <Search size={18} />
                   </button>
                   <button className="p-2 rounded-lg bg-surface border border-white/10 text-slate-400 hover:text-white active:bg-surface/80 transition-colors">
                      <Filter size={18} />
                   </button>
                </div>
             </div>

             <div className="space-y-3">
                {INITIAL_TRANSACTIONS.map((tx) => {
                   let Icon = ArrowUpRight;
                   let colorClass = 'bg-slate-700';
                   let textClass = 'text-white';
                   let sign = '';
                   let label = '';

                   switch (tx.type) {
                      case 'receive':
                         Icon = ArrowDownLeft;
                         colorClass = 'bg-emerald-500/20 text-emerald-400';
                         textClass = 'text-emerald-400';
                         sign = '+';
                         label = 'Received';
                         break;
                      case 'send':
                         Icon = ArrowUpRight;
                         colorClass = 'bg-surface text-slate-300 border border-white/10';
                         textClass = 'text-white';
                         sign = '-';
                         label = 'Sent';
                         break;
                      case 'swap':
                         Icon = RefreshCw;
                         colorClass = 'bg-indigo-500/20 text-indigo-400';
                         textClass = 'text-white';
                         label = 'Swapped';
                         break;
                      case 'buy':
                         Icon = Plus;
                         colorClass = 'bg-blue-500/20 text-blue-400';
                         textClass = 'text-blue-400';
                         sign = '+';
                         label = 'Bought';
                         break;
                   }

                   return (
                      <Card key={tx.id} className="flex items-center justify-between p-4">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                               <Icon size={18} />
                            </div>
                            <div>
                               <div className="font-bold text-sm text-white">{label} {tx.assetSymbol}</div>
                               <div className="text-xs text-slate-400">{tx.date}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className={`font-bold text-sm ${textClass}`}>
                               {sign}{tx.amount.toLocaleString()} {tx.assetSymbol}
                            </div>
                            <div className="text-xs text-slate-500">${tx.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                         </div>
                      </Card>
                   )
                })}
             </div>
          </div>
        );
      default:
        return <Home assets={assets} totalBalance={totalBalance} />;
    }
  };

  return (
    <div className="bg-background min-h-screen text-white font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-slate-900 to-black relative shadow-2xl shadow-black">
        {/* Main Content Area */}
        <div className="h-screen overflow-y-auto overflow-x-hidden no-scrollbar">
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <Navigation currentView={currentView} onNavigate={setCurrentView} />
      </div>
    </div>
  );
}

export default App;