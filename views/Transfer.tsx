
import React, { useState } from 'react';
import { Asset } from '../types';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, QrCode, Copy, CheckCircle, Loader2, Scan } from 'lucide-react';
import { QRScanner } from '../components/ui/QRScanner';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Mock receive address
  const myAddress = "0x71C...9A23";

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
  );

  if (step === 'success') {
      return (
          <View className="flex-1 h-full items-center justify-center p-6 bg-black">
              <View className="w-24 h-24 bg-emerald-500/20 rounded-full items-center justify-center mb-6 animate-bounce">
                  <CheckCircle size={48} className="text-emerald-500" />
              </View>
              <Text className="text-2xl font-bold mb-2 text-white">Transaction Sent!</Text>
              <Text className="text-slate-400 text-center mb-8">
                  You successfully {type === 'send' ? 'sent' : 'received'} {amount} {selectedAsset.symbol}.
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
          <View className="flex-1 items-center pt-4">
              <View className="bg-white p-6 rounded-3xl mb-6 shadow-2xl">
                 <QrCode size={200} className="text-black" />
              </View>
              <Text className="text-slate-400 text-sm mb-2">Your {selectedAsset.name} Address</Text>
              <TouchableOpacity className="bg-surface border border-white/10 px-6 py-3 rounded-xl flex-row items-center gap-3 mb-8 active:scale-95 transition-transform">
                 <Text className="font-mono text-white text-lg">{myAddress}</Text>
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
              <View className="items-center mb-8">
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
    </View>
  );
};
