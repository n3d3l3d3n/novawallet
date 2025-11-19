
import React, { useState, useEffect } from 'react';
import { ViewState, User, ActivityLog } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, Shield, Smartphone, Lock, Key, Clock, MapPin, AlertTriangle, CheckCircle, Monitor } from 'lucide-react';
import { Card } from '../components/ui/Card';
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

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Security Center</Text>
        </Row>

        {/* 2-Factor Auth Banner */}
        <View className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 relative overflow-hidden shadow-lg mb-6">
           <View className="relative z-10">
              <Row className="items-center gap-2 mb-2">
                 <Shield className="text-white" size={24} />
                 <Text className="text-lg font-bold text-white">Account Protected</Text>
              </Row>
              <Text className="text-xs text-emerald-100 mb-4 max-w-[80%] leading-relaxed">
                 Your account is secured with a robust recovery phrase and device-level encryption.
              </Text>
              <Row className="gap-2">
                 <View className="px-2 py-1 bg-black/20 rounded">
                    <Text className="text-[10px] font-bold text-white">2FA: Active</Text>
                 </View>
                 <View className="px-2 py-1 bg-black/20 rounded">
                    <Text className="text-[10px] font-bold text-white">Encryption: 256-bit</Text>
                 </View>
              </Row>
           </View>
           <Lock className="absolute -right-4 -bottom-8 text-white opacity-10" size={120} />
        </View>

        {/* Authentication Methods */}
        <View className="space-y-2 mb-6">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Authentication</Text>
           <Card className="p-4">
              {/* Change Password */}
              <Row className="items-center justify-between mb-4">
                 <Row className="items-center gap-3">
                    <View className="p-2 bg-indigo-500/10 rounded-lg"><Key size={18} className="text-indigo-400" /></View>
                    <View>
                       <Text className="text-sm font-bold">Change Password</Text>
                       <Text className="text-xs text-slate-400">Last changed 30 days ago</Text>
                    </View>
                 </Row>
                 <TouchableOpacity className="px-3 py-1.5 bg-primary/10 rounded-lg">
                    <Text className="text-xs font-bold text-primary">Update</Text>
                 </TouchableOpacity>
              </Row>
              
              {/* Biometrics */}
              <View className="h-px bg-white/5 my-2" />
              
              <Row className="items-center justify-between mt-2">
                 <Row className="items-center gap-3">
                    <View className="p-2 bg-emerald-500/10 rounded-lg"><Smartphone size={18} className="text-emerald-400" /></View>
                    <View>
                       <Text className="text-sm font-bold">Biometric Login</Text>
                       <Text className="text-xs text-slate-400">FaceID / TouchID</Text>
                    </View>
                 </Row>
                 <TouchableOpacity 
                    onPress={toggleBiometrics}
                    className={`w-11 h-6 rounded-full relative ${user.settings.biometricsEnabled ? 'bg-primary' : 'bg-slate-700'}`}
                 >
                    <View className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${user.settings.biometricsEnabled ? 'left-6' : 'left-1'}`} />
                 </TouchableOpacity>
              </Row>
           </Card>
        </View>

        {/* Anti-Phishing Code */}
        <View className="space-y-2 mb-6">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Anti-Phishing</Text>
           <Card className="p-4">
              <Text className="text-xs text-slate-400 mb-3 leading-relaxed">
                 Set a unique code that will appear in all official emails from Nova to verify authenticity.
              </Text>
              <Row className="gap-2">
                 <TextInput 
                    disabled={!isEditingPhishing}
                    value={phishingCode}
                    onChange={(e) => setPhishingCode(e.target.value)}
                    placeholder="e.g. MySecretCode123"
                    className={`flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm text-white ${!isEditingPhishing ? 'opacity-50' : ''}`}
                 />
                 {isEditingPhishing ? (
                    <TouchableOpacity onPress={handlePhishingSave} className="px-4 bg-emerald-500 rounded-xl items-center justify-center">
                        <Text className="text-xs font-bold text-white">Save</Text>
                    </TouchableOpacity>
                 ) : (
                    <TouchableOpacity onPress={() => setIsEditingPhishing(true)} className="px-4 bg-surface border border-white/10 rounded-xl items-center justify-center">
                        <Text className="text-slate-300 text-xs font-bold">Edit</Text>
                    </TouchableOpacity>
                 )}
              </Row>
           </Card>
        </View>

        {/* Recent Activity */}
        <View className="space-y-2">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Recent Activity</Text>
           <View className="gap-2">
              {activityLogs.map(log => (
                 <Card key={log.id} className="p-3">
                    <Row className="items-center justify-between">
                       <Row className="items-center gap-3">
                          <View className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                             {log.status === 'success' ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />}
                          </View>
                          <View>
                             <Text className="text-sm font-bold">{log.action}</Text>
                             <Row className="items-center gap-2">
                                <Row className="items-center gap-0.5">
                                    <Monitor size={10} className="text-slate-400" /> 
                                    <Text className="text-[10px] text-slate-400">{log.device}</Text>
                                </Row>
                                <Row className="items-center gap-0.5">
                                    <MapPin size={10} className="text-slate-400" /> 
                                    <Text className="text-[10px] text-slate-400">{log.location}</Text>
                                </Row>
                             </Row>
                          </View>
                       </Row>
                       <View className="items-end">
                          <Clock size={10} className="text-slate-500 mb-0.5" />
                          <Text className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</Text>
                          <Text className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</Text>
                       </View>
                    </Row>
                 </Card>
              ))}
           </View>
        </View>
      </ScrollView>
    </View>
  );
};
