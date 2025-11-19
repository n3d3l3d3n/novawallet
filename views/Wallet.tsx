
import React, { useState } from 'react';
import { Transaction, Asset, BankingCard } from '../types';
import { Card } from '../components/ui/Card';
import { VirtualNumPad } from '../components/ui/VirtualNumPad';
import { authService } from '../services/authService';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard, Search, Filter, CheckCircle2, Clock, ChevronDown, ChevronUp, ExternalLink, X, Wifi, Plus, ShieldCheck, Loader2 } from 'lucide-react';

interface WalletProps {
  transactions: Transaction[];
  assets: Asset[];
}

export const Wallet: React.FC<WalletProps> = ({ transactions, assets }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'send' | 'receive' | 'swap' | 'buy'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Banking State
  const currentUser = authService.getCurrentUser();
  const [cards, setCards] = useState<BankingCard[]>(currentUser?.cards || []);
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState('');
  const [nfcMode, setNfcMode] = useState(false);
  const [isProcessingNfc, setIsProcessingNfc] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getAssetColor = (symbol: string) => {
    const asset = assets.find(a => a.symbol === symbol);
    return asset?.color || 'bg-slate-600';
  };

  const handlePinInput = (key: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + key);
    }
  };

  const handlePinDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const startNfcPay = () => {
    setPin('');
    setShowPinPad(true);
  };

  const confirmPin = () => {
     if (pin === '1234') { // Mock PIN
         setShowPinPad(false);
         setNfcMode(true);
         // Simulate NFC read
         setTimeout(() => {
             setIsProcessingNfc(true);
             setTimeout(() => {
                 setIsProcessingNfc(false);
                 setNfcMode(false);
                 alert('Payment Successful!');
             }, 2000);
         }, 3000);
     } else {
         alert('Incorrect PIN (Try 1234)');
         setPin('');
     }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesType = activeFilter === 'all' || tx.type === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      tx.assetSymbol.toLowerCase().includes(query) || 
      tx.type.toLowerCase().includes(query);
      
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-5 space-y-6 pb-24 animate-in fade-in duration-500 relative min-h-full">
      
      {/* --- Banking Cards Section --- */}
      <div>
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">My Cards</h2>
            <button className="text-xs text-primary font-bold flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                <Plus size={12} /> Add New
            </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
            {/* Digital Card */}
            {cards.map(card => (
                <div key={card.id} className="snap-center shrink-0 w-72 h-44 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/10 p-5 flex flex-col justify-between relative overflow-hidden shadow-xl group cursor-pointer">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className={`absolute bottom-0 left-0 w-24 h-24 bg-${card.color === 'gold' ? 'yellow' : 'indigo'}-500/20 rounded-full blur-xl -ml-5 -mb-5`}></div>
                    
                    <div className="flex justify-between items-start relative z-10">
                        <span className="font-bold text-lg tracking-wider italic">{card.network}</span>
                        <Wifi size={24} className="rotate-90 text-slate-400" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                             <div className="w-8 h-5 bg-yellow-200/80 rounded flex items-center justify-center overflow-hidden">
                                 <div className="w-full h-[1px] bg-yellow-600/50 my-[1px]"></div>
                                 <div className="w-full h-[1px] bg-yellow-600/50 my-[1px]"></div>
                             </div>
                             <Wifi size={16} className="text-white rotate-90" />
                        </div>
                        <div className="font-mono text-xl tracking-widest text-white shadow-black drop-shadow-md">
                            •••• •••• •••• {card.last4}
                        </div>
                    </div>

                    <div className="flex justify-between items-end text-xs text-slate-300 relative z-10">
                        <div className="flex flex-col">
                            <span className="text-[8px] opacity-70 uppercase">Card Holder</span>
                            <span className="font-bold tracking-wide">{card.holderName}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] opacity-70 uppercase">Expires</span>
                            <span className="font-bold">{card.expiry}</span>
                        </div>
                    </div>
                </div>
            ))}

            {/* Add Card Placeholder */}
            <div className="snap-center shrink-0 w-12 flex items-center justify-center">
                <button className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    <Plus size={20} />
                </button>
            </div>
        </div>

        <button 
            onClick={startNfcPay}
            className="w-full mt-2 py-3 bg-surface border border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
        >
            <Wifi size={18} className="rotate-90" /> Tap to Pay (NFC)
        </button>
      </div>


      {/* --- Transaction History --- */}
      <div>
        <div className="flex items-center justify-between mt-4 mb-4">
            <h1 className="text-2xl font-bold">History</h1>
            <div className="flex gap-2">
            <button 
                onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isSearchOpen) setSearchQuery('');
                }}
                className={`p-2 rounded-lg border transition-colors ${isSearchOpen ? 'bg-primary text-white border-primary' : 'bg-surface border-white/10 text-slate-400 hover:text-white'}`}
            >
                <Search size={18} />
            </button>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'bg-surface border-white/10 text-slate-400 hover:text-white active:bg-surface/80'}`}
            >
                {showFilters ? <X size={18} /> : <Filter size={18} />}
            </button>
            </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
            <div className="relative animate-in slide-in-from-top-2 fade-in mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                autoFocus
                type="text" 
                placeholder="Search by symbol (e.g., BTC)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500 shadow-lg"
                />
            </div>
        )}

        {/* Filter Options */}
        {showFilters && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 animate-in slide-in-from-top-2 fade-in mb-4">
            {['all', 'receive', 'send', 'swap', 'buy'].map((type) => (
                <button
                key={type}
                onClick={() => setActiveFilter(type as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all duration-300 ${
                    activeFilter === type 
                    ? 'bg-white text-black shadow-lg shadow-white/10 scale-105' 
                    : 'bg-surface text-slate-400 border border-white/10 hover:text-white hover:bg-surface/80'
                }`}
                >
                {type}
                </button>
            ))}
            </div>
        )}

        <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 space-y-3 opacity-50">
                <div className="w-16 h-16 rounded-full bg-surface mx-auto flex items-center justify-center">
                <Search size={24} className="text-slate-500" />
                </div>
                <p className="text-sm text-slate-400">
                {searchQuery 
                    ? `No transactions match "${searchQuery}"` 
                    : `No ${activeFilter !== 'all' ? activeFilter : ''} transactions found`}
                </p>
            </div>
            ) : (
            filteredTransactions.map((tx) => {
                const isExpanded = expandedId === tx.id;
                const assetColor = getAssetColor(tx.assetSymbol);
                
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
                    Icon = ArrowLeftRight;
                    colorClass = 'bg-indigo-500/20 text-indigo-400';
                    textClass = 'text-white';
                    label = 'Swapped';
                    break;
                case 'buy':
                    Icon = CreditCard;
                    colorClass = 'bg-blue-500/20 text-blue-400';
                    textClass = 'text-blue-400';
                    sign = '+';
                    label = 'Bought';
                    break;
                }

                return (
                <Card 
                    key={tx.id} 
                    onClick={() => toggleExpand(tx.id)}
                    className="transition-all duration-300"
                >
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon size={18} />
                        </div>
                        <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                            <span>{label}</span>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${assetColor} shadow-sm`}>
                            {tx.assetSymbol[0]}
                            </div>
                            <span>{tx.assetSymbol}</span>
                        </div>
                        <div className="text-xs text-slate-400">{tx.date}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`font-bold text-sm ${textClass}`}>
                        {sign}{tx.amount.toLocaleString()} {tx.assetSymbol}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                        ${tx.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </div>
                    </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-top-2 fade-in">
                        
                        {/* Status */}
                        <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">Status</span>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                            {tx.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span className="capitalize">{tx.status}</span>
                        </div>
                        </div>

                        {/* Asset */}
                        <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">Asset</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${assetColor}`}>
                            {tx.assetSymbol[0]}
                            </div>
                            <span className="font-medium">{tx.assetSymbol} Network</span>
                        </div>
                        </div>

                        {/* Fee (Mock) */}
                        <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">Network Fee</span>
                        <div className="text-slate-300 font-medium">$1.45</div>
                        </div>

                        {/* Explorer Link */}
                        <div className="space-y-1">
                        <span className="text-xs text-slate-500 block">Transaction ID</span>
                        <div className="flex items-center gap-1 text-primary hover:text-indigo-400 transition-colors cursor-pointer">
                            <span className="truncate max-w-[80px]">0x7f...3a9</span>
                            <ExternalLink size={12} />
                        </div>
                        </div>

                    </div>
                    )}
                </Card>
                );
            })
            )}
        </div>
      </div>

      {/* --- PIN Pad Overlay --- */}
      {showPinPad && (
         <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-end pb-8 animate-in slide-in-from-bottom duration-300">
             <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">
                 <ShieldCheck size={48} className="text-primary mb-6" />
                 <h3 className="text-xl font-bold mb-2">Enter Wallet PIN</h3>
                 <p className="text-slate-400 text-sm mb-8">Authorize NFC Payment</p>
                 
                 <div className="flex gap-4 mb-10">
                     {[0, 1, 2, 3].map(i => (
                         <div key={i} className={`w-4 h-4 rounded-full border border-white/20 ${pin.length > i ? 'bg-white' : 'bg-transparent'}`} />
                     ))}
                 </div>
                 {pin.length === 4 && (
                     <button onClick={confirmPin} className="mb-4 text-primary font-bold animate-pulse">
                         Confirming...
                     </button>
                 )}
             </div>
             
             <div className="w-full max-w-md px-4">
                 <VirtualNumPad 
                    onPress={handlePinInput} 
                    onDelete={handlePinDelete} 
                 />
                 <button 
                   onClick={() => { setShowPinPad(false); setPin(''); }} 
                   className="w-full mt-4 py-4 text-slate-400 font-medium"
                 >
                     Cancel
                 </button>
             </div>
         </div>
      )}

      {/* --- NFC Mode Overlay --- */}
      {nfcMode && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping animation-delay-500" />
                  <div className="w-32 h-32 bg-surface border border-white/10 rounded-full flex items-center justify-center relative z-10">
                      <Wifi size={48} className="text-white rotate-90" />
                  </div>
              </div>
              
              <div className="mt-12 text-center space-y-2">
                  <h2 className="text-2xl font-bold">Hold near reader</h2>
                  {isProcessingNfc ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-400">
                          <Loader2 className="animate-spin" size={20} /> Processing...
                      </div>
                  ) : (
                      <p className="text-slate-400">Visa •••• 4242</p>
                  )}
              </div>

              <button 
                 onClick={() => setNfcMode(false)}
                 className="absolute bottom-12 px-8 py-3 bg-white/10 rounded-full text-white font-medium"
              >
                  Cancel
              </button>
          </div>
      )}
    </div>
  );
};
