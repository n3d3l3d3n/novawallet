
import React, { useState, useRef } from 'react';
import { ViewState, NFTTrait } from '../types';
import { cryptoService } from '../services/cryptoService';
import { ChevronLeft, Image as ImageIcon, Upload, Plus, Trash2, Loader2, Sparkles, Zap } from 'lucide-react';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput, Image } from '../components/native';

interface CreatorStudioProps {
  onNavigate: (view: ViewState) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<'details' | 'preview' | 'minting' | 'success'>('details');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [image, setImage] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chain, setChain] = useState<'ETH' | 'SOL' | 'POLY'>('ETH');
  const [supply, setSupply] = useState('1');
  const [traits, setTraits] = useState<NFTTrait[]>([]);
  const [newTraitType, setNewTraitType] = useState('');
  const [newTraitValue, setNewTraitValue] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
     }
  };

  const addTrait = () => {
     if(newTraitType && newTraitValue) {
         setTraits([...traits, { type: newTraitType, value: newTraitValue, rarity: 0 }]);
         setNewTraitType('');
         setNewTraitValue('');
     }
  };

  const removeTrait = (idx: number) => {
     setTraits(traits.filter((_, i) => i !== idx));
  };

  const handleMint = async () => {
      setStep('minting');
      try {
          await cryptoService.mintNFT({
              name,
              description,
              imageUrl: image,
              chain,
              traits,
              collectionName: 'Nova Creator Series'
          });
          setStep('success');
      } catch (e) {
          console.error(e);
          setStep('details');
      }
  };

  if (step === 'success') {
      return (
          <View className="flex-1 h-full bg-black items-center justify-center p-6">
              <View className="w-32 h-32 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mb-6 items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                  <Sparkles size={48} className="text-white" />
              </View>
              <Text className="text-3xl font-bold text-white mb-2 text-center">Minted Successfully!</Text>
              <Text className="text-slate-400 text-center mb-8 max-w-xs">
                  Your NFT has been created on the {chain === 'ETH' ? 'Ethereum' : chain === 'SOL' ? 'Solana' : 'Polygon'} blockchain and added to your wallet.
              </Text>
              <Row className="w-full gap-3">
                  <TouchableOpacity onPress={() => onNavigate(ViewState.HOME)} className="flex-1 py-4 bg-surface border border-white/10 rounded-xl items-center">
                      <Text className="font-bold text-white">Go Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                      setStep('details');
                      setImage('');
                      setName('');
                      setDescription('');
                      setTraits([]);
                  }} className="flex-1 py-4 bg-primary rounded-xl items-center">
                      <Text className="font-bold text-white">Mint Another</Text>
                  </TouchableOpacity>
              </Row>
          </View>
      );
  }

  return (
    <View className="flex-1 h-full bg-black flex flex-col">
       {/* Header */}
       <View className="px-4 py-3 flex-row items-center justify-between z-10 bg-background border-b border-white/5">
        <Row className="items-center gap-3">
            <TouchableOpacity onPress={() => onNavigate(ViewState.HOME)} className="p-2 rounded-full bg-surface border border-white/10">
                <ChevronLeft size={20} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">Creator Studio</Text>
        </Row>
        <View className="px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <Text className="text-[10px] font-bold text-indigo-300">BETA</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle="p-4 pb-24">
         {step === 'minting' ? (
             <View className="items-center justify-center py-20">
                 <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                 <Text className="text-xl font-bold mb-2">Minting NFT...</Text>
                 <Text className="text-slate-400 text-sm">Uploading metadata to IPFS</Text>
                 <Text className="text-slate-500 text-xs mt-1">Confirming transaction on {chain}</Text>
             </View>
         ) : step === 'preview' ? (
             <View className="space-y-6">
                 <Text className="text-2xl font-bold text-center">Preview</Text>
                 
                 <View className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto w-full">
                     <Image source={image} className="w-full aspect-square object-cover" />
                     <View className="p-5">
                         <Text className="text-indigo-400 font-bold text-xs mb-1 tracking-wider">NOVA CREATOR SERIES</Text>
                         <Text className="text-2xl font-bold text-white mb-2">{name}</Text>
                         <Text className="text-slate-400 text-sm mb-4 leading-relaxed">{description}</Text>
                         
                         {traits.length > 0 && (
                             <Row className="flex-wrap gap-2 mb-4">
                                 {traits.map((t, i) => (
                                     <View key={i} className="px-2 py-1 bg-white/5 rounded border border-white/5">
                                         <Text className="text-[10px] text-slate-400 uppercase">{t.type}</Text>
                                         <Text className="text-xs font-bold text-white">{t.value}</Text>
                                     </View>
                                 ))}
                             </Row>
                         )}

                         <Row className="items-center justify-between pt-4 border-t border-white/10">
                             <View>
                                 <Text className="text-xs text-slate-500">Network</Text>
                                 <Text className="font-bold text-sm">{chain === 'ETH' ? 'Ethereum' : chain === 'SOL' ? 'Solana' : 'Polygon'}</Text>
                             </View>
                             <View className="items-end">
                                 <Text className="text-xs text-slate-500">Supply</Text>
                                 <Text className="font-bold text-sm">{supply}</Text>
                             </View>
                         </Row>
                     </View>
                 </View>

                 <Row className="gap-3 mt-4">
                     <TouchableOpacity onPress={() => setStep('details')} className="flex-1 py-4 bg-surface border border-white/10 rounded-xl items-center">
                         <Text className="font-bold text-white">Edit</Text>
                     </TouchableOpacity>
                     <TouchableOpacity onPress={handleMint} className="flex-1 py-4 bg-primary rounded-xl items-center flex-row justify-center gap-2">
                         <Zap size={18} className="text-white fill-white" />
                         <Text className="font-bold text-white">Mint Now</Text>
                     </TouchableOpacity>
                 </Row>
             </View>
         ) : (
             // Form Step
             <View className="space-y-6">
                 {/* Image Upload */}
                 <TouchableOpacity 
                    onPress={() => fileInputRef.current?.click()}
                    className="w-full aspect-square bg-surface/50 border-2 border-dashed border-white/10 rounded-3xl items-center justify-center overflow-hidden hover:border-indigo-500/50 transition-colors"
                 >
                    {image ? (
                        <Image source={image} className="w-full h-full object-cover" />
                    ) : (
                        <View className="items-center gap-2">
                            <View className="w-16 h-16 bg-indigo-500/20 rounded-full items-center justify-center">
                                <Upload size={24} className="text-indigo-400" />
                            </View>
                            <Text className="font-bold text-slate-300">Upload Artwork</Text>
                            <Text className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</Text>
                        </View>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                 </TouchableOpacity>

                 {/* Details */}
                 <View className="space-y-4">
                     <View className="space-y-2">
                         <Text className="text-sm font-bold text-slate-400">Name</Text>
                         <TextInput 
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             placeholder="e.g. Cosmic Ape #1"
                             className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white"
                         />
                     </View>
                     
                     <View className="space-y-2">
                         <Text className="text-sm font-bold text-slate-400">Description</Text>
                         <TextInput 
                             value={description}
                             onChange={(e) => setDescription(e.target.value)}
                             placeholder="Tell the story behind your NFT..."
                             className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white"
                         />
                     </View>

                     <Row className="gap-4">
                         <View className="flex-1 space-y-2">
                             <Text className="text-sm font-bold text-slate-400">Blockchain</Text>
                             <select 
                                 value={chain}
                                 onChange={(e) => setChain(e.target.value as any)}
                                 className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white appearance-none outline-none"
                             >
                                 <option value="ETH">Ethereum</option>
                                 <option value="SOL">Solana</option>
                                 <option value="POLY">Polygon</option>
                             </select>
                         </View>
                         <View className="flex-1 space-y-2">
                             <Text className="text-sm font-bold text-slate-400">Supply</Text>
                             <TextInput 
                                 value={supply}
                                 onChange={(e) => setSupply(e.target.value)}
                                 type="number"
                                 className="w-full bg-surface border border-white/10 rounded-xl p-3 text-white"
                             />
                         </View>
                     </Row>
                 </View>

                 {/* Traits */}
                 <View className="space-y-3 pt-2 border-t border-white/5">
                     <Text className="text-sm font-bold text-slate-400">Traits / Properties</Text>
                     
                     {traits.map((t, i) => (
                         <Row key={i} className="items-center gap-2">
                             <View className="flex-1 bg-white/5 rounded-lg px-3 py-2">
                                 <Text className="text-[10px] text-slate-500 uppercase">{t.type}</Text>
                                 <Text className="text-sm font-bold">{t.value}</Text>
                             </View>
                             <TouchableOpacity onPress={() => removeTrait(i)} className="p-2 bg-red-500/10 rounded-lg">
                                 <Trash2 size={16} className="text-red-400" />
                             </TouchableOpacity>
                         </Row>
                     ))}

                     <Row className="gap-2">
                         <TextInput 
                             value={newTraitType}
                             onChange={(e) => setNewTraitType(e.target.value)}
                             placeholder="Type (e.g. Eyes)"
                             className="flex-1 bg-surface border border-white/10 rounded-lg p-2 text-sm"
                         />
                         <TextInput 
                             value={newTraitValue}
                             onChange={(e) => setNewTraitValue(e.target.value)}
                             placeholder="Value (e.g. Blue)"
                             className="flex-1 bg-surface border border-white/10 rounded-lg p-2 text-sm"
                         />
                         <TouchableOpacity onPress={addTrait} className="p-2 bg-primary rounded-lg">
                             <Plus size={20} className="text-white" />
                         </TouchableOpacity>
                     </Row>
                 </View>

                 <TouchableOpacity 
                     onPress={() => setStep('preview')}
                     disabled={!image || !name}
                     className={`w-full py-4 rounded-xl items-center justify-center shadow-lg ${!image || !name ? 'bg-slate-700 opacity-50' : 'bg-primary'}`}
                 >
                     <Text className="font-bold text-white">Continue to Preview</Text>
                 </TouchableOpacity>
             </View>
         )}
      </ScrollView>
    </View>
  );
};
