
import React, { useState } from 'react';
import { ViewState, User, ConnectedApp } from '../types';
import { authService } from '../services/authService';
import { ShieldCheck, Check, X, ChevronLeft, AlertCircle, Globe, Info } from 'lucide-react';
import { View, Text, TouchableOpacity, Row } from '../components/native';

interface ConnectRequestProps {
  user: User;
  requestData: Partial<ConnectedApp>;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const ConnectRequest: React.FC<ConnectRequestProps> = ({ user, requestData, onNavigate, onUpdateUser }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      const newApp: ConnectedApp = {
        id: requestData.id || 'app_' + Date.now(),
        name: requestData.name || 'Unknown App',
        domain: requestData.domain || 'unknown.com',
        icon: requestData.icon || '🌐',
        permissions: requestData.permissions || ['view_profile'],
        connectedAt: Date.now()
      };

      const updatedUser = await authService.authorizeApp(user.id, newApp);
      onUpdateUser(updatedUser);
      onNavigate(ViewState.CONNECTED_APPS);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 h-full p-6">
      <TouchableOpacity 
        onPress={() => onNavigate(ViewState.CONNECTED_APPS)}
        className="flex-row items-center gap-1 mb-4"
      >
        <ChevronLeft size={20} className="text-slate-400" /> 
        <Text className="text-slate-400">Cancel</Text>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        
        {/* Logos */}
        <Row className="items-center gap-4 mb-4">
           <View className="w-16 h-16 rounded-2xl bg-surface border border-white/10 items-center justify-center shadow-lg">
              <Text className="text-3xl">{requestData.icon}</Text>
           </View>
           <View className="w-8 h-px bg-slate-600 border-t border-dashed border-slate-400" />
           <View className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center shadow-lg shadow-indigo-500/30">
              <Text className="font-bold text-xl text-white">N</Text>
           </View>
        </Row>

        <View className="space-y-2 mb-6 items-center">
          <Text className="text-2xl font-bold text-center">Connect to {requestData.name}?</Text>
          <Row className="items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-white/5">
             <Globe size={12} className="text-slate-400" />
             <Text className="text-xs text-slate-400">{requestData.domain}</Text>
          </Row>
        </View>

        <View className="w-full bg-surface/50 border border-white/10 rounded-2xl p-4 space-y-3 mb-4">
           <Row className="items-start gap-3">
              <Info className="text-slate-400 mt-0.5" size={18} />
              <Text className="text-sm text-slate-300">This application is requesting permission to:</Text>
           </Row>
           <View className="pl-2 space-y-3">
              <Row className="items-center gap-3">
                 <View className="p-1 bg-emerald-500/20 rounded-full">
                   <Check size={12} className="text-emerald-400" />
                 </View>
                 <Text className="text-sm font-medium">View your username and avatar</Text>
              </Row>
              <Row className="items-center gap-3">
                 <View className="p-1 bg-emerald-500/20 rounded-full">
                   <Check size={12} className="text-emerald-400" />
                 </View>
                 <Text className="text-sm font-medium">View your public wallet address</Text>
              </Row>
              {requestData.permissions?.includes('view_balance') && (
                <Row className="items-center gap-3">
                   <View className="p-1 bg-yellow-500/20 rounded-full">
                     <AlertCircle size={12} className="text-yellow-400" />
                   </View>
                   <Text className="text-sm font-medium">View your asset balances</Text>
                </Row>
              )}
           </View>
        </View>

        <View className="w-full p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex-row items-start gap-3">
           <ShieldCheck className="text-indigo-400 flex-shrink-0" size={20} />
           <Text className="text-xs text-indigo-200/80 flex-1 leading-relaxed">
             Nova Wallet does not share your private keys or recovery phrase with any connected application.
           </Text>
        </View>

      </View>

      <View className="mt-auto pt-4 space-y-3">
        <TouchableOpacity
          onPress={handleAllow}
          disabled={isLoading}
          className="w-full bg-primary py-3.5 rounded-xl shadow-lg items-center justify-center"
        >
           <Text className="text-white font-bold">{isLoading ? 'Connecting...' : 'Authorize'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onNavigate(ViewState.CONNECTED_APPS)}
          className="w-full bg-surface border border-white/10 py-3.5 rounded-xl items-center justify-center"
        >
          <Text className="text-white font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
