
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { ChevronLeft, Moon, Shield, Eye, Bell, DollarSign, Globe, Smartphone } from 'lucide-react';
import { authService } from '../services/authService';
import { View, Text, ScrollView, TouchableOpacity, Row } from '../components/native';

interface SettingsProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [settings, setSettings] = useState(user.settings);

  const handleToggle = async (key: string, subKey?: string) => {
    const newSettings = { ...settings };
    if (subKey && key === 'notifications') {
      // @ts-ignore
      newSettings.notifications[subKey] = !newSettings.notifications[subKey];
    } else {
      // @ts-ignore
      newSettings[key] = !newSettings[key];
    }
    setSettings(newSettings);
    
    // Persist
    try {
      const updatedUser = await authService.updateProfile(user.id, { settings: newSettings });
      onUpdateUser(updatedUser);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Settings</Text>
        </Row>

        {/* Account */}
        <View className="space-y-3 mb-6">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">General</Text>
          
          <View className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
            <View className="p-4 flex-row items-center justify-between border-b border-white/5">
              <Row className="items-center gap-3">
                 <View className="p-2 bg-blue-500/10 rounded-lg"><DollarSign size={18} className="text-blue-400" /></View>
                 <View>
                   <Text className="text-sm font-medium">Currency</Text>
                   <Text className="text-xs text-slate-400">USD ($)</Text>
                 </View>
              </Row>
              <Text className="text-xs text-slate-500">Change</Text>
            </View>
            
            <View className="p-4 flex-row items-center justify-between">
              <Row className="items-center gap-3">
                 <View className="p-2 bg-purple-500/10 rounded-lg"><Globe size={18} className="text-purple-400" /></View>
                 <View>
                   <Text className="text-sm font-medium">Language</Text>
                   <Text className="text-xs text-slate-400">English</Text>
                 </View>
              </Row>
              <Text className="text-xs text-slate-500">Change</Text>
            </View>
          </View>
        </View>

        {/* Security */}
        <View className="space-y-3 mb-6">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Security & Privacy</Text>
          
          <View className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
             {/* Biometrics */}
             <View className="p-4 flex-row items-center justify-between border-b border-white/5">
               <Row className="items-center gap-3">
                  <View className="p-2 bg-emerald-500/10 rounded-lg"><Smartphone size={18} className="text-emerald-400" /></View>
                  <Text className="text-sm font-medium">Biometric Login</Text>
               </Row>
               <TouchableOpacity 
                 onPress={() => handleToggle('biometricsEnabled')}
                 className={`w-11 h-6 rounded-full relative ${settings.biometricsEnabled ? 'bg-primary' : 'bg-slate-700'}`}
               >
                 <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.biometricsEnabled ? 'left-6' : 'left-1'}`} />
               </TouchableOpacity>
             </View>

             {/* Hide Balances */}
             <View className="p-4 flex-row items-center justify-between">
               <Row className="items-center gap-3">
                  <View className="p-2 bg-slate-500/10 rounded-lg"><Eye size={18} className="text-slate-400" /></View>
                  <Text className="text-sm font-medium">Hide Balances</Text>
               </Row>
               <TouchableOpacity 
                 onPress={() => handleToggle('hideBalances')}
                 className={`w-11 h-6 rounded-full relative ${settings.hideBalances ? 'bg-primary' : 'bg-slate-700'}`}
               >
                 <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.hideBalances ? 'left-6' : 'left-1'}`} />
               </TouchableOpacity>
             </View>
          </View>
        </View>

        {/* Notifications */}
        <View className="space-y-3 mb-6">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notifications</Text>
          
          <View className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
             {['priceAlerts', 'news', 'security'].map((key, i) => (
               <View key={key} className={`p-4 flex-row items-center justify-between ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                  <Row className="items-center gap-3">
                     <View className="p-2 bg-orange-500/10 rounded-lg"><Bell size={18} className="text-orange-400" /></View>
                     <Text className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Text>
                  </Row>
                  <TouchableOpacity 
                    // @ts-ignore
                    onPress={() => handleToggle('notifications', key)}
                    className={`w-11 h-6 rounded-full relative ${
                      // @ts-ignore
                      settings.notifications[key] ? 'bg-primary' : 'bg-slate-700'
                    }`}
                  >
                    <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                      // @ts-ignore
                      settings.notifications[key] ? 'left-6' : 'left-1'
                    }`} />
                  </TouchableOpacity>
               </View>
             ))}
          </View>
        </View>

        <View className="items-center pt-4">
          <Text className="text-xs text-slate-600">Nova Wallet v1.0.2 (Build 420)</Text>
        </View>
      </ScrollView>
    </View>
  );
};
