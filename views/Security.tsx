
import React, { useState, useEffect } from 'react';
import { ViewState, User, ActivityLog } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, Shield, Smartphone, Lock, Key, Laptop, Fingerprint, ArrowLeft, AlertCircle, Check } from 'lucide-react';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';

interface SecurityProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const Security: React.FC<SecurityProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [phishingCode, setPhishingCode] = useState(user.settings.antiPhishingCode || '');
  const [isEditingPhishing, setIsEditingPhishing] = useState(false);

  useEffect(() => {
    setActivityLogs(authService.getActivityLogs());
  }, []);

  const handlePhishingSave = async () => {
    try {
       const newSettings = { ...user.settings, antiPhishingCode: phishingCode };
       const updated = await authService.updateProfile(user.id, { settings: newSettings });
       onUpdateUser(updated);
       setIsEditingPhishing(false);
    } catch (e) {
       console.error(e);
    }
  };

  const toggleBiometrics = async () => {
     const newSettings = { ...user.settings, biometricsEnabled: !user.settings.biometricsEnabled };
     const updated = await authService.updateProfile(user.id, { settings: newSettings });
     onUpdateUser(updated);
  };

  const securityScore = 
     (user.settings.biometricsEnabled ? 25 : 0) + 
     (user.recoveryPhrase ? 25 : 0) + 
     (user.settings.backup?.cloudEnabled ? 15 : 0) + 
     (user.settings.antiPhishingCode ? 15 : 0) + 
     (user.isEmailVerified ? 20 : 0);

  return (
    <View className="flex-1 h-full bg-[#050505] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-safe-top pb-2 flex-row items-center justify-between z-10 bg-black/20">
        <Row className="items-center gap-3">
            <TouchableOpacity 
                onPress={() => onNavigate(ViewState.PROFILE)} 
                className="w-10 h-10 rounded-full bg-surface/50 border border-white/10 items-center justify-center active:bg-white/10"
            >
                <ArrowLeft size={20} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white tracking-tight">Security Center</Text>
        </Row>
      </View>

      {/* Main Content - Flex Layout, No Scroll needed */}
      <View className="flex-1 px-6 py-4 flex flex-col gap-5">
        
        {/* 1. Health Score Banner */}
        <View className="bg-gradient-to-r from-emerald-900/30 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 flex-row items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
            <View>
                <Text className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Security Score</Text>
                <Text className="text-3xl font-bold text-white">{securityScore}/100</Text>
                <Text className="text-slate-400 text-[10px] mt-1">Account is {securityScore > 80 ? 'Protected' : 'At Risk'}</Text>
            </View>
            {/* Mini Donut Chart */}
            <View className="w-14 h-14 rounded-full border-4 border-emerald-500/10 flex items-center justify-center relative">
                 <Shield size={20} className="text-emerald-500" />
                 <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                    <path className="text-emerald-500 transition-all duration-1000" strokeDasharray={`${securityScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                 </svg>
            </View>
        </View>

        {/* 2. Control Grid (2x2) - Takes minimal vertical space */}
        <View className="grid grid-cols-2 gap-3">
            {/* Vault Key */}
            <TouchableOpacity onPress={() => onNavigate(ViewState.BACKUP)} className="bg-surface/40 border border-white/5 rounded-2xl p-4 flex-col justify-between h-32 active:bg-white/5 hover:border-white/10 transition-colors">
                <View className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center"><Key size={20} className="text-yellow-500" /></View>
                <View>
                    <Text className="font-bold text-sm text-white">Vault Key</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">Backup phrase</Text>
                </View>
            </TouchableOpacity>

            {/* Devices */}
            <TouchableOpacity onPress={() => onNavigate(ViewState.DEVICES)} className="bg-surface/40 border border-white/5 rounded-2xl p-4 flex-col justify-between h-32 active:bg-white/5 hover:border-white/10 transition-colors">
                <View className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><Laptop size={20} className="text-blue-400" /></View>
                <View>
                    <Text className="font-bold text-sm text-white">Sessions</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">Manage devices</Text>
                </View>
            </TouchableOpacity>

            {/* Biometrics */}
            <TouchableOpacity onPress={toggleBiometrics} className={`border rounded-2xl p-4 flex-col justify-between h-32 active:bg-white/5 transition-colors ${user.settings.biometricsEnabled ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-surface/40 border-white/5'}`}>
                <View className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><Fingerprint size={20} className="text-indigo-400" /></View>
                <View>
                    <Text className="font-bold text-sm text-white">Biometrics</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">{user.settings.biometricsEnabled ? 'Enabled' : 'Disabled'}</Text>
                </View>
            </TouchableOpacity>

            {/* Anti-Phishing */}
            <TouchableOpacity onPress={() => setIsEditingPhishing(true)} className={`bg-surface/40 border rounded-2xl p-4 flex-col justify-between h-32 active:bg-white/5 transition-colors ${phishingCode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'}`}>
                <View className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Shield size={20} className="text-emerald-400" /></View>
                <View>
                    <Text className="font-bold text-sm text-white">Anti-Phish</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">{phishingCode ? 'Active' : 'Set Code'}</Text>
                </View>
            </TouchableOpacity>
        </View>

        {/* 3. Recent Activity Log - Flexible Height */}
        <View className="flex-1 bg-surface/20 border border-white/5 rounded-2xl p-4 flex flex-col overflow-hidden min-h-[150px] mb-safe-bottom">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</Text>
            
            <ScrollView className="flex-1">
               {activityLogs.length === 0 ? (
                   <Text className="text-[10px] text-slate-600 italic text-center mt-4">No recent activity.</Text>
               ) : (
                   <View className="gap-3">
                       {activityLogs.slice(0, 5).map(log => (
                           <Row key={log.id} className="items-center justify-between">
                               <Row className="items-center gap-3">
                                   <View className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                   <View>
                                       <Text className="text-xs font-bold text-white">{log.action}</Text>
                                       <Text className="text-[9px] text-slate-500">{log.device}</Text>
                                   </View>
                               </Row>
                               <Text className="text-[9px] text-slate-600 font-mono">{new Date(log.timestamp).toLocaleDateString()}</Text>
                           </Row>
                       ))}
                   </View>
               )}
            </ScrollView>
        </View>

      </View>

      {/* Phishing Modal */}
      {isEditingPhishing && (
          <View className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
              <View className="w-full max-w-xs bg-surface border border-white/10 rounded-2xl p-5 shadow-2xl">
                  <Text className="text-lg font-bold text-white mb-2">Anti-Phishing Code</Text>
                  <Text className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Set a unique code that will appear in all official emails from Nova. This helps you identify fake emails.
                  </Text>
                  
                  <TextInput 
                      value={phishingCode}
                      onChange={(e) => setPhishingCode(e.target.value)}
                      placeholder="e.g. 'Blue Falcon'"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:border-emerald-500/50 transition-colors"
                      autoFocus
                  />

                  <Row className="gap-3">
                      <TouchableOpacity onPress={() => setIsEditingPhishing(false)} className="flex-1 py-3 bg-surface border border-white/10 rounded-xl items-center">
                          <Text className="text-xs font-bold text-slate-300">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handlePhishingSave} className="flex-1 py-3 bg-emerald-600 rounded-xl items-center">
                          <Text className="text-xs font-bold text-white">Save Code</Text>
                      </TouchableOpacity>
                  </Row>
              </View>
          </View>
      )}
    </View>
  );
};
