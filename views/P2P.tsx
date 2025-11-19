
import React, { useState } from 'react';
import { ViewState, P2POffer } from '../types';
import { View, Text, TouchableOpacity, Row, ScrollView, TextInput } from '../components/native';
import { ChevronLeft, Filter, Star, CheckCircle, Clock, ShieldCheck, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface P2PProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

// Mock Data
const MOCK_OFFERS: P2POffer[] = [
  {
    id: 'offer_1',
    traderName: 'FastCrypto_Official',
    traderRating: 98,
    tradesCount: 1250,
    type: 'buy',
    asset: 'USDT',
    currency: 'USD',
    price: 1.02,
    minLimit: 10,
    maxLimit: 5000,
    paymentMethods: ['Bank Transfer', 'Zelle'],
    isOnline: true
  },
  {
    id: 'offer_2',
    traderName: 'SecureTrader247',
    traderRating: 95,
    tradesCount: 450,
    type: 'buy',
    asset: 'USDT',
    currency: 'USD',
    price: 1.03,
    minLimit: 50,
    maxLimit: 2000,
    paymentMethods: ['PayPal', 'CashApp'],
    isOnline: true
  },
  {
    id: 'offer_3',
    traderName: 'BitWhale',
    traderRating: 99,
    tradesCount: 3200,
    type: 'sell',
    asset: 'BTC',
    currency: 'USD',
    price: 66500,
    minLimit: 100,
    maxLimit: 10000,
    paymentMethods: ['Bank Transfer'],
    isOnline: false
  }
];

export const P2P: React.FC<P2PProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [asset, setAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  
  const filteredOffers = MOCK_OFFERS.filter(o => o.type === mode && o.asset === asset);

  const handleTrade = (offer: P2POffer) => {
      // In a real app, we'd pass the offer object
      onNavigate(ViewState.P2P_ORDER, { offerId: offer.id, offer });
  };

  return (
    <View className="flex-1 h-full bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between bg-background border-b border-white/5 z-10">
         <Row className="items-center gap-3">
            <TouchableOpacity onPress={() => onNavigate(ViewState.HOME)} className="p-2 rounded-full bg-surface border border-white/10">
                <ChevronLeft size={20} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">P2P Trading</Text>
         </Row>
         <View className="flex-row bg-surface rounded-lg border border-white/10 p-0.5">
             <TouchableOpacity 
               onPress={() => setMode('buy')}
               className={`px-4 py-1.5 rounded-md ${mode === 'buy' ? 'bg-emerald-500' : 'bg-transparent'}`}
             >
                 <Text className={`text-xs font-bold ${mode === 'buy' ? 'text-white' : 'text-slate-400'}`}>Buy</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => setMode('sell')}
               className={`px-4 py-1.5 rounded-md ${mode === 'sell' ? 'bg-red-500' : 'bg-transparent'}`}
             >
                 <Text className={`text-xs font-bold ${mode === 'sell' ? 'text-white' : 'text-slate-400'}`}>Sell</Text>
             </TouchableOpacity>
         </View>
      </View>

      {/* Filters */}
      <View className="px-4 py-3 border-b border-white/5">
         <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 pb-2">
             {['USDT', 'BTC', 'ETH', 'USDC'].map(a => (
                 <TouchableOpacity 
                    key={a}
                    onPress={() => setAsset(a)}
                    className={`px-4 py-2 rounded-full border ${asset === a ? 'bg-white border-white' : 'bg-surface border-white/10'}`}
                 >
                    <Text className={`text-xs font-bold ${asset === a ? 'text-black' : 'text-slate-300'}`}>{a}</Text>
                 </TouchableOpacity>
             ))}
         </ScrollView>
         
         <Row className="items-center gap-2 mt-2 bg-surface/50 border border-white/5 rounded-xl px-3 py-2">
            <Text className="text-xs font-bold text-slate-400">Amount</Text>
            <TextInput 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               placeholder="Enter amount..."
               className="flex-1 text-sm text-white"
               type="number"
            />
            <Text className="text-xs font-bold text-slate-500">USD</Text>
         </Row>
      </View>

      <ScrollView contentContainerStyle="p-4 pb-24">
         {filteredOffers.length === 0 && (
             <View className="items-center py-10">
                 <Text className="text-slate-500">No offers found for these criteria.</Text>
             </View>
         )}

         {filteredOffers.map(offer => (
             <Card key={offer.id} className="p-4 mb-3">
                 <Row className="justify-between items-start mb-3">
                     <View>
                         <Row className="items-center gap-1.5 mb-1">
                             <Text className="font-bold text-base">{offer.traderName}</Text>
                             <ShieldCheck size={14} className="text-emerald-400" />
                         </Row>
                         <Row className="gap-2">
                             <Text className="text-[10px] text-slate-400">{offer.tradesCount} trades</Text>
                             <Text className="text-[10px] text-slate-400">|</Text>
                             <Text className="text-[10px] text-emerald-400">{offer.traderRating}% completion</Text>
                         </Row>
                     </View>
                     <View className="items-end">
                         <Text className="text-xl font-bold text-primary">${offer.price.toFixed(2)}</Text>
                     </View>
                 </Row>

                 <Row className="justify-between items-end">
                     <View className="space-y-1">
                         <Text className="text-[10px] text-slate-500">Limits: ${offer.minLimit} - ${offer.maxLimit}</Text>
                         <Row className="gap-1 flex-wrap max-w-[200px]">
                             {offer.paymentMethods.map((pm, i) => (
                                 <View key={i} className="px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                                     <Text className="text-[9px] text-slate-300">{pm}</Text>
                                 </View>
                             ))}
                         </Row>
                     </View>
                     <TouchableOpacity 
                        onPress={() => handleTrade(offer)}
                        className={`px-6 py-2 rounded-lg ${mode === 'buy' ? 'bg-emerald-500' : 'bg-red-500'}`}
                     >
                        <Text className="text-white font-bold text-sm capitalize">{mode} {offer.asset}</Text>
                     </TouchableOpacity>
                 </Row>
             </Card>
         ))}
      </ScrollView>
    </View>
  );
};
