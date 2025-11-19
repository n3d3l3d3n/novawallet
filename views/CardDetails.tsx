
import React, { useState } from 'react';
import { BankingCard, Asset } from '../types';
import { bankingService } from '../services/bankingService';
import { ChevronLeft, Wifi, Lock, Unlock, Eye, EyeOff, Settings, CreditCard, Zap, Plus, ShoppingBag, Coffee, Plane, Globe, Smartphone, ShieldCheck, Loader2, TrendingUp, ArrowDownLeft } from 'lucide-react';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';
import { Card } from '../components/ui/Card';
import { PinLock } from '../components/ui/PinLock';

interface CardDetailsProps {
  card: BankingCard;
  assets: Asset[]; // For top-up
  onBack: () => void;
  onUpdateCard: (updatedCard: BankingCard) => void;
}

export const CardDetails: React.FC<CardDetailsProps> = ({ card, assets, onBack, onUpdateCard }) => {
  const [isFrozen, setIsFrozen] = useState(card.isFrozen);
  const [showDetails, setShowDetails] = useState(false);
  const [secureData, setSecureData] = useState<{pan: string, cvv: string} | null>(null);
  const [authChallenge, setAuthChallenge] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(card.settings);

  const handleToggleFreeze = async () => {
    const newState = await bankingService.toggleFreeze(card.id, isFrozen);
    setIsFrozen(newState);
    onUpdateCard({ ...card, isFrozen: newState });
  };

  const handleRevealDetails = () => {
    if (showDetails) {
      setShowDetails(false);
      setSecureData(null);
    } else {
      setAuthChallenge(true);
    }
  };

  const onAuthSuccess = async () => {
    setAuthChallenge(false);
    setIsLoadingDetails(true);
    try {
      const data = await bankingService.getCardDetails(card.id);
      setSecureData(data);
      setShowDetails(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const toggleSetting = async (key: keyof typeof settings) => {
     const newSettings = { ...settings, [key]: !settings[key] };
     setSettings(newSettings);
     await bankingService.updateSettings(card.id, newSettings);
     onUpdateCard({ ...card, settings: newSettings });
  };

  const handleTopUp = async () => {
      if (!topUpAmount) return;
      setIsProcessingTopUp(true);
      try {
          const amt = parseFloat(topUpAmount);
          const tx = await bankingService.topUpCard(card.id, amt);
          // Update local state
          const newBalance = card.balance + amt;
          const newTransactions = [tx, ...(card.transactions || [])];
          
          onUpdateCard({ ...card, balance: newBalance, transactions: newTransactions });
          setShowTopUp(false);
          setTopUpAmount('');
          alert(`Successfully added $${amt} to your card.`);
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessingTopUp(false);
      }
  };

  return (
    <View className="flex-1 h-full bg-black">
      {authChallenge && (
        <div className="absolute inset-0 z-50">
           <PinLock isLocked={true} onUnlock={onAuthSuccess} />
        </div>
      )}

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between bg-background z-10">
        <TouchableOpacity onPress={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
           <ChevronLeft size={24} className="text-white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Card Details</Text>
        <TouchableOpacity className="p-2 rounded-full hover:bg-white/10">
           <Settings size={20} className="text-slate-400" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle="pb-24">
         {/* Card Visualization */}
         <View className="p-6 items-center">
             <View className={`w-full aspect-[1.586] rounded-2xl p-6 relative overflow-hidden shadow-2xl transform transition-transform duration-500 ${isFrozen ? 'grayscale opacity-80' : ''} ${card.color === 'gold' ? 'bg-gradient-to-br from-yellow-600 to-yellow-800' : card.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-900' : 'bg-gradient-to-br from-slate-800 to-black'}`}>
                 {/* Background Texture */}
                 <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                 
                 <Row className="justify-between items-start relative z-10">
                     <Text className="font-bold text-lg italic tracking-widest text-white/90">{card.network}</Text>
                     <Wifi size={24} className="rotate-90 text-white/70" />
                 </Row>
                 
                 <View className="flex-1 justify-center relative z-10 space-y-4">
                     <Row className="items-center gap-3">
                         <div className="w-10 h-7 bg-yellow-200/80 rounded flex items-center justify-center overflow-hidden border border-yellow-400/50">
                             <div className="w-full h-[1px] bg-yellow-700/40 my-[2px]" />
                             <div className="w-full h-[1px] bg-yellow-700/40 my-[2px]" />
                         </div>
                         <Wifi size={16} className="text-white/50 rotate-90" />
                     </Row>
                     
                     <View>
                         {isLoadingDetails ? (
                             <Loader2 className="animate-spin text-white" />
                         ) : showDetails && secureData ? (
                             <Text className="font-mono text-xl tracking-widest text-white drop-shadow-md">
                                 {secureData.pan.match(/.{1,4}/g)?.join(' ')}
                             </Text>
                         ) : (
                             <Text className="font-mono text-xl tracking-widest text-white drop-shadow-md">
                                 •••• •••• •••• {card.last4}
                             </Text>
                         )}
                     </View>
                 </View>

                 <Row className="justify-between items-end relative z-10">
                     <View>
                         <Text className="text-[9px] uppercase text-white/60 mb-0.5">Card Holder</Text>
                         <Text className="font-bold tracking-wide text-sm text-white uppercase">{card.holderName}</Text>
                     </View>
                     <View className="items-end">
                         <Text className="text-[9px] uppercase text-white/60 mb-0.5">Expires</Text>
                         <Text className="font-bold text-sm text-white">{card.expiry}</Text>
                     </View>
                     {showDetails && secureData && (
                         <View className="items-end ml-4">
                             <Text className="text-[9px] uppercase text-white/60 mb-0.5">CVV</Text>
                             <Text className="font-bold text-sm text-white">{secureData.cvv}</Text>
                         </View>
                     )}
                 </Row>
                 
                 {isFrozen && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                         <Row className="bg-black/60 px-4 py-2 rounded-full items-center gap-2 border border-white/10">
                             <Lock size={16} className="text-white" />
                             <Text className="text-white font-bold text-sm">CARD FROZEN</Text>
                         </Row>
                     </div>
                 )}
             </View>
         </View>

         {/* Balance & Actions */}
         <View className="px-5 mb-6">
             <View className="bg-surface border border-white/10 rounded-2xl p-4 mb-4">
                 <Row className="justify-between items-center mb-4">
                     <View>
                         <Text className="text-slate-400 text-xs font-bold uppercase">Current Balance</Text>
                         <Text className="text-3xl font-bold text-white">${card.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
                     </View>
                     <TouchableOpacity onPress={() => setShowTopUp(!showTopUp)} className="bg-primary p-3 rounded-xl shadow-lg shadow-indigo-500/20">
                         <Plus size={24} className="text-white" />
                     </TouchableOpacity>
                 </Row>

                 {/* Top Up Drawer */}
                 {showTopUp && (
                     <div className="bg-black/30 rounded-xl p-3 mb-2 animate-in slide-in-from-top duration-200">
                         <Text className="text-xs text-slate-400 mb-2">Add funds from Crypto Wallet</Text>
                         <Row className="gap-2">
                             <TextInput 
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                placeholder="Amount (USD)"
                                className="flex-1 bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                                type="number"
                             />
                             <TouchableOpacity 
                               onPress={handleTopUp}
                               disabled={isProcessingTopUp}
                               className="bg-emerald-500 px-4 rounded-lg items-center justify-center"
                             >
                                {isProcessingTopUp ? <Loader2 size={14} className="animate-spin text-white" /> : <Text className="text-white text-xs font-bold">Add</Text>}
                             </TouchableOpacity>
                         </Row>
                     </div>
                 )}

                 {/* Action Grid */}
                 <Row className="gap-3">
                     <TouchableOpacity 
                        onPress={handleToggleFreeze}
                        className={`flex-1 py-3 rounded-xl flex-col items-center justify-center gap-1 border ${isFrozen ? 'bg-blue-500 border-blue-400' : 'bg-surface border-white/10'}`}
                     >
                        {isFrozen ? <Unlock size={20} className="text-white" /> : <Lock size={20} className="text-white" />}
                        <Text className="text-xs font-medium text-white">{isFrozen ? 'Unfreeze' : 'Freeze'}</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                        onPress={handleRevealDetails}
                        className="flex-1 py-3 rounded-xl flex-col items-center justify-center gap-1 bg-surface border border-white/10"
                     >
                        {showDetails ? <EyeOff size={20} className="text-white" /> : <Eye size={20} className="text-white" />}
                        <Text className="text-xs font-medium text-white">{showDetails ? 'Hide' : 'Details'}</Text>
                     </TouchableOpacity>

                     <TouchableOpacity className="flex-1 py-3 rounded-xl flex-col items-center justify-center gap-1 bg-surface border border-white/10">
                        <CreditCard size={20} className="text-white" />
                        <Text className="text-xs font-medium text-white">Limits</Text>
                     </TouchableOpacity>
                 </Row>
             </View>

             {/* Settings */}
             <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">Controls</Text>
             <View className="bg-surface border border-white/10 rounded-2xl overflow-hidden mb-6">
                 <TouchableOpacity onPress={() => toggleSetting('onlinePayments')} className="flex-row items-center justify-between p-4 border-b border-white/5">
                     <Row className="items-center gap-3">
                         <View className="p-2 bg-blue-500/10 rounded-lg"><Globe size={18} className="text-blue-400" /></View>
                         <Text className="text-sm font-medium">Online Payments</Text>
                     </Row>
                     <View className={`w-11 h-6 rounded-full relative transition-colors ${settings.onlinePayments ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                         <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.onlinePayments ? 'left-6' : 'left-1'}`} />
                     </View>
                 </TouchableOpacity>
                 
                 <TouchableOpacity onPress={() => toggleSetting('international')} className="flex-row items-center justify-between p-4 border-b border-white/5">
                     <Row className="items-center gap-3">
                         <View className="p-2 bg-purple-500/10 rounded-lg"><Plane size={18} className="text-purple-400" /></View>
                         <Text className="text-sm font-medium">International Use</Text>
                     </Row>
                     <View className={`w-11 h-6 rounded-full relative transition-colors ${settings.international ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                         <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.international ? 'left-6' : 'left-1'}`} />
                     </View>
                 </TouchableOpacity>
                 
                 <TouchableOpacity onPress={() => toggleSetting('roundUpToSavings')} className="flex-row items-center justify-between p-4">
                     <Row className="items-center gap-3">
                         <View className="p-2 bg-orange-500/10 rounded-lg"><TrendingUp size={18} className="text-orange-400" /></View>
                         <View>
                             <Text className="text-sm font-medium">Round Up to BTC</Text>
                             <Text className="text-[10px] text-slate-400">Invest spare change</Text>
                         </View>
                     </Row>
                     <View className={`w-11 h-6 rounded-full relative transition-colors ${settings.roundUpToSavings ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                         <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.roundUpToSavings ? 'left-6' : 'left-1'}`} />
                     </View>
                 </TouchableOpacity>
             </View>

             {/* Transaction History */}
             <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">Recent Activity</Text>
             <View className="gap-2">
                 {(card.transactions || []).length === 0 ? (
                     <View className="p-4 border border-dashed border-white/10 rounded-xl items-center">
                         <Text className="text-slate-500 text-xs">No transactions yet.</Text>
                     </View>
                 ) : (
                     (card.transactions || []).map(tx => (
                         <Card key={tx.id} className="p-3">
                             <Row className="justify-between items-center">
                                 <Row className="items-center gap-3">
                                     <View className={`w-10 h-10 rounded-xl items-center justify-center ${tx.type === 'topup' ? 'bg-emerald-500/10' : 'bg-surface border border-white/5'}`}>
                                         <Text className="text-lg">{tx.icon || '💳'}</Text>
                                     </View>
                                     <View>
                                         <Text className="font-bold text-sm">{tx.merchant}</Text>
                                         <Text className="text-[10px] text-slate-500 capitalize">{tx.category} • {new Date(tx.date).toLocaleDateString()}</Text>
                                     </View>
                                 </Row>
                                 <Text className={`font-bold text-sm ${tx.type === 'topup' ? 'text-emerald-400' : 'text-white'}`}>
                                     {tx.type === 'topup' ? '+' : '-'}${tx.amount.toFixed(2)}
                                 </Text>
                             </Row>
                         </Card>
                     ))
                 )}
             </View>
         </View>

         {/* Digital Wallet Add */}
         <View className="px-5 pb-6">
             <TouchableOpacity className="w-full py-3 bg-white text-black rounded-xl flex-row items-center justify-center gap-2 shadow-lg">
                 <Smartphone size={18} className="text-black" />
                 <Text className="text-black font-bold text-sm">Add to Apple Wallet</Text>
             </TouchableOpacity>
         </View>
      </ScrollView>
    </View>
  );
};
