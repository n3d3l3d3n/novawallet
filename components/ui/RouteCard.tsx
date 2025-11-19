
import React from 'react';
import { SwapRoute } from '../../types';
import { TouchableOpacity, View, Text, Row } from '../native';
import { Clock, Fuel, ChevronRight, Zap } from 'lucide-react';

interface RouteCardProps {
  route: SwapRoute;
  selected: boolean;
  onSelect: () => void;
  toSymbol: string;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, selected, onSelect, toSymbol }) => {
  const formatTime = (seconds: number) => {
     if (seconds < 60) return `~${seconds}s`;
     return `~${Math.ceil(seconds / 60)} min`;
  };

  return (
    <TouchableOpacity 
       onPress={onSelect}
       className={`p-4 rounded-xl border mb-3 transition-all ${selected ? 'bg-primary/10 border-primary' : 'bg-surface border-white/5 hover:bg-white/5'}`}
    >
       {/* Header with Tags */}
       <Row className="justify-between items-start mb-2">
          <Row className="items-center gap-2">
             <View className="w-8 h-8 rounded-full bg-white/10 items-center justify-center border border-white/10">
                <Text className="text-lg">{route.providerIcon}</Text>
             </View>
             <View>
                <Text className="font-bold text-sm text-white">{route.providerName}</Text>
                <Text className="text-[10px] text-slate-400 font-medium">{route.type === 'DEX' ? 'Decentralized Exchange' : 'Cross-Chain Bridge'}</Text>
             </View>
          </Row>
          <Row className="gap-1">
             {route.tags?.map(tag => (
                <View key={tag} className={`px-2 py-0.5 rounded flex-row items-center gap-1 ${tag === 'Best Return' ? 'bg-emerald-500/20' : 'bg-blue-500/20'}`}>
                   {tag === 'Fastest' && <Zap size={8} className="text-blue-400 fill-blue-400" />}
                   <Text className={`text-[9px] font-bold ${tag === 'Best Return' ? 'text-emerald-400' : 'text-blue-400'}`}>{tag}</Text>
                </View>
             ))}
          </Row>
       </Row>

       {/* Main Numbers */}
       <Row className="justify-between items-end">
          <View>
             <Text className="text-xl font-bold text-white">{route.outputAmount.toFixed(6)} {toSymbol}</Text>
             <Row className="items-center gap-3 mt-1">
                <Row className="items-center gap-1">
                   <Fuel size={12} className="text-slate-500" />
                   <Text className="text-xs text-slate-500">${route.gasFeeUsd.toFixed(2)}</Text>
                </Row>
                <Row className="items-center gap-1">
                   <Clock size={12} className="text-slate-500" />
                   <Text className="text-xs text-slate-500">{formatTime(route.estimatedTimeSeconds)}</Text>
                </Row>
             </Row>
          </View>
          {selected && <ChevronRight size={20} className="text-primary" />}
       </Row>
    </TouchableOpacity>
  );
};
