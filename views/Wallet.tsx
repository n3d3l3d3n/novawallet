
import React, { useState } from 'react';
import { Transaction, Asset, BankingCard } from '../types';
import { Card } from '../components/ui/Card';
import { VirtualNumPad } from '../components/ui/VirtualNumPad';
import { authService } from '../services/authService';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';
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

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
      
        {/* --- Banking Cards Section --- */}
        <View>
          <Row className="items-center justify-between mb-3">
              <Text className="text-lg font-bold">My Cards</Text>
              <TouchableOpacity className="flex-row items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
                  <Plus size={12} className="text-primary" /> 
                  <Text className="text-xs text-primary font-bold">Add New</Text>
              </TouchableOpacity>
          </Row>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
              {/* Digital Card */}
              {cards.map(card => (
                  <View key={card.id} className="mr-4 w-72 h-44 rounded-2xl bg-gradient-to-br from-slate-800 to-black border border-white/10 p-5 justify-between relative overflow-hidden shadow-xl">
                      {/* Background Elements */}
                      <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                      <View className={`absolute bottom-0 left-0 w-24 h-24 bg-${card.color === 'gold' ? 'yellow' : 'indigo'}-500/20 rounded-full blur-xl -ml-5 -mb-5`} />
                      
                      <Row className="justify-between items-start relative z-10">
                          <Text className="font-bold text-lg tracking-wider italic">{card.network}</Text>
                          <Wifi size={24} className="rotate-90 text-slate-400" />
                      </Row>
                      
                      <View className="relative z-10">
                          <Row className="items-center gap-3 mb-1">
                               <View className="w-8 h-5 bg-yellow-200/80 rounded items-center justify-center overflow-hidden">
                                   <View className="w-full h-[1px] bg-yellow-600/50 my-[1px]" />
                                   <View className="w-full h-[1px] bg-yellow-600/50 my-[1px]" />
                               </View>
                               <Wifi size={16} className="text-white rotate-90" />
                          </Row>
                          <Text className="font-mono text-xl tracking-widest text-white shadow-black drop-shadow-md">
                              •••• •••• •••• {card.last4}
                          </Text>
                      </View>

                      <Row className="justify-between items-end relative z-10">
                          <View>
                              <Text className="text-[8px] opacity-70 uppercase text-slate-300">Card Holder</Text>
                              <Text className="font-bold tracking-wide text-xs text-slate-300">{card.holderName}</Text>
                          </View>
                          <View className="items-end">
                              <Text className="text-[8px] opacity-70 uppercase text-slate-300">Expires</Text>
                              <Text className="font-bold text-xs text-slate-300">{card.expiry}</Text>
                          </View>
                      </Row>
                  </View>
              ))}

              {/* Add Card Placeholder */}
              <View className="w-12 items-center justify-center mr-4">
                  <TouchableOpacity className="w-10 h-10 rounded-full bg-surface border border-white/10 items-center justify-center">
                      <Plus size={20} className="text-slate-400" />
                  </TouchableOpacity>
              </View>
          </ScrollView>

          <TouchableOpacity 
              onPress={startNfcPay}
              className="w-full mt-2 py-3 bg-surface border border-white/10 rounded-xl flex-row items-center justify-center gap-2"
          >
              <Wifi size={18} className="rotate-90 text-slate-300" /> 
              <Text className="text-sm font-bold text-slate-300">Tap to Pay (NFC)</Text>
          </TouchableOpacity>
        </View>


        {/* --- Transaction History --- */}
        <View>
          <Row className="items-center justify-between mt-6 mb-4">
              <Text className="text-2xl font-bold">History</Text>
              <Row className="gap-2">
              <TouchableOpacity 
                  onPress={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery('');
                  }}
                  className={`p-2 rounded-lg border ${isSearchOpen ? 'bg-primary border-primary' : 'bg-surface border-white/10'}`}
              >
                  <Search size={18} className={isSearchOpen ? 'text-white' : 'text-slate-400'} />
              </TouchableOpacity>
              <TouchableOpacity 
                  onPress={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border ${showFilters ? 'bg-primary border-primary' : 'bg-surface border-white/10'}`}
              >
                  {showFilters ? <X size={18} className="text-white" /> : <Filter size={18} className="text-slate-400" />}
              </TouchableOpacity>
              </Row>
          </Row>

          {/* Search Bar */}
          {isSearchOpen && (
              <View className="mb-4 relative">
                  <Search className="absolute left-3 top-3 text-slate-400 z-10" size={16} />
                  <TextInput 
                    autoFocus
                    placeholder="Search by symbol (e.g., BTC)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white"
                  />
              </View>
          )}

          {/* Filter Options */}
          {showFilters && (
              <ScrollView horizontal className="mb-4 pb-2">
                {['all', 'receive', 'send', 'swap', 'buy'].map((type) => (
                    <TouchableOpacity
                    key={type}
                    onPress={() => setActiveFilter(type as any)}
                    className={`px-4 py-1.5 rounded-full border mr-2 ${
                        activeFilter === type 
                        ? 'bg-white border-white' 
                        : 'bg-surface border-white/10'
                    }`}
                    >
                    <Text className={`text-xs font-medium capitalize ${activeFilter === type ? 'text-black' : 'text-slate-400'}`}>
                        {type}
                    </Text>
                    </TouchableOpacity>
                ))}
              </ScrollView>
          )}

          <View className="gap-3">
              {filteredTransactions.length === 0 ? (
              <View className="items-center py-12 opacity-50">
                  <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-3">
                     <Search size={24} className="text-slate-500" />
                  </View>
                  <Text className="text-sm text-slate-400 text-center">
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
                  let colorClass = 'bg-slate-700';
                  let textClass = 'text-white';
                  let sign = '';
                  let label = '';

                  switch (tx.type) {
                  case 'receive':
                      Icon = ArrowDownLeft;
                      colorClass = 'bg-emerald-500/20';
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
                      colorClass = 'bg-indigo-500/20';
                      textClass = 'text-white';
                      label = 'Swapped';
                      break;
                  case 'buy':
                      Icon = CreditCard;
                      colorClass = 'bg-blue-500/20';
                      textClass = 'text-blue-400';
                      sign = '+';
                      label = 'Bought';
                      break;
                  }

                  return (
                  <Card 
                      key={tx.id} 
                      onClick={() => toggleExpand(tx.id)}
                  >
                      <Row className="items-center justify-between">
                      <Row className="items-center gap-4">
                          <View className={`w-10 h-10 rounded-full items-center justify-center ${colorClass}`}>
                             <Icon size={18} className={textClass} />
                          </View>
                          <View>
                          <Row className="items-center gap-1.5">
                              <Text className="font-bold text-sm text-white">{label}</Text>
                              <View className={`w-4 h-4 rounded-full items-center justify-center ${assetColor}`}>
                                <Text className="text-[8px] font-bold text-white">{tx.assetSymbol[0]}</Text>
                              </View>
                              <Text className="font-bold text-sm text-white">{tx.assetSymbol}</Text>
                          </Row>
                          <Text className="text-xs text-slate-400">{tx.date}</Text>
                          </View>
                      </Row>
                      <View className="items-end">
                          <Text className={`font-bold text-sm ${textClass}`}>
                          {sign}{tx.amount.toLocaleString()} {tx.assetSymbol}
                          </Text>
                          <Row className="items-center gap-1">
                            <Text className="text-xs text-slate-500">
                            ${tx.valueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                            {isExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                          </Row>
                      </View>
                      </Row>

                      {/* Expanded Details */}
                      {isExpanded && (
                      <View className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                          
                          {/* Status */}
                          <View>
                          <Text className="text-xs text-slate-500 mb-1">Status</Text>
                          <Row className={`items-center gap-1.5 px-2.5 py-1 rounded-full self-start ${
                              tx.status === 'completed' ? 'bg-emerald-500/10' : 'bg-yellow-500/10'
                          }`}>
                              {tx.status === 'completed' ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Clock size={12} className="text-yellow-400" />}
                              <Text className={`text-xs font-medium capitalize ${tx.status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                {tx.status}
                              </Text>
                          </Row>
                          </View>

                          {/* Asset */}
                          <View>
                          <Text className="text-xs text-slate-500 mb-1">Asset</Text>
                          <Row className="items-center gap-2">
                              <View className={`w-5 h-5 rounded-full items-center justify-center ${assetColor}`}>
                                <Text className="text-[10px] font-bold text-white">{tx.assetSymbol[0]}</Text>
                              </View>
                              <Text className="font-medium text-sm text-white">{tx.assetSymbol} Network</Text>
                          </Row>
                          </View>

                          {/* Fee */}
                          <View>
                          <Text className="text-xs text-slate-500 mb-1">Network Fee</Text>
                          <Text className="text-slate-300 font-medium text-sm">$1.45</Text>
                          </View>

                          {/* Explorer Link */}
                          <View>
                          <Text className="text-xs text-slate-500 mb-1">Transaction ID</Text>
                          <TouchableOpacity className="flex-row items-center gap-1">
                              <Text className="text-primary text-sm truncate max-w-[80px]">0x7f...3a9</Text>
                              <ExternalLink size={12} className="text-primary" />
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
      </ScrollView>

      {/* --- PIN Pad Overlay --- */}
      {showPinPad && (
         <View className="absolute inset-0 z-50 bg-black/90 backdrop-blur-lg justify-end pb-8">
             <View className="flex-1 items-center justify-center w-full">
                 <ShieldCheck size={48} className="text-primary mb-6" />
                 <Text className="text-xl font-bold mb-2">Enter Wallet PIN</Text>
                 <Text className="text-slate-400 text-sm mb-8">Authorize NFC Payment</Text>
                 
                 <Row className="gap-4 mb-10">
                     {[0, 1, 2, 3].map(i => (
                         <View key={i} className={`w-4 h-4 rounded-full border border-white/20 ${pin.length > i ? 'bg-white' : 'bg-transparent'}`} />
                     ))}
                 </Row>
                 {pin.length === 4 && (
                     <TouchableOpacity onPress={confirmPin} className="mb-4">
                        <Text className="text-primary font-bold animate-pulse">Confirming...</Text>
                     </TouchableOpacity>
                 )}
             </View>
             
             <View className="w-full px-4">
                 <VirtualNumPad 
                    onPress={handlePinInput} 
                    onDelete={handlePinDelete} 
                 />
                 <TouchableOpacity 
                   onPress={() => { setShowPinPad(false); setPin(''); }} 
                   className="w-full mt-4 py-4 items-center"
                 >
                     <Text className="text-slate-400 font-medium">Cancel</Text>
                 </TouchableOpacity>
             </View>
         </View>
      )}

      {/* --- NFC Mode Overlay --- */}
      {nfcMode && (
          <View className="absolute inset-0 z-50 bg-black items-center justify-center">
              <View className="relative">
                  <View className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                  <View className="w-32 h-32 bg-surface border border-white/10 rounded-full items-center justify-center relative z-10">
                      <Wifi size={48} className="text-white rotate-90" />
                  </View>
              </View>
              
              <View className="mt-12 items-center gap-2">
                  <Text className="text-2xl font-bold">Hold near reader</Text>
                  {isProcessingNfc ? (
                      <Row className="items-center gap-2">
                          <Loader2 className="animate-spin text-emerald-400" size={20} /> 
                          <Text className="text-emerald-400">Processing...</Text>
                      </Row>
                  ) : (
                      <Text className="text-slate-400">Visa •••• 4242</Text>
                  )}
              </View>

              <TouchableOpacity 
                 onPress={() => setNfcMode(false)}
                 className="absolute bottom-12 px-8 py-3 bg-white/10 rounded-full"
              >
                  <Text className="text-white font-medium">Cancel</Text>
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
};
