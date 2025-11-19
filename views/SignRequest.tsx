
import React, { useState } from 'react';
import { ViewState, DAppTransaction, User } from '../types';
import { View, Text, TouchableOpacity, Row, ScrollView } from '../components/native';
import { ChevronLeft, ShieldCheck, AlertTriangle, ArrowDown, Fuel, Globe, CheckCircle, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Loader2 } from 'lucide-react';

interface SignRequestProps {
  transaction: DAppTransaction;
  user: User;
  onNavigate: (view: ViewState) => void;
  onConfirm: () => void;
  onReject: () => void;
}

export const SignRequest: React.FC<SignRequestProps> = ({ transaction, user, onNavigate, onConfirm, onReject }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm();
    }, 2000);
  };

  return (
    <View className="flex-1 h-full bg-black relative">
       {/* Security Header */}
       <View className="bg-slate-900 p-4 pt-6 border-b border-white/10">
           <Row className="justify-between items-start">
               <Row className="gap-3 items-center">
                   <View className="w-10 h-10 rounded-full bg-surface border border-white/10 items-center justify-center">
                       <Text className="text-xl">{transaction.dAppIcon || '🌐'}</Text>
                   </View>
                   <View>
                       <Text className="font-bold text-white">{transaction.dAppName}</Text>
                       <Row className="items-center gap-1">
                           <Globe size={10} className="text-slate-400" />
                           <Text className="text-xs text-slate-400">{transaction.dAppUrl}</Text>
                       </Row>
                   </View>
               </Row>
               <View className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded flex-row items-center gap-1">
                   <ShieldCheck size={12} className="text-emerald-400" />
                   <Text className="text-[10px] font-bold text-emerald-400">Verified</Text>
               </View>
           </Row>
       </View>

       <ScrollView contentContainerStyle="p-5 pb-32">
           <Text className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Signature Request</Text>
           
           {/* Action Card */}
           <Card className="p-5 mb-6 border-l-4 border-l-primary">
               <Text className="text-2xl font-bold text-white mb-1 capitalize">
                   {transaction.action.replace('_', ' ')}
               </Text>
               <Text className="text-slate-400 text-sm">
                   on {transaction.network} Network
               </Text>

               {/* Swap Specifics */}
               {transaction.action === 'swap' && (
                   <View className="mt-6">
                       <Row className="justify-between items-center mb-2">
                           <Text className="text-slate-400 font-medium">You Pay</Text>
                           <Text className="text-white font-bold text-lg">
                               {transaction.details.fromAmount} {transaction.details.fromSymbol}
                           </Text>
                       </Row>
                       <View className="items-center -my-2 z-10">
                           <div className="bg-slate-800 p-1 rounded-full border border-white/10">
                               <ArrowDown size={16} className="text-slate-400" />
                           </div>
                       </View>
                       <Row className="justify-between items-center mt-2">
                           <Text className="text-slate-400 font-medium">You Receive</Text>
                           <Text className="text-emerald-400 font-bold text-lg">
                               {transaction.details.toAmount} {transaction.details.toSymbol}
                           </Text>
                       </Row>
                   </View>
               )}

               {/* Approval Specifics */}
               {transaction.action === 'approve' && (
                   <View className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex-row gap-3">
                       <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0" />
                       <View>
                           <Text className="text-yellow-200 font-bold text-sm mb-1">Permission Request</Text>
                           <Text className="text-yellow-100/80 text-xs leading-relaxed">
                               You are allowing {transaction.dAppName} to spend your {transaction.details.fromSymbol}.
                           </Text>
                       </View>
                   </View>
               )}
           </Card>

           {/* Details */}
           <View className="space-y-3">
               <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Transaction Details</Text>
               
               <View className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                   <Row className="justify-between p-4 border-b border-white/5">
                       <Row className="items-center gap-2">
                           <Fuel size={16} className="text-slate-400" />
                           <Text className="text-sm text-slate-300">Network Fee</Text>
                       </Row>
                       <View className="items-end">
                           <Text className="text-sm font-bold text-white">
                               {transaction.details.gasFee ? `~$${transaction.details.gasFee}` : 'Unknown'}
                           </Text>
                           <Text className="text-[10px] text-slate-500">Market Rate</Text>
                       </View>
                   </Row>
                   <Row className="justify-between p-4">
                       <Text className="text-sm text-slate-300">Nonce</Text>
                       <Text className="text-sm font-mono text-slate-400">#42</Text>
                   </Row>
               </View>
           </View>
       </ScrollView>

       {/* Sticky Footer */}
       <View className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-white/10 backdrop-blur-xl">
           <Row className="gap-3">
               <TouchableOpacity 
                   onPress={onReject}
                   className="flex-1 py-4 bg-surface border border-white/10 rounded-xl items-center"
               >
                   <Text className="font-bold text-slate-300">Reject</Text>
               </TouchableOpacity>
               
               <TouchableOpacity 
                   onPress={handleConfirm}
                   disabled={isProcessing}
                   className="flex-[2] py-4 bg-primary rounded-xl items-center justify-center shadow-lg shadow-indigo-500/20"
               >
                   {isProcessing ? (
                       <Loader2 className="animate-spin text-white" />
                   ) : (
                       <Text className="font-bold text-white">Confirm</Text>
                   )}
               </TouchableOpacity>
           </Row>
       </View>
    </View>
  );
};
