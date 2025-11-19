
import React from 'react';
import { ViewState } from '../types';
import { View, Text, TouchableOpacity } from '../components/native';
import { Wallet, ArrowRight, ShieldCheck, Globe } from 'lucide-react';

interface WelcomeProps {
  onNavigate: (view: ViewState) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onNavigate }) => {
  return (
    <View className="flex-1 h-full flex-col justify-between p-6 relative overflow-hidden bg-black">
      {/* Background Accents */}
      <View className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
      </View>

      <View className="mt-12 space-y-6">
        <View className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl items-center justify-center shadow-xl shadow-indigo-500/30">
          <Wallet className="text-white" size={32} />
        </View>
        
        <View className="space-y-2">
          <Text className="text-4xl font-bold tracking-tight text-white">
            The future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
              crypto wealth
            </span>
          </Text>
          <Text className="text-slate-400 text-lg leading-relaxed">
            Manage assets, track markets, and get AI-powered insights in one secure place.
          </Text>
        </View>

        <View className="flex-row gap-4 pt-4">
          <View className="flex-row items-center gap-2">
            <View className="p-1 bg-emerald-500/10 rounded-full">
                <ShieldCheck size={14} className="text-emerald-400" />
            </View>
            <Text className="text-sm text-slate-300">Secure</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="p-1 bg-blue-500/10 rounded-full">
                <Globe size={14} className="text-blue-400" />
            </View>
            <Text className="text-sm text-slate-300">Global</Text>
          </View>
        </View>
      </View>

      <View className="space-y-4 mb-8">
        <TouchableOpacity
          onPress={() => onNavigate(ViewState.SIGNUP)}
          className="w-full bg-primary p-4 rounded-xl shadow-lg items-center justify-center flex-row gap-2"
        >
          <Text className="text-white font-bold">Create New Wallet</Text>
          <ArrowRight size={18} className="text-white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onNavigate(ViewState.LOGIN)}
          className="w-full bg-surface p-4 rounded-xl border border-white/10 items-center justify-center"
        >
          <Text className="text-white font-semibold">I already have a wallet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
