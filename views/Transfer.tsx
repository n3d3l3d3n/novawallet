
import React, { useState } from 'react';
import { Asset } from '../types';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, QrCode, Copy, CheckCircle, Loader2, Scan, Globe, AlertTriangle, Network } from 'lucide-react';
import { QRScanner } from '../components/ui/QRScanner';
import { chainService } from '../services/chainService';

interface TransferProps {
  type: 'send' | 'receive';
  assets: Asset[];
  preSelectedAssetId?: string | null;
  onBack: () => void;
  onSuccess: (type: 'send' | 'receive', amount: number, symbol: string) => void;
}

export const Transfer: React.FC<TransferProps> = ({ type, assets, preSelectedAssetId, onBack, onSuccess }) => {
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(
    assets.find(a => a.id === preSelectedAssetId) || assets[0]
  );
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  
  // Multi-chain state
  const [selectedNetwork, setSelectedNetwork] = useState<string>(''); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  const wallets = chainService.getWallets();

  // Initialize selected network based on asset
  React.useEffect(() => {
      if (selectedAsset) {
          // If asset only has 1 network, select it. Else default to main 'network' prop.
          setSelectedNetwork(selectedAsset.network);
      }
  }, [selectedAsset]);

  // Get real receive address generation based on network
  const getMyAddress = (network: string) => {
     if (network === 'Bitcoin') return wallets.btcAddress;
     if (network === 'Solana') return wallets.solanaAddress;
     // EVM Chains share the same address
     if (['Ethereum', 'Polygon', 'BSC', 'Optimism', 'Arbitrum'].includes(network)) return wallets.evmAddress;
     
     // Fallback for mocked networks
     return wallets.evmAddress; 
  };

  const handleMax = () => {
      if (type === 'send') {
          setAmount(selectedAsset.balance.toString());
      }
  };

  const handleSubmit = async () => {
      if (step === 'input') {
          if (!amount || parseFloat(amount) <= 0) return;
          if (type === 'send' && (!address || parseFloat(amount) > selectedAsset.balance)) return;
          setStep('confirm');
      } else if (step === 'confirm') {
          setIsLoading(true);
          // Simulate network delay
          setTimeout(() => {
              setIsLoading(false);
              onSuccess(type, parseFloat(amount), selectedAsset.symbol);
              setStep('success');
          }, 2000);
      }
  };

  const handleScan = (data: string) => {
      setAddress(data);
      setShowScanner(false);
  };

  const AssetSelector = () => (
      <ScrollView horizontal className="mb-6 pb-2" showsHorizontalScrollIndicator={false}>
          {assets.map(asset => (
              <TouchableOpacity 
                 key={asset.id}
                 onPress={() => {
                     setSelectedAsset(asset);
                     setSelectedNetwork(asset.network); // Reset to default
                 }}
                 className={`mr-3 px-4 py-3 rounded-xl border flex-row items-center gap-2 ${selectedAsset.id === asset.id ? 'bg-white border-white' : 'bg-surface border-white/10'}`}
              >
                 <View className={`w-6 h-6 rounded-full items-center justify-center ${asset.color}`}>
                    <Text className="text-[10px] font-bold text-white">{asset.symbol[0]}</Text>
                 </View>
                 <Text className={`font-bold text-sm ${selectedAsset.id === asset.id ? 'text-black' : 'text-white'}`}>{asset.symbol}</Text>
              </TouchableOpacity>
          ))}
      </ScrollView>
  );

  if (step === 'success') {
      return (
          <View className="flex-1 h-full items-center justify-center p-6 bg-black">
              <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center mb-6 animate-bounce">
                  <CheckCircle size={48} className="text-emerald-500" />
              </View>
              <Text className="text-2xl font-bold mb-2 text-white">Transaction Sent!</Text>
              <Text className="text-slate-400 text-center mb-8">
                  You successfully {type === 'send' ? 'sent' : 'received'} {amount} {selectedAsset.symbol} on {selectedNetwork || selectedAsset.network}.
              </Text>
              <TouchableOpacity onPress={onBack} className="w-full bg-surface border border-white/10 py-4 rounded-xl items-center">
                  <Text className="font-bold text-white">Return to Wallet</Text>
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <View className="flex-1 h-full bg-black p-5">
      {showScanner && (
         <QRScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
            label="Scan Recipient Address"
         />
      )}

      <Row className="items-center justify-between mb-6 mt-2">
          <TouchableOpacity onPress={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold capitalize">{type} Crypto</Text>
          <View className="w-10" />
      </Row>

      {/* Asset Selection */}
      <AssetSelector />

      {type === 'receive' ? (
          <View className="flex-1 items-center pt-2">
              
              {/* Network Selector (Critical for Receive) */}
              <TouchableOpacity 
                onPress={() => setShowNetworkSelector(true)}
                className="bg-surface border border-white/10 px-5 py-3 rounded-full flex-row items-center gap-2 mb-6"
              >
                  <Globe size={16} className="text-slate-400" />
                  <Text className="text-sm text-white">Network: <span className="font-bold text-primary">{selectedNetwork}</span></Text>
                  <Text className="text-xs text-slate-500">▼</Text>
              </TouchableOpacity>

              <View className="bg-white p-6 rounded-3xl mb-6 shadow-2xl">
                 <QrCode size={200} className="text-black" />
              </View>
              <Text className="text-slate-400 text-sm mb-2">Your {selectedAsset.symbol} Address ({selectedNetwork})</Text>
              
              <View className="w-full bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl mb-6 flex-row gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0" />
                  <Text className="text-xs text-yellow-200 leading-relaxed">
                      Only send {selectedAsset.symbol} ({selectedNetwork}) to this address. Sending other assets may result in permanent loss.
                  </Text>
              </View>

              <TouchableOpacity className="bg-surface border border-white/10 px-6 py-3 rounded-xl flex-row items-center gap-3 mb-8 active:scale-95 transition-transform w-full justify-center">
                 <Text className="font-mono text-white text-sm truncate">{getMyAddress(selectedNetwork)}</Text>
                 <Copy size={16} className="text-primary" />
              </TouchableOpacity>
              
              {/* Simulate receiving from external source */}
              <TouchableOpacity 
                 onPress={() => { setAmount('0.5'); handleSubmit(); }}
                 className="mt-auto w-full bg-surface border border-white/10 py-4 rounded-xl items-center"
              >
                 <Text className="text-slate-400 text-xs">Simulate Incoming Transfer (Demo)</Text>
              </TouchableOpacity>
          </View>
      ) : (
          <View className="flex-1">
              {/* Send Form */}
              <View className="items-center mb-6">
                 <Text className="text-5xl font-bold text-white mb-2">
                     {amount || '0'}
                 </Text>
                 <Text className="text-slate-400 text-lg uppercase">{selectedAsset.symbol}</Text>
                 <Text className="text-slate-500 text-sm mt-1">
                    ≈ ${(parseFloat(amount || '0') * selectedAsset.price).toFixed(2)} USD
                 </Text>
              </View>

              {step === 'confirm' ? (
                  <View className="bg-surface border border-white/10 rounded-2xl p-5 space-y-4 mb-4">
                      <Row className="justify-between">
                          <Text className="text-slate-400">To</Text>
                          <Text className="text-white font-mono text-xs truncate max-w-[200px]">{address}</Text>
                      </Row>
                      <Row className="justify-between">
                          <Text className="text-slate-400">Network</Text>
                          <Text className="text-white font-bold">{selectedNetwork}</Text>
                      </Row>
                      <Row className="justify-between">
                          <Text className="text-slate-400">Network Fee</Text>
                          <Text className="text-white">0.0004 {selectedAsset.symbol} ($1.20)</Text>
                      </Row>
                      <Row className="justify-between pt-4 border-t border-white/10">
                          <Text className="font-bold text-white">Total</Text>
                          <Text className="font-bold text-white">{amount} {selectedAsset.symbol}</Text>
                      </Row>
                  </View>
              ) : (
                  <View className="space-y-4">
                     {/* Network Selector for Send - Critical for Multi-chain Assets */}
                     <View className="space-y-2">
                         <Text className="text-sm font-bold text-slate-400 ml-1">Network</Text>
                         <TouchableOpacity 
                            onPress={() => setShowNetworkSelector(true)}
                            className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 flex-row justify-between items-center"
                         >
                            <Row className="gap-2 items-center">
                                <Network size={16} className="text-primary" />
                                <Text className="text-white font-bold">{selectedNetwork}</Text>
                            </Row>
                            <Text className="text-slate-500 text-xs">Change</Text>
                         </TouchableOpacity>
                         {selectedAsset.availableNetworks && selectedAsset.availableNetworks.length > 1 && (
                             <Text className="text-[10px] text-yellow-500 ml-1">Ensure recipient address supports {selectedNetwork}</Text>
                         )}
                     </View>

                     {/* Address Input */}
                     <View className="space-y-2">
                        <Text className="text-sm font-bold text-slate-400 ml-1">Recipient Address</Text>
                        <View className="relative">
                           <TextInput 
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder={`Enter ${selectedAsset.symbol} Address`}
                              className="w-full bg-surface border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white font-mono text-sm"
                           />
                           <TouchableOpacity 
                             onPress={() => setShowScanner(true)}
                             className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
                           >
                              <Scan size={20} className="text-slate-400" />
                           </TouchableOpacity>
                        </View>
                     </View>

                     {/* Amount Input */}
                     <View className="space-y-2">
                        <Row className="justify-between px-1">
                           <Text className="text-sm font-bold text-slate-400">Amount</Text>
                           <Text className="text-xs text-slate-500">Available: {selectedAsset.balance} {selectedAsset.symbol}</Text>
                        </Row>
                        <View className="relative">
                           <TextInput 
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-surface border border-white/10 rounded-xl py-4 pl-4 pr-16 text-white font-bold text-lg"
                           />
                           <TouchableOpacity 
                             onPress={handleMax}
                             className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 px-2 py-1 rounded-md"
                           >
                              <Text className="text-xs font-bold text-primary">MAX</Text>
                           </TouchableOpacity>
                        </View>
                     </View>
                  </View>
              )}

              <TouchableOpacity 
                  onPress={handleSubmit}
                  disabled={step === 'input' && (!amount || !address)}
                  className="mt-auto w-full bg-primary py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-500/20"
              >
                  {isLoading ? (
                      <Loader2 className="animate-spin text-white" />
                  ) : (
                      <Row className="gap-2 items-center">
                          {step === 'input' ? <ArrowUpRight size={20} /> : <CheckCircle size={20} />}
                          <Text className="font-bold text-white text-lg">
                             {step === 'input' ? 'Review' : 'Confirm Send'}
                          </Text>
                      </Row>
                  )}
              </TouchableOpacity>
          </View>
      )}

      {/* Network Selector Drawer */}
      {showNetworkSelector && (
          <View className="absolute inset-0 bg-black/90 z-50 flex justify-end">
              <View className="bg-surface rounded-t-3xl p-6 pb-10">
                  <Row className="justify-between items-center mb-6">
                      <Text className="text-xl font-bold text-white">Select Network</Text>
                      <TouchableOpacity onPress={() => setShowNetworkSelector(false)} className="p-2 bg-white/10 rounded-full">
                          <Text className="text-xs text-white">Close</Text>
                      </TouchableOpacity>
                  </Row>
                  <Text className="text-sm text-slate-400 mb-4">Transactions sent to the wrong network may be lost forever.</Text>
                  <ScrollView className="max-h-80">
                      {(selectedAsset.availableNetworks || [selectedAsset.network]).map((net) => (
                          <TouchableOpacity 
                             key={net}
                             onPress={() => {
                                 setSelectedNetwork(net);
                                 setShowNetworkSelector(false);
                             }}
                             className={`p-4 mb-3 rounded-xl border flex-row items-center justify-between ${selectedNetwork === net ? 'bg-primary/20 border-primary' : 'bg-black/30 border-white/10'}`}
                          >
                              <Row className="items-center gap-3">
                                  <Globe size={20} className={selectedNetwork === net ? 'text-primary' : 'text-slate-400'} />
                                  <Text className={`font-bold ${selectedNetwork === net ? 'text-white' : 'text-slate-300'}`}>{net}</Text>
                              </Row>
                              {selectedNetwork === net && <CheckCircle size={20} className="text-primary" />}
                          </TouchableOpacity>
                      ))}
                  </ScrollView>
              </View>
          </View>
      )}
    </View>
  );
};
