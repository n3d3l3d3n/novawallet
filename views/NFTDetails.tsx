
import React from 'react';
import { NFT } from '../types';
import { View, Text, ScrollView, TouchableOpacity, Row, Image } from '../components/native';
import { ChevronLeft, Share2, ExternalLink, Layers, Tag, Send } from 'lucide-react';

interface NFTDetailsProps {
  nft: NFT;
  onBack: () => void;
  onSend: () => void;
}

export const NFTDetails: React.FC<NFTDetailsProps> = ({ nft, onBack, onSend }) => {
  return (
    <View className="flex-1 h-full bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between z-10 bg-background/80 backdrop-blur-md absolute top-0 left-0 right-0">
        <TouchableOpacity onPress={onBack} className="p-2 rounded-full bg-black/40 border border-white/10">
           <ChevronLeft size={20} className="text-white" />
        </TouchableOpacity>
        <Text className="text-sm font-bold opacity-0">NFT Details</Text>
        <TouchableOpacity className="p-2 rounded-full bg-black/40 border border-white/10">
           <Share2 size={20} className="text-white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle="pb-24">
        {/* Hero Image */}
        <View className="w-full aspect-square bg-slate-900 relative">
           <Image source={nft.imageUrl} className="w-full h-full object-cover" />
           <View className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </View>

        <View className="px-5 -mt-10 relative z-10">
            {/* Title Block */}
            <View className="flex-row justify-between items-end mb-6">
                <View className="flex-1 mr-4">
                   <Text className="text-primary font-bold text-sm mb-1">{nft.collectionName}</Text>
                   <Text className="text-3xl font-bold leading-tight">{nft.name}</Text>
                </View>
                <View className="items-end">
                    <View className="flex-row items-center gap-1 bg-surface border border-white/10 px-3 py-1.5 rounded-xl">
                        <Layers size={14} className="text-indigo-400" />
                        <Text className="font-bold text-white">{nft.chain}</Text>
                    </View>
                </View>
            </View>

            {/* Price & Actions */}
            <View className="bg-surface border border-white/10 rounded-2xl p-5 mb-6">
                <Row className="justify-between items-center mb-4">
                   <View>
                       <Text className="text-slate-400 text-xs font-bold uppercase">Floor Price</Text>
                       <Text className="text-2xl font-bold text-white mt-1">{nft.floorPrice} {nft.currency}</Text>
                   </View>
                   <View className="items-end">
                       <Text className="text-slate-400 text-xs font-bold uppercase">Last Sale</Text>
                       <Text className="text-xl font-bold text-slate-300 mt-1">--</Text>
                   </View>
                </Row>
                
                <TouchableOpacity 
                    onPress={onSend}
                    className="w-full bg-primary py-3.5 rounded-xl flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Send size={18} className="text-white" />
                    <Text className="font-bold text-white">Transfer NFT</Text>
                </TouchableOpacity>
            </View>

            {/* Description */}
            <View className="mb-6">
                <Text className="text-lg font-bold mb-3">About</Text>
                <Text className="text-slate-400 leading-relaxed text-sm">{nft.description}</Text>
            </View>

            {/* Traits */}
            <View className="mb-8">
                <Text className="text-lg font-bold mb-3">Properties</Text>
                <View className="flex-row flex-wrap gap-3">
                    {nft.traits.map((trait, idx) => (
                        <View key={idx} className="bg-surface/50 border border-white/5 rounded-xl p-3 min-w-[30%] flex-1">
                            <Text className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{trait.type}</Text>
                            <Text className="text-sm font-bold text-white mb-1">{trait.value}</Text>
                            <Text className="text-[10px] text-slate-500">{trait.rarity}% have this trait</Text>
                        </View>
                    ))}
                </View>
            </View>
            
            {/* Details */}
            <View className="mb-6">
                <Text className="text-lg font-bold mb-3">Details</Text>
                <View className="bg-surface border border-white/5 rounded-xl overflow-hidden">
                    <Row className="justify-between p-4 border-b border-white/5">
                        <Text className="text-sm text-slate-400">Token ID</Text>
                        <Text className="text-sm font-medium text-white truncate max-w-[150px]">{nft.tokenId}</Text>
                    </Row>
                    <Row className="justify-between p-4 border-b border-white/5">
                        <Text className="text-sm text-slate-400">Token Standard</Text>
                        <Text className="text-sm font-medium text-white">ERC-721</Text>
                    </Row>
                    <Row className="justify-between p-4">
                        <Text className="text-sm text-slate-400">Blockchain</Text>
                        <Text className="text-sm font-medium text-white">{nft.chain === 'ETH' ? 'Ethereum' : 'Solana'}</Text>
                    </Row>
                </View>
            </View>

             <TouchableOpacity className="w-full py-4 border border-white/10 rounded-xl flex-row items-center justify-center gap-2 mb-8">
                 <ExternalLink size={16} className="text-slate-400" />
                 <Text className="text-slate-400 font-bold text-sm">View on Explorer</Text>
             </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};
