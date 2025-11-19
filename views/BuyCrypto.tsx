
import React, { useState, useEffect } from 'react';
import { ViewState, Asset, FiatQuote, BankingCard } from '../types';
import { fiatService } from '../services/fiatService';
import { authService } from '../services/authService';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
import { ChevronLeft, Globe, CreditCard, ShieldCheck, ChevronRight, CheckCircle, Loader2, Info, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface BuyCryptoProps {
  assets: Asset[];
  preSelectedAssetId?: string | null;
  onBack: () => void;
  onSuccess: (type: 'buy', amount: number, symbol: string) => void;
}

export const BuyCrypto: React.FC<BuyCryptoProps> = ({ assets, preSelectedAssetId, onBack, onSuccess }) => {
  const [step, setStep] = useState<'amount' | 'provider' | 'payment' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState('100');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(assets.find(a => a.id === preSelectedAssetId) || assets[0]);
  const [quotes, setQuotes] = useState<FiatQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<FiatQuote | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [cards, setCards] = useState<BankingCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>(''); // ID

  // Load user cards for payment
  useEffect(() => {
      const user = authService.getCurrentUserSync(); // Assuming sync available or we'd use prop
      if (user) setCards(user.cards || []);
  }, []);

  const fetchQuotes = async () => {
      if (!amount || isNaN(parseFloat(amount))) return;
      setIsLoadingQuotes(true);
      try {
          const data = await fiatService.getQuotes(parseFloat(amount), 'USD', selectedAsset.symbol, selectedAsset.price);
          setQuotes(data);
          setStep('provider');
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingQuotes(false);
      }
  };

  const handleProviderSelect = (quote: FiatQuote) => {
      setSelectedQuote(quote);
      setStep('payment');
  };

  const handlePurchase = async () => {
      setStep('processing');
      try {
         await fiatService.processPayment(selectedQuote?.providerId || '', parseFloat(amount), { card: selectedCard });
         // Wait a bit for effect
         onSuccess('buy', selectedQuote?.cryptoAmount || 0, selectedAsset.symbol);
         setStep('success');
      } catch (e) {
         alert('Payment Failed');
         setStep('payment');
      }
  };

  if (step === 'success') {
      return (
          <View className="flex-1 h-full bg-black items-center justify-center p-6">
              <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center mb-6 animate-bounce">
                  <CheckCircle size={48} className="text-emerald-500" />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">Purchase Successful!</Text>
              <Text className="text-slate-400 text-center mb-8">
                  Your {selectedQuote?.cryptoAmount} {selectedAsset.symbol} is on its way. It typically arrives within {selectedQuote?.deliveryTime}.
              </Text>
              <TouchableOpacity onPress={onBack} className="w-full bg-surface border border-white/10 py-4 rounded-xl items-center">
                  <Text className="font-bold text-white">Return to Wallet</Text>
              </TouchableOpacity>
          </View>
      );
  }

  if (step === 'processing') {
      return (
          <View className="flex-1 h-full bg-black items-center justify-center p-6">
              <Loader2 size={64} className="text-primary animate-spin mb-6" />
              <Text className="text-xl font-bold text-white mb-2">Processing Payment...</Text>
              <Text className="text-slate-400 text-sm">Securely connecting to {selectedQuote?.providerName}</Text>
          </View>
      );
  }

  return (
    <View className="flex-1 h-full bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center gap-3 bg-background border-b border-white/5">
         <TouchableOpacity onPress={step === 'amount' ? onBack : () => setStep(step === 'payment' ? 'provider' : 'amount')} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft size={24} className="text-white" />
         </TouchableOpacity>
         <Text className="text-lg font-bold">Buy {selectedAsset.symbol}</Text>
      </View>

      <ScrollView contentContainerStyle="p-5 pb-24">
         
         {/* Step 1: Amount & Asset */}
         {step === 'amount' && (
             <View>
                 <View className="items-center mb-8 mt-4">
                     <Text className="text-slate-400 font-bold text-sm mb-2">I want to spend</Text>
                     <Row className="items-center justify-center gap-1">
                         <Text className="text-5xl font-bold text-white">$</Text>
                         <TextInput 
                             value={amount}
                             onChange={(e) => setAmount(e.target.value)}
                             className="text-5xl font-bold text-white bg-transparent w-40 text-center"
                             inputMode="decimal"
                             autoFocus
                         />
                     </Row>
                     <Text className="text-slate-500 text-sm mt-2">
                         ≈ {(parseFloat(amount || '0') / selectedAsset.price).toFixed(6)} {selectedAsset.symbol}
                     </Text>
                 </View>

                 <Text className="text-xs font-bold text-slate-500 uppercase ml-1 mb-3">Select Asset</Text>
                 <ScrollView horizontal className="mb-8" showsHorizontalScrollIndicator={false}>
                     {assets.map(asset => (
                         <TouchableOpacity 
                            key={asset.id}
                            onPress={() => setSelectedAsset(asset)}
                            className={`mr-3 px-4 py-3 rounded-xl border flex-row items-center gap-2 ${selectedAsset.id === asset.id ? 'bg-white border-white' : 'bg-surface border-white/10'}`}
                         >
                            <View className={`w-6 h-6 rounded-full items-center justify-center ${asset.color}`}>
                               <Text className="text-[10px] font-bold text-white">{asset.symbol[0]}</Text>
                            </View>
                            <Text className={`font-bold text-sm ${selectedAsset.id === asset.id ? 'text-black' : 'text-white'}`}>{asset.symbol}</Text>
                         </TouchableOpacity>
                     ))}
                 </ScrollView>

                 <TouchableOpacity 
                    onPress={fetchQuotes}
                    disabled={!amount || isLoadingQuotes}
                    className="w-full bg-primary py-4 rounded-xl items-center justify-center flex-row gap-2"
                 >
                    {isLoadingQuotes ? <Loader2 className="animate-spin text-white" /> : <Text className="text-white font-bold text-lg">Get Quotes</Text>}
                 </TouchableOpacity>
             </View>
         )}

         {/* Step 2: Select Provider */}
         {step === 'provider' && (
             <View className="space-y-4">
                 <Text className="text-sm text-slate-400 mb-2">Select a provider for the best rate.</Text>
                 {quotes.map((quote) => (
                     <Card 
                        key={quote.providerId} 
                        onClick={() => handleProviderSelect(quote)}
                        className={`p-4 ${quote.isBestRate ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                     >
                         <Row className="items-center justify-between mb-3">
                             <Row className="items-center gap-3">
                                 <View className="w-10 h-10 rounded-full bg-surface border border-white/10 items-center justify-center text-xl">
                                     <Text>{quote.providerLogo}</Text>
                                 </View>
                                 <View>
                                     <Text className="font-bold text-white">{quote.providerName}</Text>
                                     <Text className="text-xs text-slate-400">{quote.deliveryTime}</Text>
                                 </View>
                             </Row>
                             {quote.isBestRate && (
                                 <View className="bg-emerald-500 px-2 py-1 rounded text-[10px] font-bold text-white">BEST RATE</View>
                             )}
                         </Row>
                         <View className="bg-black/20 rounded-lg p-3 flex-row justify-between items-center">
                             <View>
                                 <Text className="text-xs text-slate-500">You Get</Text>
                                 <Text className="text-lg font-bold text-white">{quote.cryptoAmount} {selectedAsset.symbol}</Text>
                             </View>
                             <ChevronRight size={16} className="text-slate-500" />
                         </View>
                     </Card>
                 ))}
             </View>
         )}

         {/* Step 3: Payment Method */}
         {step === 'payment' && selectedQuote && (
             <View className="space-y-6">
                 <Card className="p-4 bg-surface/50">
                     <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Order Summary</Text>
                     <Row className="justify-between mb-2">
                         <Text className="text-sm text-slate-300">You Pay</Text>
                         <Text className="text-sm font-bold text-white">${selectedQuote.fiatAmount.toFixed(2)}</Text>
                     </Row>
                     <Row className="justify-between mb-2">
                         <Text className="text-sm text-slate-300">Network Fee</Text>
                         <Text className="text-sm text-slate-400">${selectedQuote.fee.toFixed(2)}</Text>
                     </Row>
                     <View className="h-px bg-white/10 my-2" />
                     <Row className="justify-between">
                         <Text className="text-sm font-bold text-white">You Get</Text>
                         <Text className="text-lg font-bold text-emerald-400">{selectedQuote.cryptoAmount} {selectedAsset.symbol}</Text>
                     </Row>
                 </Card>

                 <View>
                     <Text className="text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Payment Method</Text>
                     
                     {/* Internal Cards */}
                     {cards.map(card => (
                         <TouchableOpacity 
                            key={card.id}
                            onPress={() => setSelectedCard(card.id)}
                            className={`p-4 mb-2 rounded-xl border flex-row items-center justify-between ${selectedCard === card.id ? 'bg-primary/20 border-primary' : 'bg-surface border-white/10'}`}
                         >
                             <Row className="items-center gap-3">
                                 <Wallet size={20} className={selectedCard === card.id ? 'text-primary' : 'text-slate-400'} />
                                 <View>
                                     <Text className="font-bold text-sm text-white">Nova Card •••• {card.last4}</Text>
                                     <Text className="text-xs text-slate-400">Balance: ${card.balance.toFixed(2)}</Text>
                                 </View>
                             </Row>
                             {selectedCard === card.id && <CheckCircle size={18} className="text-primary" />}
                         </TouchableOpacity>
                     ))}

                     {/* Apple Pay / External */}
                     <TouchableOpacity 
                        onPress={() => setSelectedCard('apple_pay')}
                        className={`p-4 mb-2 rounded-xl border flex-row items-center justify-between ${selectedCard === 'apple_pay' ? 'bg-white text-black' : 'bg-surface border-white/10'}`}
                     >
                         <Row className="items-center gap-3">
                             <CreditCard size={20} className={selectedCard === 'apple_pay' ? 'text-black' : 'text-slate-400'} />
                             <Text className={`font-bold text-sm ${selectedCard === 'apple_pay' ? 'text-black' : 'text-white'}`}>Apple Pay</Text>
                         </Row>
                         {selectedCard === 'apple_pay' && <CheckCircle size={18} className="text-black" />}
                     </TouchableOpacity>
                 </View>

                 <TouchableOpacity 
                    onPress={handlePurchase}
                    disabled={!selectedCard}
                    className={`w-full py-4 rounded-xl items-center justify-center ${!selectedCard ? 'bg-slate-700 opacity-50' : 'bg-primary shadow-lg'}`}
                 >
                    <Text className="text-white font-bold text-lg">Confirm Purchase</Text>
                 </TouchableOpacity>

                 <Row className="justify-center items-center gap-2 mt-2">
                     <ShieldCheck size={14} className="text-emerald-500" />
                     <Text className="text-xs text-slate-500">Processed securely by {selectedQuote.providerName}</Text>
                 </Row>
             </View>
         )}

      </ScrollView>
    </View>
  );
};
