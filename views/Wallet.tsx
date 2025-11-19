
import React, { useState } from 'react';
import { Transaction, Asset, BankingCard, ViewState } from '../types';
import { Card } from '../components/ui/Card';
import { VirtualNumPad } from '../components/ui/VirtualNumPad';
import { authService } from '../services/authService';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard, Search, Filter, CheckCircle2, Clock, ChevronDown, ChevronUp, ExternalLink, X, Wifi, Plus, ShieldCheck, Loader2, Lock } from 'lucide-react';

interface WalletProps {
  transactions: Transaction[];
  assets: Asset[];
  onNavigate: (view: ViewState, params?: any) => void;
}

export const Wallet: React.FC<WalletProps> = ({ transactions, assets, onNavigate }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'send' | 'receive' | 'swap' | 'buy'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Banking State
  const [cards, setCards] = useState<BankingCard[]>([]);
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState('');
  const [nfcMode, setNfcMode] = useState(false);
  const [isProcessingNfc, setIsProcessingNfc] = useState(false);

  // Load cards on mount
  React.useEffect(() => {
      const loadCards = async () => {
          const user = authService.getCurrentUserSync();
          if (user) setCards(user.cards);
      };
      loadCards();
  }, []);

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

  const handleCardClick = (card: BankingCard) => {
      onNavigate(ViewState.CARD_DETAILS, { card });
  };

  return (
    <View className="flex-1 h-full bg-black">
      <ScrollView contentContainerStyle="p-5 pb-24">
        
        {/* Responsive Split Layout for Tablet */}
        <View className="flex flex-col lg:flex-row lg:gap-8">
          
          {/* Left Col: Banking & Cards */}
          <View className="lg:w-[45%]">
            <Row className="items-center justify-between mb-4 px-1">
                <Text className="text-xl font-bold text-white">My Cards</Text>
                <TouchableOpacity className="flex-row items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <Plus size={14} className="text-white" /> 
                    <Text className="text-xs text-white font-bold">Add New</Text>
                </TouchableOpacity>
            </Row>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4 -mx-5 px-5 lg:mx-0 lg:px-0">
                {/* Digital Card */}
                {cards.map(card => (
                    <TouchableOpacity 
                      key={card.id} 
                      onPress={() => handleCardClick(card)}
                      className="mr-4 active:scale-[0.98] transition-transform"
                    >
                        <View className={`w-80 h-48 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/10 p-6 justify-between relative overflow-hidden shadow-2xl ${card.color === 'gold' ? 'from-yellow-600 via-yellow-700 to-yellow-900 border-yellow-500/30' : card.color === 'blue' ? 'from-blue-600 via-blue-800 to-blue-950 border-blue-500/30' : 'border-slate-700'}`}>
                            {/* Background Elements */}
                            <View className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                            <View className={`absolute bottom-0 left-0 w-32 h-32 bg-${card.color === 'gold' ? 'yellow' : 'indigo'}-500/20 rounded-full blur-2xl -ml-5 -mb-5`} />
                            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                            
                            <Row className="justify-between items-start relative z-10">
                                <Text className="font-bold text-lg tracking-widest italic text-white/80">{card.network}</Text>
                                <Wifi size={24} className="rotate-90 text-white/40" />
                            </Row>
                            
                            <View className="relative z-10 pl-1">
                                <Row className="items-center gap-3 mb-2">
                                    <View className="w-11 h-8 bg-yellow-200/90 rounded-md items-center justify-center overflow-hidden border border-yellow-400/50 shadow-sm">
                                        <View className="w-full h-[1px] bg-yellow-600/50 my-[2px]" />
                                        <View className="w-full h-[1px] bg-yellow-600/50 my-[2px]" />
                                    </View>
                                    <Wifi size={18} className="text-white/40 rotate-90" />
                                </Row>
                                <Text className="font-mono text-2xl tracking-[0.15em] text-white shadow-black drop-shadow-lg" style={{fontFamily: 'monospace'}}>
                                    •••• {card.last4}
                                </Text>
                            </View>

                            <Row className="justify-between items-end relative z-10">
                                <View>
                                    <Text className="text-[8px] opacity-60 uppercase text-white mb-0.5 tracking-wider">Card Holder</Text>
                                    <Text className="font-bold tracking-wide text-sm text-white uppercase shadow-black drop-shadow-md">{card.holderName}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-[8px] opacity-60 uppercase text-white mb-0.5 tracking-wider">Expires</Text>
                                    <Text className="font-bold text-sm text-white shadow-black drop-shadow-md">{card.expiry}</Text>
                                </View>
                            </Row>
                            
                            {card.isFrozen && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-20 rounded-2xl">
                                    <Lock size={40} className="text-white opacity-90" />
                                    <Text className="absolute mt-14 text-white font-bold text-xs tracking-widest border border-white px-2 py-1 rounded">FROZEN</Text>
                                </div>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add Card Placeholder */}
                <View className="w-16 items-center justify-center mr-4">
                    <TouchableOpacity className="w-12 h-12 rounded-full bg-surface border border-white/10 items-center justify-center active:scale-90 transition-transform">
                        <Plus size={24} className="text-slate-400" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity 
                onPress={startNfcPay}
                className="w-full mt-2 py-4 bg-gradient-to-r from-surface to-surface/50 border border-white/10 rounded-2xl flex-row items-center justify-center gap-3 active:bg-surface transition-colors lg:hidden"
            >
                <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center">
                    <Wifi size={16} className="rotate-90 text-white" /> 
                </View>
                <Text className="text-sm font-bold text-white">Tap to Pay (NFC)</Text>
            </TouchableOpacity>
          </View>

          {/* Right Col: Transaction History */}
          <View className="flex-1 mt-6 lg:mt-0">
            <Row className="items-center justify-between mt-2 mb-5 px-1">
                <Text className="text-xl font-bold text-white">History</Text>
                <Row className="gap-2">
                <TouchableOpacity 
                    onPress={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if (isSearchOpen) setSearchQuery('');
                    }}
                    className={`p-2.5 rounded-xl border transition-colors ${isSearchOpen ? 'bg-primary border-primary' : 'bg-surface border-white/10'}`}
                >
                    <Search size={18} className={isSearchOpen ? 'text-white' : 'text-slate-400'} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-primary border-primary' : 'bg-surface border-white/10'}`}
                >
                    {showFilters ? <X size={18} className="text-white" /> : <Filter size={18} className="text-slate-400" />}
                </TouchableOpacity>
                </Row>
            </Row>

            {/* Search Bar */}
            {isSearchOpen && (
                <View className="mb-4 relative animate-in fade-in slide-in-from-top-2 duration-200">
                    <Search className="absolute left-4 top-3.5 text-slate-400 z-10" size={16} />
                    <TextInput 
                      autoFocus
                      placeholder="Search transactions..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white"
                    />
                </View>
            )}

            {/* Filter Options */}
            {showFilters && (
                <ScrollView horizontal className="mb-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {['all', 'receive', 'send', 'swap', 'buy'].map((type) => (
                      <TouchableOpacity
                      key={type}
                      onPress={() => setActiveFilter(type as any)}
                      className={`px-5 py-2 rounded-full border mr-2 transition-colors ${
                          activeFilter === type 
                          ? 'bg-white border-white' 
                          : 'bg-surface border-white/10'
                      }`}
                      >
                      <Text className={`text-xs font-bold capitalize ${activeFilter === type ? 'text-black' : 'text-slate-400'}`}>
                          {type}
                      </Text>
                      </TouchableOpacity>
                  ))}
                </ScrollView>
            )}

            <View className="gap-3">
                {filteredTransactions.length === 0 ? (
                <View className="items-center py-16 border border-dashed border-white/10 rounded-3xl bg-surface/10">
                    <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
                       <Search size={24} className="text-slate-500" />
                    </View>
                    <Text className="text-sm text-slate-400 text-center max-w-[200px]">
                    {searchQuery 
                        ? `No transactions match "${searchQuery}"` 
                        : `No ${activeFilter !== 'all' ? activeFilter : ''} transactions found`}
                    </Text>
                </View>
                ) : (
                filteredTransactions.map((tx) => {
                    const isExpanded = expandedId === tx.id;
                    const assetColor = getAssetColor(tx.assetSymbol);
                    
                    let Icon = ArrowUpRight;
                    let colorClass = 'bg-slate-800';
                    let textClass = 'text-white';
                    let sign = '';
                    let label = '';

                    switch (tx.type) {
                    case 'receive':
                        Icon = ArrowDownLeft;
                        colorClass = 'bg-emerald-500/10';
                        textClass = 'text-emerald-400';
                        sign = '+';
                        label = 'Received';
                        break;
                    case 'send':
                        Icon = ArrowUpRight;
                        colorClass = 'bg-surface border border-white/10';
                        textClass = 'text-white';
                        sign = '-';
                        label = 'Sent';
                        break;
                    case 'swap':
                        Icon = ArrowLeftRight;
                        colorClass = 'bg-indigo-500/10';
                        textClass = 'text-indigo-300';
                        label = 'Swapped';
                        break;
                    case 'buy':
                        Icon = CreditCard;
                        colorClass = 'bg-blue-500/10';
                        textClass = 'text-blue-400';
                        sign = '+';
                        label = 'Bought';
                        break;
                    }

                    return (
                    <Card 
                        key={tx.id} 
                        onClick={() => toggleExpand(tx.id)}
                        className={`active:bg-surface/80 transition-colors border-white/5 hover:border-white/10 ${isExpanded ? 'bg-surface/80 border-white/10' : ''}`}
                    >
                        <Row className="items-center justify-between p-3">
                        <Row className="items-center gap-4">
                            <View className={`w-12 h-12 rounded-full items-center justify-center ${colorClass}`}>
                               <Icon size={20} className={textClass} />
                            </View>
                            <View>
                            <Row className="items-center gap-1.5">
                                <Text className="font-bold text-sm text-white">{label}</Text>
                                <View className={`w-4 h-4 rounded-full items-center justify-center ${assetColor}`}>
                                  <Text className="text-[8px] font-bold text-white">{tx.assetSymbol[0]}</Text>
                                </View>
                                <Text className="font-bold text-sm text-white">{tx.assetSymbol}</Text>
                            </Row>
                            <Text className="text-xs text-slate-400 mt-0.5">{tx.date}</Text>
                            </View>
                        </Row>
                        <View className="items-end">
                            <Text className={`font-bold text-sm ${textClass}`}>
                            {sign}{tx.amount.toLocaleString()} {tx.assetSymbol}
                            </Text>
                            <Row className="items-center gap-1 mt-0.5">
                              <Text className="text-[10px] text-slate-500">
                              ${tx.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Text>
                              <ChevronDown size={12} className={`text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </Row>
                        </View>
                        </Row>

                        {/* Expanded Details */}
                        {isExpanded && (
                        <View className="px-3 pb-3 pt-2 border-t border-white/5 mt-2 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            
                            {/* Status */}
                            <View>
                            <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</Text>
                            <Row className={`items-center gap-1.5 px-2.5 py-1 rounded-md self-start ${
                                tx.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-yellow-500/10'
                            }`}>
                                {tx.status === 'completed' ? <CheckCircle2 size={10} className="text-emerald-400" /> : <Clock size={10} className="text-yellow-400" />}
                                <Text className={`text-[10px] font-bold capitalize ${tx.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                  {tx.status}
                                </Text>
                            </Row>
                            </View>

                            {/* Asset */}
                            <View>
                            <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1">Network</Text>
                            <Row className="items-center gap-1.5">
                                <View className={`w-4 h-4 rounded-full items-center justify-center ${assetColor}`}>
                                  <Text className="text-[8px] font-bold text-white">{tx.assetSymbol[0]}</Text>
                                </View>
                                <Text className="font-medium text-xs text-white">{tx.assetSymbol} Chain</Text>
                            </Row>
                            </View>

                            {/* Fee */}
                            <View>
                            <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1">Fee</Text>
                            <Text className="text-slate-300 font-medium text-xs">$1.45</Text>
                            </View>

                            {/* Explorer Link */}
                            <View>
                            <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1">Hash</Text>
                            <TouchableOpacity className="flex-row items-center gap-1">
                                <Text className="text-primary text-xs font-mono truncate max-w-[80px]">0x7f...3a9</Text>
                                <ExternalLink size={10} className="text-primary" />
                            </TouchableOpacity>
                            </View>

                        </View>
                        )}
                    </Card>
                    );
                })
                )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- PIN Pad Overlay --- */}
      {showPinPad && (
         <View className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl justify-end pb-10 animate-in fade-in slide-in-from-bottom duration-300">
             <View className="flex-1 items-center justify-center w-full">
                 <View className="w-20 h-20 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <ShieldCheck size={40} className="text-primary" />
                 </View>
                 <Text className="text-xl font-bold mb-2 text-white">Authorize Payment</Text>
                 <Text className="text-slate-400 text-sm mb-8">Enter your wallet PIN to continue</Text>
                 
                 <Row className="gap-6 mb-10">
                     {[0, 1, 2, 3].map(i => (
                         <View key={i} className={`w-3 h-3 rounded-full transition-all duration-200 ${pin.length > i ? 'bg-white scale-110' : 'bg-white/20'}`} />
                     ))}
                 </Row>
             </View>
             
             <View className="w-full px-6 max-w-sm mx-auto">
                 <VirtualNumPad 
                    onPress={handlePinInput} 
                    onDelete={handlePinDelete} 
                 />
                 <TouchableOpacity 
                   onPress={() => { setShowPinPad(false); setPin(''); }} 
                   className="w-full mt-8 py-3 items-center"
                 >
                     <Text className="text-slate-400 font-bold text-sm tracking-wider uppercase">Cancel</Text>
                 </TouchableOpacity>
             </View>
         </View>
      )}

      {/* --- NFC Mode Overlay --- */}
      {nfcMode && (
          <View className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center">
                  <div className="absolute w-64 h-64 bg-primary/20 rounded-full animate-ping opacity-20" />
                  <div className="absolute w-48 h-48 bg-primary/30 rounded-full animate-pulse opacity-40" />
                  <div className="w-32 h-32 bg-surface border border-white/10 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                      <Wifi size={48} className="text-white rotate-90" />
                  </div>
              </div>
              
              <View className="mt-16 items-center gap-3">
                  <Text className="text-2xl font-bold text-white tracking-tight">Hold Near Reader</Text>
                  {isProcessingNfc ? (
                      <Row className="items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                          <Loader2 className="animate-spin text-emerald-400" size={18} /> 
                          <Text className="text-emerald-400 font-bold text-sm">Processing...</Text>
                      </Row>
                  ) : (
                      <Text className="text-slate-400 text-sm font-medium">Visa •••• 4242</Text>
                  )}
              </View>

              <TouchableOpacity 
                 onPress={() => setNfcMode(false)}
                 className="absolute bottom-16 px-8 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                  <Text className="text-white font-bold text-sm">Cancel</Text>
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
};
