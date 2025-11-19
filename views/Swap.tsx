
import React, { useState, useEffect } from 'react';
import { Asset, Chain, SwapRoute, LimitOrder } from '../types';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
import { ChevronLeft, ArrowDown, Settings, Info, Loader2, RefreshCw, ArrowRightLeft, TrendingUp, Clock, CheckCircle, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { TradingChart } from '../components/ui/TradingChart';
import { swapService } from '../services/swapService';
import { RouteCard } from '../components/ui/RouteCard';

interface SwapProps {
  assets: Asset[];
  onBack: () => void;
  onSwap: (fromSymbol: string, fromAmount: number, toSymbol: string, toAmount: number) => void;
}

export const Swap: React.FC<SwapProps> = ({ assets, onBack, onSwap }) => {
  const [mode, setMode] = useState<'market' | 'limit'>('market');
  
  // Token & Chain State
  const [fromAsset, setFromAsset] = useState<Asset>(assets[0]);
  const [toAsset, setToAsset] = useState<Asset>(assets.length > 1 ? assets[1] : assets[0]);
  const [sourceChain, setSourceChain] = useState<Chain>('Ethereum');
  const [destChain, setDestChain] = useState<Chain>('Ethereum');
  
  const [fromAmount, setFromAmount] = useState('');
  
  // Routing State
  const [routes, setRoutes] = useState<SwapRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SwapRoute | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isSwapProcessing, setIsSwapProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<{text: string, index: number} | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<string | null>(null); // Tx Hash

  // Limit Order State
  const [targetPrice, setTargetPrice] = useState('');
  const [activeOrders, setActiveOrders] = useState<LimitOrder[]>([]);

  // UI Helpers
  const [isSelectingSource, setIsSelectingSource] = useState<boolean | null>(null);
  const [slippage, setSlippage] = useState(0.5);
  
  // Rate calculation
  const rate = fromAsset.price / toAsset.price;

  // Chart Data Mock
  const generateChartData = () => {
     const basePrice = fromAsset.price / toAsset.price;
     return Array.from({length: 24}, (_, i) => ({
         time: `${i}:00`,
         value: basePrice * (1 + (Math.random() * 0.05 - 0.025))
     }));
  };
  const [chartData, setChartData] = useState(generateChartData());

  useEffect(() => {
     setChartData(generateChartData());
     setRoutes([]); // Clear routes when tokens change
     setSelectedRoute(null);
  }, [fromAsset, toAsset, sourceChain, destChain]);

  // Debounce Route Fetching
  useEffect(() => {
     const timer = setTimeout(() => {
         if (fromAmount && parseFloat(fromAmount) > 0) {
             fetchRoutes();
         }
     }, 500);
     return () => clearTimeout(timer);
  }, [fromAmount, fromAsset, toAsset, sourceChain, destChain]);

  const fetchRoutes = async () => {
      setIsLoadingRoutes(true);
      try {
          const data = await swapService.getRoutes(sourceChain, destChain, fromAsset, toAsset, parseFloat(fromAmount));
          setRoutes(data);
          // Auto-select best return
          const best = data.find(r => r.tags?.includes('Best Return')) || data[0];
          setSelectedRoute(best);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingRoutes(false);
      }
  };

  const handleMax = () => {
     setFromAmount(fromAsset.balance.toString());
  };

  const flipAssets = () => {
    const tempAsset = fromAsset;
    const tempChain = sourceChain;
    setFromAsset(toAsset);
    setSourceChain(destChain);
    setToAsset(tempAsset);
    setDestChain(tempChain);
    setFromAmount('');
    setRoutes([]);
  };

  const executeSwap = async () => {
     if (!selectedRoute || !fromAmount) return;
     setIsSwapProcessing(true);
     
     try {
         const txHash = await swapService.executeSwap(selectedRoute, (step, idx) => {
             setProgressStep({ text: step, index: idx });
         });
         
         setSwapSuccess(txHash);
         onSwap(fromAsset.symbol, parseFloat(fromAmount), toAsset.symbol, selectedRoute.outputAmount);
         setFromAmount('');
     } catch (e) {
         alert('Swap Failed');
         setIsSwapProcessing(false);
         setProgressStep(null);
     }
  };

  const placeLimitOrder = () => {
      const newOrder: LimitOrder = {
          id: 'ord_' + Date.now(),
          fromSymbol: fromAsset.symbol,
          toSymbol: toAsset.symbol,
          amount: parseFloat(fromAmount),
          targetPrice: parseFloat(targetPrice),
          expiry: Date.now() + 86400000,
          status: 'open',
          createdAt: Date.now()
      };
      setActiveOrders([newOrder, ...activeOrders]);
      setFromAmount('');
      setTargetPrice('');
      alert('Limit Order Placed');
  };

  const AssetModal = () => {
     if (isSelectingSource === null) return null;
     return (
        <View className="absolute inset-0 z-50 bg-black/95 p-5 animate-in fade-in duration-200">
           <Row className="items-center justify-between mb-6">
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
                      if (isSelectingSource) {
                          setFromAsset(asset);
                          // Auto-set chain to asset's default
                          setSourceChain(asset.network as Chain);
                      } else {
                          setToAsset(asset);
                          setDestChain(asset.network as Chain);
                      }
                      setIsSelectingSource(null);
                   }}
                   className="flex-row items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
                 >
                    <Row className="items-center gap-3">
                       <View className={`w-10 h-10 rounded-full items-center justify-center ${asset.color}`}>
                          <Text className="font-bold text-white">{asset.symbol[0]}</Text>
                       </View>
                       <View>
                          <Text className="font-bold text-base text-white">{asset.symbol}</Text>
                          <Text className="text-xs text-slate-400">{asset.name}</Text>
                       </View>
                    </Row>
                    <View className="items-end">
                       <Text className="font-bold text-white">{asset.balance}</Text>
                       <Text className="text-xs text-slate-400">${asset.price.toLocaleString()}</Text>
                    </View>
                 </TouchableOpacity>
              ))}
           </ScrollView>
        </View>
     );
  };

  const ChainSelector = ({ value, onChange }: { value: Chain, onChange: (c: Chain) => void }) => (
      <select 
         value={value}
         onChange={(e) => onChange(e.target.value as Chain)}
         className="bg-transparent text-xs font-bold text-slate-400 outline-none appearance-none text-right pr-4"
      >
          {['Ethereum', 'Solana', 'Bitcoin', 'Polygon', 'BSC', 'Optimism', 'Arbitrum'].map(c => (
              <option key={c} value={c} className="bg-slate-800">{c}</option>
          ))}
      </select>
  );

  // --- SUCCESS SCREEN ---
  if (swapSuccess) {
      return (
          <View className="flex-1 h-full bg-black items-center justify-center p-6">
              <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
                  <CheckCircle size={48} className="text-emerald-500" />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">Transaction Submitted</Text>
              <Text className="text-slate-400 text-center mb-8">
                  Swap from {fromAsset.symbol} to {toAsset.symbol} initiated via {selectedRoute?.providerName}.
              </Text>
              {selectedRoute?.type === 'BRIDGE' && (
                  <View className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-8 flex-row gap-3">
                      <Info size={20} className="text-blue-400 flex-shrink-0" />
                      <Text className="text-xs text-blue-200 leading-relaxed">
                          This is a cross-chain transaction. It may take ~{Math.ceil((selectedRoute.estimatedTimeSeconds)/60)} minutes to arrive on {destChain}.
                      </Text>
                  </View>
              )}
              <TouchableOpacity 
                 onPress={() => {
                     setSwapSuccess(null);
                     setIsSwapProcessing(false);
                     setProgressStep(null);
                 }} 
                 className="w-full bg-surface border border-white/10 py-4 rounded-xl items-center"
              >
                  <Text className="font-bold text-white">Start New Swap</Text>
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <View className="flex-1 h-full bg-black relative">
      <AssetModal />

      {/* Progress Overlay */}
      {isSwapProcessing && (
          <View className="absolute inset-0 z-[60] bg-black/95 flex items-center justify-center p-6">
              <Loader2 size={64} className="text-primary animate-spin mb-8" />
              <Text className="text-xl font-bold text-white mb-2">Processing Swap...</Text>
              
              {/* Steps */}
              <View className="w-full max-w-xs space-y-4 mt-6">
                  {selectedRoute?.steps.map((step, idx) => {
                      const isCurrent = progressStep?.index === idx;
                      const isDone = (progressStep?.index || 0) > idx;
                      return (
                          <Row key={idx} className="items-center gap-4">
                              <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${isDone ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'border-primary' : 'border-slate-700'}`}>
                                  {isDone && <CheckCircle size={14} className="text-white" />}
                              </View>
                              <Text className={`text-sm font-medium ${isDone ? 'text-white' : isCurrent ? 'text-primary' : 'text-slate-500'}`}>
                                  {step}
                              </Text>
                          </Row>
                      );
                  })}
              </View>
          </View>
      )}

      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between z-10 bg-background border-b border-white/5">
        <Row className="items-center gap-3">
            <TouchableOpacity onPress={onBack} className="p-2 rounded-full bg-surface border border-white/10">
                <ChevronLeft size={20} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">Nova Swap</Text>
        </Row>
        <View className="flex-row bg-surface rounded-lg border border-white/10 p-0.5">
             <TouchableOpacity 
               onPress={() => setMode('market')}
               className={`px-3 py-1 rounded-md ${mode === 'market' ? 'bg-white/10' : 'bg-transparent'}`}
             >
                 <Text className={`text-[10px] font-bold ${mode === 'market' ? 'text-white' : 'text-slate-400'}`}>Market</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => setMode('limit')}
               className={`px-3 py-1 rounded-md ${mode === 'limit' ? 'bg-white/10' : 'bg-transparent'}`}
             >
                 <Text className={`text-[10px] font-bold ${mode === 'limit' ? 'text-white' : 'text-slate-400'}`}>Limit</Text>
             </TouchableOpacity>
         </View>
      </View>

      <ScrollView contentContainerStyle="p-4 pb-32">
         
         {/* Chart */}
         <View className="mb-6">
             <TradingChart data={chartData} color={fromAsset.change24h >= 0 ? '#10b981' : '#ef4444'} />
             <Row className="justify-between mt-2 px-2">
                 <Text className="text-xs font-bold text-white">{fromAsset.symbol}/{toAsset.symbol}</Text>
                 <Row className="gap-1">
                    <Text className={`text-xs font-bold ${fromAsset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {rate.toFixed(6)}
                    </Text>
                    {sourceChain !== destChain && (
                        <View className="bg-purple-500/20 px-1.5 rounded ml-2 border border-purple-500/30">
                            <Text className="text-[9px] font-bold text-purple-300">CROSS-CHAIN</Text>
                        </View>
                    )}
                 </Row>
             </Row>
         </View>

         {/* Input Card */}
         <View className="bg-surface border border-white/10 rounded-2xl p-4 pt-2 mb-2">
            <Row className="justify-between items-center mb-2 border-b border-white/5 pb-2">
               <Text className="text-slate-400 text-xs font-bold">Pay From</Text>
               <ChainSelector value={sourceChain} onChange={setSourceChain} />
            </Row>
            <Row className="items-center justify-between h-12 mt-2">
               <TextInput 
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
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
                  <Text className="font-bold text-sm text-white">{fromAsset.symbol}</Text>
                  <ChevronLeft size={12} className="-rotate-90 text-slate-400" />
               </TouchableOpacity>
            </Row>
            <Row className="justify-between mt-2">
                <Text className="text-xs text-slate-500">≈ ${(parseFloat(fromAmount || '0') * fromAsset.price).toFixed(2)}</Text>
                <TouchableOpacity onPress={handleMax}>
                    <Text className="text-xs font-bold text-primary">Max: {fromAsset.balance.toFixed(4)}</Text>
                </TouchableOpacity>
            </Row>
         </View>

         {/* Swap Direction */}
         <View className="items-center -my-5 z-10">
            <TouchableOpacity 
               onPress={flipAssets}
               className="bg-slate-900 border-4 border-black p-2 rounded-xl shadow-lg"
            >
               <ArrowDown size={20} className="text-white" />
            </TouchableOpacity>
         </View>

         {/* Output Card */}
         <View className="bg-surface border border-white/10 rounded-2xl p-4 pt-6 mb-6">
            <Row className="justify-between items-center mb-2 border-b border-white/5 pb-2">
               <Text className="text-slate-400 text-xs font-bold">Receive On</Text>
               <ChainSelector value={destChain} onChange={setDestChain} />
            </Row>
            <Row className="items-center justify-between h-12 mt-2">
               <TextInput 
                  readOnly
                  value={selectedRoute ? selectedRoute.outputAmount.toFixed(6) : ''}
                  placeholder="0.0"
                  className="flex-1 text-3xl font-bold bg-transparent border-none text-emerald-400 placeholder:text-slate-600"
               />
               <TouchableOpacity 
                  onPress={() => setIsSelectingSource(false)}
                  className="flex-row items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10"
               >
                  <View className={`w-5 h-5 rounded-full items-center justify-center ${toAsset.color}`}>
                     <Text className="text-[8px] font-bold">{toAsset.symbol[0]}</Text>
                  </View>
                  <Text className="font-bold text-sm text-white">{toAsset.symbol}</Text>
                  <ChevronLeft size={12} className="-rotate-90 text-slate-400" />
               </TouchableOpacity>
            </Row>
         </View>

         {/* LIMIT ORDER INPUT */}
         {mode === 'limit' && (
             <View className="bg-surface border border-white/10 rounded-2xl p-4 mb-6 animate-in slide-in-from-top duration-200">
                 <Row className="justify-between mb-2">
                    <Text className="text-slate-400 text-xs font-bold">Target Price ({toAsset.symbol})</Text>
                    <Text className="text-xs text-primary font-bold">Current: {rate.toFixed(6)}</Text>
                 </Row>
                 <TextInput 
                     type="number"
                     value={targetPrice}
                     onChange={(e) => setTargetPrice(e.target.value)}
                     placeholder={rate.toFixed(6)}
                     className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white font-mono font-bold text-lg"
                 />
                 <TouchableOpacity 
                    onPress={placeLimitOrder}
                    disabled={!fromAmount || !targetPrice}
                    className="mt-4 w-full bg-white/10 border border-white/10 py-3 rounded-xl items-center"
                 >
                     <Text className="font-bold text-white">Place Order</Text>
                 </TouchableOpacity>
             </View>
         )}

         {/* Routes Section */}
         {mode === 'market' && (
             <View className="space-y-4">
                 {isLoadingRoutes ? (
                     <View className="items-center py-4">
                         <Loader2 className="animate-spin text-slate-500" />
                         <Text className="text-xs text-slate-500 mt-2">Fetching best routes...</Text>
                     </View>
                 ) : routes.length > 0 ? (
                     <View>
                         <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Select Route</Text>
                         {routes.map(route => (
                             <RouteCard 
                                key={route.id} 
                                route={route} 
                                selected={selectedRoute?.id === route.id} 
                                onSelect={() => setSelectedRoute(route)}
                                toSymbol={toAsset.symbol}
                             />
                         ))}
                     </View>
                 ) : fromAmount ? (
                     <Text className="text-center text-xs text-slate-500">No routes found.</Text>
                 ) : null}
             </View>
         )}
         
         {/* Limit Orders List */}
         {mode === 'limit' && activeOrders.length > 0 && (
             <View className="mt-4">
                 <Text className="text-xs font-bold text-slate-500 uppercase mb-2">Active Orders</Text>
                 {activeOrders.map(order => (
                     <View key={order.id} className="bg-surface/50 border border-white/5 rounded-xl p-3 mb-2">
                         <Row className="justify-between items-center">
                             <Row className="gap-2 items-center">
                                 <Clock size={14} className="text-yellow-400" />
                                 <Text className="font-bold text-sm text-white">
                                     Buy {order.toSymbol} @ {order.targetPrice}
                                 </Text>
                             </Row>
                             <TouchableOpacity onPress={() => setActiveOrders(activeOrders.filter(o => o.id !== order.id))} className="p-1.5 bg-red-500/10 rounded-full">
                                 <XCircle size={14} className="text-red-400" />
                             </TouchableOpacity>
                         </Row>
                         <Text className="text-xs text-slate-500 mt-1 ml-6">
                             Converting {order.amount} {order.fromSymbol}
                         </Text>
                     </View>
                 ))}
             </View>
         )}

      </ScrollView>

      {/* Action Footer */}
      {mode === 'market' && (
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-background/90 border-t border-white/10 backdrop-blur-xl">
             <TouchableOpacity 
                onPress={executeSwap}
                disabled={isSwapProcessing || !selectedRoute || parseFloat(fromAmount) > fromAsset.balance}
                className={`w-full py-4 rounded-xl items-center justify-center shadow-lg flex-row gap-2 ${!selectedRoute || parseFloat(fromAmount) > fromAsset.balance ? 'bg-slate-700 opacity-50' : 'bg-primary'}`}
             >
                {isSwapProcessing ? (
                   <Loader2 className="animate-spin text-white" />
                ) : (
                   <Text className="text-white font-bold text-lg">
                      {parseFloat(fromAmount) > fromAsset.balance 
                         ? 'Insufficient Balance' 
                         : sourceChain !== destChain ? `Bridge via ${selectedRoute?.providerName}`
                         : `Swap via ${selectedRoute?.providerName}`
                      }
                   </Text>
                )}
             </TouchableOpacity>
          </View>
      )}
    </View>
  );
};
