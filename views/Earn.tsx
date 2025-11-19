
import React, { useState, useEffect } from 'react';
import { ViewState, StakingOption, StakingPosition, Asset } from '../types';
import { cryptoService } from '../services/cryptoService';
import { ChevronLeft, TrendingUp, ShieldCheck, Info, AlertTriangle, Lock, Unlock, Coins, Loader2, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';

interface EarnProps {
  onNavigate: (view: ViewState) => void;
  onAskAI: (prompt: string) => void;
  assets: Asset[];
}

export const Earn: React.FC<EarnProps> = ({ onNavigate, onAskAI, assets }) => {
  const [tab, setTab] = useState<'explore' | 'portfolio'>('explore');
  const [options, setOptions] = useState<StakingOption[]>([]);
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedOption, setSelectedOption] = useState<StakingOption | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [opts, pos] = await Promise.all([
        cryptoService.getStakingOptions(),
        cryptoService.getUserStakes()
    ]);
    setOptions(opts);
    setPositions(pos);
    setIsLoading(false);
  };

  const handleAnalyze = (option: StakingOption) => {
     const prompt = `Conduct a risk analysis for staking ${option.assetSymbol} on ${option.name}. The current APY is ${option.apy}%. What are the smart contract risks and potential impermanent loss scenarios?`;
     onAskAI(prompt);
  };

  const handleStake = async () => {
     if (!selectedOption || !stakeAmount) return;
     setIsStaking(true);
     
     // Simulate API call
     setTimeout(() => {
         const newPos: StakingPosition = {
             id: 'pos_' + Date.now(),
             optionId: selectedOption.id,
             amount: parseFloat(stakeAmount),
             rewardsEarned: 0,
             startDate: Date.now()
         };
         setPositions(prev => [newPos, ...prev]);
         setIsStaking(false);
         setSelectedOption(null);
         setStakeAmount('');
         setTab('portfolio');
         alert(`Successfully staked ${stakeAmount} ${selectedOption.assetSymbol}`);
     }, 2000);
  };

  const getAssetBalance = (symbol: string) => {
     const asset = assets.find(a => a.symbol === symbol);
     return asset ? asset.balance : 0;
  };

  return (
    <View className="flex-1 h-full bg-black">
       {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={() => onNavigate(ViewState.HOME)} className="p-2 rounded-full bg-surface border border-white/10">
           <ChevronLeft size={20} className="text-white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Earn Hub</Text>
        <TouchableOpacity className="p-2 rounded-full bg-surface border border-white/10">
           <Info size={20} className="text-slate-400" />
        </TouchableOpacity>
      </View>

      {/* Dashboard Stats */}
      <ScrollView contentContainerStyle="p-5 pb-24">
         <View className="mb-6">
             <View className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                 <View className="relative z-10">
                     <Text className="text-indigo-100 text-sm font-medium mb-1">Total Staked Value</Text>
                     <Text className="text-3xl font-bold text-white mb-4">$12,450.00</Text>
                     <Row className="gap-4">
                         <View>
                             <Text className="text-xs text-indigo-200 mb-0.5">Lifetime Earnings</Text>
                             <Text className="text-lg font-bold text-white">+$420.69</Text>
                         </View>
                         <View>
                             <Text className="text-xs text-indigo-200 mb-0.5">Avg. APY</Text>
                             <Text className="text-lg font-bold text-white">6.8%</Text>
                         </View>
                     </Row>
                 </View>
                 <Coins className="absolute -right-6 -bottom-6 text-white opacity-20" size={140} />
             </View>
         </View>

         {/* Tabs */}
         <Row className="p-1 bg-surface rounded-xl border border-white/5 mb-6">
            <TouchableOpacity 
              onPress={() => setTab('explore')}
              className={`flex-1 py-2 items-center rounded-lg ${tab === 'explore' ? 'bg-white/10 shadow-sm' : ''}`}
            >
               <Text className={`text-sm font-bold ${tab === 'explore' ? 'text-white' : 'text-slate-400'}`}>Explore</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setTab('portfolio')}
              className={`flex-1 py-2 items-center rounded-lg ${tab === 'portfolio' ? 'bg-white/10 shadow-sm' : ''}`}
            >
               <Text className={`text-sm font-bold ${tab === 'portfolio' ? 'text-white' : 'text-slate-400'}`}>My Stakes</Text>
            </TouchableOpacity>
         </Row>

         {isLoading ? (
             <View className="items-center py-10">
                 <Loader2 className="animate-spin text-primary" />
             </View>
         ) : (
             <View className="gap-3">
                 {tab === 'explore' ? (
                     options.map(option => (
                         <Card key={option.id} className="p-4">
                             <Row className="items-center justify-between mb-3">
                                 <Row className="items-center gap-3">
                                     <View className={`w-10 h-10 rounded-full items-center justify-center bg-slate-700`}>
                                         <Text className="font-bold text-white">{option.assetSymbol[0]}</Text>
                                     </View>
                                     <View>
                                         <Text className="font-bold text-sm">{option.name}</Text>
                                         <Row className="items-center gap-1">
                                             <Text className="text-xs text-slate-400">Lock: {option.lockPeriodDays > 0 ? `${option.lockPeriodDays} Days` : 'Flexible'}</Text>
                                             <Text className="text-slate-500">•</Text>
                                             <Text className={`text-xs font-bold ${option.riskLevel === 'Low' ? 'text-emerald-400' : option.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                                                 {option.riskLevel} Risk
                                             </Text>
                                         </Row>
                                     </View>
                                 </Row>
                                 <TouchableOpacity onPress={() => handleAnalyze(option)} className="p-2 bg-indigo-500/10 rounded-full">
                                     <ShieldCheck size={18} className="text-indigo-400" />
                                 </TouchableOpacity>
                             </Row>

                             <View className="bg-surface border border-white/5 rounded-xl p-3 flex-row justify-between items-center mb-3">
                                 <View>
                                     <Text className="text-xs text-slate-500">Annual Yield</Text>
                                     <Text className="text-xl font-bold text-emerald-400">{option.apy}% APY</Text>
                                 </View>
                                 <TouchableOpacity 
                                     onPress={() => setSelectedOption(option)}
                                     className="bg-primary px-6 py-2 rounded-lg shadow-lg shadow-indigo-500/20"
                                 >
                                     <Text className="font-bold text-white text-sm">Stake</Text>
                                 </TouchableOpacity>
                             </View>
                         </Card>
                     ))
                 ) : (
                     positions.length === 0 ? (
                         <View className="items-center py-10 border border-dashed border-white/10 rounded-xl">
                            <Wallet className="text-slate-600 mb-2" size={32} />
                            <Text className="text-slate-500 text-sm">No active stakes found.</Text>
                            <TouchableOpacity onPress={() => setTab('explore')}>
                               <Text className="text-primary text-sm mt-2 font-bold">Start Earning</Text>
                            </TouchableOpacity>
                         </View>
                     ) : (
                         positions.map(pos => {
                             const opt = options.find(o => o.id === pos.optionId);
                             return (
                                 <Card key={pos.id} className="p-4 border-l-4 border-l-indigo-500">
                                     <Row className="items-center justify-between mb-3">
                                         <Row className="items-center gap-3">
                                             <View className="w-8 h-8 rounded-full bg-indigo-500/20 items-center justify-center">
                                                 <TrendingUp size={16} className="text-indigo-400" />
                                             </View>
                                             <View>
                                                 <Text className="font-bold text-sm">{opt?.name}</Text>
                                                 <Text className="text-xs text-slate-400">Staked: {pos.amount} {opt?.assetSymbol}</Text>
                                             </View>
                                         </Row>
                                         <View className="items-end">
                                             <Text className="text-xs text-slate-500">Rewards</Text>
                                             <Text className="font-bold text-emerald-400">+{pos.rewardsEarned} {opt?.assetSymbol}</Text>
                                         </View>
                                     </Row>
                                     <Row className="gap-2 mt-2">
                                         <TouchableOpacity className="flex-1 py-2 bg-surface border border-white/10 rounded-lg items-center">
                                             <Text className="text-xs font-bold text-white">Compound</Text>
                                         </TouchableOpacity>
                                         <TouchableOpacity className="flex-1 py-2 bg-surface border border-white/10 rounded-lg items-center">
                                             <Text className="text-xs font-bold text-white">Unstake</Text>
                                         </TouchableOpacity>
                                     </Row>
                                 </Card>
                             );
                         })
                     )
                 )}
             </View>
         )}
      </ScrollView>

      {/* Stake Modal */}
      {selectedOption && (
         <View className="absolute inset-0 z-50 bg-black/90 p-4 flex items-center justify-center">
             <View className="w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-5">
                 <Row className="justify-between items-center mb-4">
                     <Text className="text-xl font-bold">Stake {selectedOption.assetSymbol}</Text>
                     <TouchableOpacity onPress={() => setSelectedOption(null)} className="p-1 bg-white/10 rounded-full">
                         <Text className="text-xs text-slate-300 px-2">Cancel</Text>
                     </TouchableOpacity>
                 </Row>
                 
                 <View className="bg-black/30 rounded-xl p-4 mb-4">
                     <Row className="justify-between mb-2">
                        <Text className="text-xs text-slate-400">Amount to Stake</Text>
                        <Text className="text-xs text-slate-400">Balance: {getAssetBalance(selectedOption.assetSymbol)}</Text>
                     </Row>
                     <Row className="items-center gap-2">
                         <TextInput 
                             value={stakeAmount}
                             onChange={(e) => setStakeAmount(e.target.value)}
                             placeholder="0.00"
                             className="flex-1 text-2xl font-bold bg-transparent border-none text-white"
                             type="number"
                         />
                         <TouchableOpacity onPress={() => setStakeAmount(getAssetBalance(selectedOption.assetSymbol).toString())}>
                             <Text className="text-primary text-xs font-bold">MAX</Text>
                         </TouchableOpacity>
                     </Row>
                 </View>

                 <View className="space-y-2 mb-6">
                     <Row className="justify-between">
                         <Text className="text-sm text-slate-400">APY Rate</Text>
                         <Text className="text-sm font-bold text-emerald-400">{selectedOption.apy}%</Text>
                     </Row>
                     <Row className="justify-between">
                         <Text className="text-sm text-slate-400">Lock Period</Text>
                         <Text className="text-sm font-bold text-white">{selectedOption.lockPeriodDays === 0 ? 'Flexible' : `${selectedOption.lockPeriodDays} Days`}</Text>
                     </Row>
                 </View>

                 <TouchableOpacity 
                     onPress={handleStake}
                     disabled={isStaking || !stakeAmount}
                     className="w-full bg-primary py-4 rounded-xl items-center justify-center"
                 >
                     {isStaking ? <Loader2 className="animate-spin text-white" /> : <Text className="text-white font-bold">Confirm Stake</Text>}
                 </TouchableOpacity>
             </View>
         </View>
      )}
    </View>
  );
};
