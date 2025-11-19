
import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
import { ChevronLeft, ArrowDown, Settings, Info, Loader2, RefreshCw } from 'lucide-react';

interface SwapProps {
  assets: Asset[];
  onBack: () => void;
  onSwap: (fromSymbol: string, fromAmount: number, toSymbol: string, toAmount: number) => void;
}

export const Swap: React.FC<SwapProps> = ({ assets, onBack, onSwap }) => {
  const [fromAsset, setFromAsset] = useState<Asset>(assets[0]);
  const [toAsset, setToAsset] = useState<Asset>(assets.length > 1 ? assets[1] : assets[0]);
  
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  
  const [isSelectingSource, setIsSelectingSource] = useState<boolean | null>(null); // true = from, false = to, null = closed
  const [isLoading, setIsLoading] = useState(false);
  const [slippage, setSlippage] = useState(0.5);

  // Rate calculation
  const rate = fromAsset.price / toAsset.price;

  const handleFromChange = (val: string) => {
    setFromAmount(val);
    if (!val) {
      setToAmount('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setToAmount((num * rate).toFixed(6));
    }
  };

  const handleToChange = (val: string) => {
    setToAmount(val);
    if (!val) {
      setFromAmount('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setFromAmount((num / rate).toFixed(6));
    }
  };

  const flipAssets = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount('');
    setToAmount('');
  };

  const handleMax = () => {
     handleFromChange(fromAsset.balance.toString());
  };

  const executeSwap = () => {
     if (!fromAmount || parseFloat(fromAmount) > fromAsset.balance) return;
     setIsLoading(true);
     setTimeout(() => {
        onSwap(fromAsset.symbol, parseFloat(fromAmount), toAsset.symbol, parseFloat(toAmount));
        setIsLoading(false);
     }, 2000);
  };

  const AssetModal = () => {
     if (isSelectingSource === null) return null;
     return (
        <View className="absolute inset-0 z-50 bg-black/90 p-4">
           <Row className="items-center justify-between mb-4">
              <Text className="text-xl font-bold">Select Token</Text>
              <TouchableOpacity onPress={() => setIsSelectingSource(null)} className="p-2 bg-surface rounded-full">
                 <Text className="text-xs text-white">Close</Text>
              </TouchableOpacity>
           </Row>
           <ScrollView>
              {assets.map(asset => (
                 <TouchableOpacity 
                   key={asset.id}
                   onPress={() => {
                      if (isSelectingSource) setFromAsset(asset);
                      else setToAsset(asset);
                      setIsSelectingSource(null);
                      setFromAmount('');
                      setToAmount('');
                   }}
                   className="flex-row items-center justify-between p-4 border-b border-white/10"
                 >
                    <Row className="items-center gap-3">
                       <View className={`w-8 h-8 rounded-full items-center justify-center ${asset.color}`}>
                          <Text className="font-bold text-white text-xs">{asset.symbol[0]}</Text>
                       </View>
                       <View>
                          <Text className="font-bold">{asset.symbol}</Text>
                          <Text className="text-xs text-slate-400">{asset.name}</Text>
                       </View>
                    </Row>
                    <View className="items-end">
                       <Text className="font-bold">{asset.balance}</Text>
                       <Text className="text-xs text-slate-400">${asset.price.toLocaleString()}</Text>
                    </View>
                 </TouchableOpacity>
              ))}
           </ScrollView>
        </View>
     );
  };

  return (
    <View className="flex-1 h-full bg-black relative">
      <AssetModal />

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between z-10">
        <TouchableOpacity onPress={onBack} className="p-2 rounded-full bg-surface border border-white/10">
           <ChevronLeft size={20} className="text-white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Swap</Text>
        <TouchableOpacity className="p-2">
           <Settings size={20} className="text-slate-400" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle="p-4">
         {/* FROM CARD */}
         <View className="bg-surface border border-white/10 rounded-2xl p-4 mb-2 relative">
            <Row className="justify-between mb-2">
               <Text className="text-slate-400 text-xs font-bold">Pay with</Text>
               <Text className="text-slate-400 text-xs">Balance: {fromAsset.balance} {fromAsset.symbol}</Text>
            </Row>
            <Row className="items-center justify-between h-12">
               <TextInput 
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromChange(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 text-3xl font-bold bg-transparent border-none text-white placeholder:text-slate-600"
               />
               <TouchableOpacity 
                  onPress={() => setIsSelectingSource(true)}
                  className="flex-row items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10"
               >
                  <View className={`w-5 h-5 rounded-full items-center justify-center ${fromAsset.color}`}>
                     <Text className="text-[8px] font-bold">{fromAsset.symbol[0]}</Text>
                  </View>
                  <Text className="font-bold text-sm">{fromAsset.symbol}</Text>
                  <ChevronLeft size={12} className="-rotate-90 text-slate-400" />
               </TouchableOpacity>
            </Row>
            <Row className="justify-between mt-2">
               <Text className="text-xs text-slate-500">≈ ${((parseFloat(fromAmount) || 0) * fromAsset.price).toFixed(2)}</Text>
               <Row className="gap-2">
                  {[25, 50, 100].map(pct => (
                     <TouchableOpacity 
                        key={pct} 
                        onPress={() => pct === 100 ? handleMax() : handleFromChange((fromAsset.balance * (pct/100)).toFixed(6))}
                        className="bg-white/5 px-2 py-0.5 rounded text-xs font-medium text-primary"
                     >
                        <Text className="text-[10px] text-primary font-bold">{pct === 100 ? 'MAX' : `${pct}%`}</Text>
                     </TouchableOpacity>
                  ))}
               </Row>
            </Row>
         </View>

         {/* SWAP ARROW */}
         <View className="items-center -my-5 z-10">
            <TouchableOpacity 
               onPress={flipAssets}
               className="bg-slate-900 border-4 border-black p-2 rounded-xl"
            >
               <ArrowDown size={20} className="text-white" />
            </TouchableOpacity>
         </View>

         {/* TO CARD */}
         <View className="bg-surface border border-white/10 rounded-2xl p-4 pt-6">
            <Row className="justify-between mb-2">
               <Text className="text-slate-400 text-xs font-bold">Receive</Text>
               <Text className="text-slate-400 text-xs">Balance: {toAsset.balance} {toAsset.symbol}</Text>
            </Row>
            <Row className="items-center justify-between h-12">
               <TextInput 
                  type="number"
                  value={toAmount}
                  onChange={(e) => handleToChange(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 text-3xl font-bold bg-transparent border-none text-white placeholder:text-slate-600"
               />
               <TouchableOpacity 
                  onPress={() => setIsSelectingSource(false)}
                  className="flex-row items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10"
               >
                  <View className={`w-5 h-5 rounded-full items-center justify-center ${toAsset.color}`}>
                     <Text className="text-[8px] font-bold">{toAsset.symbol[0]}</Text>
                  </View>
                  <Text className="font-bold text-sm">{toAsset.symbol}</Text>
                  <ChevronLeft size={12} className="-rotate-90 text-slate-400" />
               </TouchableOpacity>
            </Row>
            <Text className="text-xs text-slate-500 mt-2">≈ ${((parseFloat(toAmount) || 0) * toAsset.price).toFixed(2)}</Text>
         </View>

         {/* Info Section */}
         <View className="mt-4 p-4 border border-white/5 rounded-xl space-y-3">
            <Row className="justify-between">
               <Row className="items-center gap-1">
                  <Text className="text-xs text-slate-400">Rate</Text>
                  <RefreshCw size={10} className="text-slate-400" />
               </Row>
               <Text className="text-xs font-medium text-white">1 {fromAsset.symbol} = {rate.toFixed(4)} {toAsset.symbol}</Text>
            </Row>
            <Row className="justify-between">
               <Row className="items-center gap-1">
                  <Text className="text-xs text-slate-400">Slippage Tolerance</Text>
                  <Info size={10} className="text-slate-400" />
               </Row>
               <Text className="text-xs font-medium text-emerald-400">{slippage}%</Text>
            </Row>
            <Row className="justify-between">
               <Text className="text-xs text-slate-400">Network Fee</Text>
               <Row className="items-center gap-1">
                  <Text className="text-xs font-medium text-white">~$2.50</Text>
                  <Text className="text-[10px] text-slate-500 line-through">$5.00</Text>
               </Row>
            </Row>
         </View>

         <TouchableOpacity 
            onPress={executeSwap}
            disabled={isLoading || !fromAmount || parseFloat(fromAmount) > fromAsset.balance}
            className={`mt-6 w-full py-4 rounded-xl items-center justify-center shadow-lg ${
               !fromAmount || parseFloat(fromAmount) > fromAsset.balance 
               ? 'bg-slate-700 opacity-50' 
               : 'bg-primary'
            }`}
         >
            {isLoading ? (
               <Loader2 className="animate-spin text-white" />
            ) : (
               <Text className="text-white font-bold text-lg">
                  {parseFloat(fromAmount) > fromAsset.balance ? 'Insufficient Balance' : 'Preview Swap'}
               </Text>
            )}
         </TouchableOpacity>

         <View className="items-center mt-4">
             <Text className="text-[10px] text-slate-500">Powered by Nova Routing Protocol</Text>
         </View>
      </ScrollView>
    </View>
  );
};
