
import React, { useState, useEffect } from 'react';
import { ViewState, P2POffer, P2PTrade } from '../types';
import { View, Text, TouchableOpacity, Row, ScrollView, TextInput } from '../components/native';
import { ChevronLeft, MessageSquare, AlertTriangle, CheckCircle, Clock, Lock, Copy } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface P2POrderProps {
  offer: P2POffer;
  onNavigate: (view: ViewState) => void;
}

export const P2POrder: React.FC<P2POrderProps> = ({ offer, onNavigate }) => {
  // Trade State Machine: 'created' -> 'paid' -> 'released'
  const [status, setStatus] = useState<'created' | 'paid' | 'released'>('created');
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [amount, setAmount] = useState<string>('');
  const [isTradeStarted, setIsTradeStarted] = useState(false);
  
  // Mock Bank Details
  const bankDetails = {
      name: offer.traderName,
      bank: 'Chase Bank',
      account: '1234567890',
      routing: '021000021'
  };

  useEffect(() => {
     if (isTradeStarted && status !== 'released') {
         const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
         return () => clearInterval(timer);
     }
  }, [isTradeStarted, status]);

  const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startTrade = () => {
      if (!amount) return;
      setIsTradeStarted(true);
  };

  const handlePaymentMade = () => {
      if (confirm("Only confirm if you have actually transferred the funds. False confirmations can lead to account suspension.")) {
          setStatus('paid');
      }
  };
  
  const handleSimulateRelease = () => {
      setTimeout(() => {
          setStatus('released');
      }, 3000);
  };

  // Initial Input View
  if (!isTradeStarted) {
      return (
          <View className="flex-1 h-full bg-black p-5">
             <Row className="items-center gap-3 mb-6">
                <TouchableOpacity onPress={() => onNavigate(ViewState.P2P_MARKET)} className="p-2 rounded-full bg-surface border border-white/10">
                    <ChevronLeft size={20} className="text-white" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">Buy {offer.asset}</Text>
             </Row>

             <Card className="p-5 mb-6">
                 <Text className="text-sm text-slate-400 mb-2 font-bold">I want to pay</Text>
                 <Row className="bg-black/30 border border-white/10 rounded-xl p-3 items-center mb-4">
                     <TextInput 
                        autoFocus
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Limit ${offer.minLimit} - ${offer.maxLimit}`}
                        className="flex-1 text-white font-bold"
                        type="number"
                     />
                     <Text className="text-slate-400 font-bold ml-2">{offer.currency}</Text>
                 </Row>
                 
                 <Text className="text-sm text-slate-400 mb-2 font-bold">I will receive</Text>
                 <Row className="bg-black/30 border border-white/10 rounded-xl p-3 items-center mb-6">
                     <Text className="flex-1 text-slate-300 font-bold">
                        {amount ? (parseFloat(amount) / offer.price).toFixed(4) : '0.00'}
                     </Text>
                     <Text className="text-slate-400 font-bold ml-2">{offer.asset}</Text>
                 </Row>

                 <View className="bg-surface border border-white/5 rounded-xl p-3 mb-6">
                     <Row className="justify-between mb-2">
                         <Text className="text-xs text-slate-400">Price</Text>
                         <Text className="text-xs text-white font-bold">${offer.price}</Text>
                     </Row>
                     <Row className="justify-between">
                         <Text className="text-xs text-slate-400">Payment Method</Text>
                         <Text className="text-xs text-white font-bold">{offer.paymentMethods[0]}</Text>
                     </Row>
                 </View>

                 <TouchableOpacity 
                    onPress={startTrade}
                    disabled={!amount}
                    className={`w-full py-4 rounded-xl items-center justify-center ${!amount ? 'bg-slate-700' : 'bg-emerald-500'}`}
                 >
                    <Text className="font-bold text-white">Buy {offer.asset}</Text>
                 </TouchableOpacity>
             </Card>
          </View>
      );
  }

  // Active Trade View
  return (
    <View className="flex-1 h-full bg-black">
      {/* Secure Header */}
      <View className="px-4 py-4 bg-slate-900 border-b border-white/10">
         <Row className="justify-between items-start">
             <View>
                 <Row className="items-center gap-2 mb-1">
                     <Text className="text-lg font-bold text-white">Order Created</Text>
                     <View className="px-2 py-0.5 bg-yellow-500/20 rounded border border-yellow-500/30">
                         <Text className="text-[10px] text-yellow-500 font-bold">ESCROW SECURED</Text>
                     </View>
                 </Row>
                 <Text className="text-xs text-slate-400">Pay the seller within <Text className="text-emerald-400 font-mono font-bold">{formatTime(timeLeft)}</Text></Text>
             </View>
             <TouchableOpacity className="p-2 bg-surface border border-white/10 rounded-full">
                 <MessageSquare size={20} className="text-white" />
             </TouchableOpacity>
         </Row>
      </View>

      <ScrollView contentContainerStyle="p-5 pb-32">
          {/* Status Stepper */}
          <View className="mb-6">
              <Row className="items-center justify-between mb-2 px-2">
                  <Text className={`text-xs font-bold ${status === 'created' ? 'text-emerald-400' : 'text-white'}`}>Pay</Text>
                  <Text className={`text-xs font-bold ${status === 'paid' ? 'text-emerald-400' : 'text-slate-500'}`}>Wait</Text>
                  <Text className={`text-xs font-bold ${status === 'released' ? 'text-emerald-400' : 'text-slate-500'}`}>Release</Text>
              </Row>
              <View className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <View 
                    className={`h-full bg-emerald-500 transition-all duration-500`} 
                    style={{ width: status === 'created' ? '33%' : status === 'paid' ? '66%' : '100%' }} 
                  />
              </View>
          </View>

          {status === 'released' ? (
              <View className="items-center py-10">
                  <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-4">
                      <CheckCircle size={40} className="text-emerald-400" />
                  </View>
                  <Text className="text-2xl font-bold text-white mb-2">Trade Completed!</Text>
                  <Text className="text-slate-400 text-center mb-6">
                      {(parseFloat(amount) / offer.price).toFixed(4)} {offer.asset} has been added to your wallet.
                  </Text>
                  <TouchableOpacity onPress={() => onNavigate(ViewState.WALLET)} className="px-8 py-3 bg-surface border border-white/10 rounded-xl">
                      <Text className="text-white font-bold">Check Wallet</Text>
                  </TouchableOpacity>
              </View>
          ) : (
              <>
                  {/* Payment Details */}
                  <Card className="p-5 mb-4">
                      <Text className="text-xs font-bold text-slate-500 uppercase mb-4">Make Payment To</Text>
                      
                      <View className="space-y-4">
                          <View>
                              <Text className="text-xs text-slate-400 mb-1">Bank Name</Text>
                              <Row className="justify-between">
                                  <Text className="font-bold text-white">{bankDetails.bank}</Text>
                                  <Copy size={14} className="text-slate-500" />
                              </Row>
                          </View>
                          <View>
                              <Text className="text-xs text-slate-400 mb-1">Account Number</Text>
                              <Row className="justify-between">
                                  <Text className="font-bold text-white text-lg">{bankDetails.account}</Text>
                                  <Copy size={14} className="text-slate-500" />
                              </Row>
                          </View>
                          <View>
                              <Text className="text-xs text-slate-400 mb-1">Account Name</Text>
                              <Row className="justify-between">
                                  <Text className="font-bold text-white">{bankDetails.name}</Text>
                                  <Copy size={14} className="text-slate-500" />
                              </Row>
                          </View>
                          <View>
                              <Text className="text-xs text-slate-400 mb-1">Reference / Memo</Text>
                              <Row className="justify-between">
                                  <Text className="font-bold text-white">283194</Text>
                                  <Copy size={14} className="text-slate-500" />
                              </Row>
                          </View>
                      </View>

                      <View className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex-row gap-2">
                          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                          <Text className="text-[10px] text-red-200 leading-relaxed">
                              Do NOT include words like "Crypto", "BTC", or "USDT" in the bank transfer description, or the funds may be frozen.
                          </Text>
                      </View>
                  </Card>

                  {status === 'paid' && (
                       <View className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-4 flex-row gap-3 items-center">
                           <Clock size={20} className="text-indigo-400 animate-pulse" />
                           <View>
                               <Text className="text-sm font-bold text-indigo-200">Waiting for Seller</Text>
                               <Text className="text-xs text-indigo-300">Seller has been notified. Assets will be released shortly.</Text>
                               {/* Demo helper */}
                               <TouchableOpacity onPress={handleSimulateRelease} className="mt-2">
                                   <Text className="text-[10px] text-slate-500">(Debug: Simulate Seller Release)</Text>
                               </TouchableOpacity>
                           </View>
                       </View>
                  )}
              </>
          )}
      </ScrollView>

      {/* Footer Actions */}
      {status === 'created' && (
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-white/10">
              <Row className="justify-between mb-4">
                  <Text className="text-slate-400 text-sm">Total Amount</Text>
                  <Text className="text-xl font-bold text-emerald-400">${amount}</Text>
              </Row>
              <TouchableOpacity 
                 onPress={handlePaymentMade}
                 className="w-full py-4 bg-emerald-500 rounded-xl items-center justify-center shadow-lg"
              >
                 <Text className="font-bold text-white">Transferred, Notify Seller</Text>
              </TouchableOpacity>
          </View>
      )}
    </View>
  );
};
