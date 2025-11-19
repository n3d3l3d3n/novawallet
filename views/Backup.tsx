
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { View, Text, TouchableOpacity, Row, ScrollView } from '../components/native';
import { ChevronLeft, Cloud, Eye, EyeOff, Shield, Users, Copy, CheckCircle, Lock, Key, Plus, ArrowLeft } from 'lucide-react';
import { PinLock } from '../components/ui/PinLock';
import { authService } from '../services/authService';

interface BackupProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const Backup: React.FC<BackupProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [revealPhrase, setRevealPhrase] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(user.settings.backup?.cloudEnabled || false);
  const [guardians, setGuardians] = useState<string[]>(user.settings.backup?.guardians || []);
  
  const handleToggleCloud = async () => {
    const newState = !cloudEnabled;
    setCloudEnabled(newState);
    const newSettings = {
       ...user.settings,
       backup: { ...user.settings.backup, cloudEnabled: newState }
    };
    const updated = await authService.updateProfile(user.id, { settings: newSettings });
    onUpdateUser(updated);
  };

  const handleReveal = () => {
     if (revealPhrase) {
         setRevealPhrase(false);
     } else {
         setShowAuth(true);
     }
  };

  const onAuthSuccess = () => {
      setShowAuth(false);
      setRevealPhrase(true);
      setTimeout(() => setRevealPhrase(false), 30000);
  };

  const handleCopy = () => {
      if (user.recoveryPhrase) {
          navigator.clipboard.writeText(user.recoveryPhrase);
          alert('Copied to clipboard.');
      }
  };

  const handleAddGuardian = () => {
     const newG = `Guardian ${guardians.length + 1}`;
     setGuardians([...guardians, newG]);
  };

  return (
    <View className="flex-1 h-full bg-[#050505] flex flex-col overflow-hidden">
      {showAuth && (
          <View className="absolute inset-0 z-[100]">
             <PinLock isLocked={true} onUnlock={onAuthSuccess} />
          </View>
      )}

      {/* Header - Compact */}
      <View className="px-6 pt-safe-top pb-2 flex-row items-center justify-between z-10 bg-black/20">
        <TouchableOpacity 
            onPress={() => onNavigate(ViewState.SECURITY)} 
            className="w-10 h-10 rounded-full bg-surface/50 border border-white/10 items-center justify-center active:bg-white/10"
        >
            <ArrowLeft size={20} className="text-white" />
        </TouchableOpacity>
        <View className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex-row items-center gap-1.5">
            <Lock size={10} className="text-yellow-500" />
            <Text className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Secure Vault</Text>
        </View>
      </View>

      {/* Main Layout - Flex Column to fit page */}
      <View className="flex-1 px-6 py-4 flex flex-col justify-between gap-4">
         
         {/* Hero Warning - Compact */}
         <View className="items-center">
             <View className="w-14 h-14 bg-yellow-500/10 rounded-full items-center justify-center mb-3 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                <Key size={24} className="text-yellow-500" />
             </View>
             <Text className="text-xl font-bold text-white text-center mb-1">Secret Recovery Phrase</Text>
             <Text className="text-slate-400 text-center text-xs max-w-[280px] leading-relaxed">
                The only way to restore your wallet. <span className="text-yellow-500 font-bold">Keep it safe.</span>
             </Text>
         </View>

         {/* Seed Phrase Vault - Takes available space */}
         <View className="flex-1 bg-surface/30 border border-white/10 rounded-3xl p-1 relative overflow-hidden group min-h-[200px]">
             {/* Ambient Glow */}
             <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
             
             <View className="flex-1 p-1">
                 {revealPhrase ? (
                     <View className="flex-1 bg-black/80 rounded-[20px] p-4 flex flex-col">
                         <ScrollView className="flex-1" contentContainerStyle="justify-center min-h-full">
                             <View className="flex-row flex-wrap gap-2 justify-center">
                                {user.recoveryPhrase?.split(' ').map((word, i) => (
                                    <View key={i} className="bg-white/5 border border-white/5 px-3 py-2 rounded-lg flex-row gap-2 items-center hover:bg-white/10 transition-colors">
                                        <Text className="text-[9px] text-slate-500 font-mono w-3 text-right">{i+1}</Text>
                                        <Text className="text-sm font-bold text-white tracking-wide select-all">{word}</Text>
                                    </View>
                                ))}
                             </View>
                         </ScrollView>
                         
                         <View className="mt-3 pt-3 border-t border-white/10 flex-row justify-around items-center">
                             <TouchableOpacity onPress={handleCopy} className="flex-row items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5">
                                 <Copy size={14} className="text-indigo-400" />
                                 <Text className="text-indigo-400 text-xs font-bold uppercase">Copy</Text>
                             </TouchableOpacity>
                             <View className="w-px h-4 bg-white/10" />
                             <TouchableOpacity onPress={() => setRevealPhrase(false)} className="flex-row items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5">
                                 <EyeOff size={14} className="text-slate-400" />
                                 <Text className="text-slate-400 text-xs font-bold uppercase">Hide</Text>
                             </TouchableOpacity>
                         </View>
                     </View>
                 ) : (
                     <TouchableOpacity 
                        onPress={handleReveal}
                        className="flex-1 items-center justify-center bg-black/40 rounded-[20px] active:bg-black/50 transition-colors group"
                     >
                         <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-3 ring-1 ring-white/10 group-hover:scale-110 transition-transform">
                            <Lock size={24} className="text-slate-300 group-hover:text-white" />
                         </View>
                         <Text className="font-bold text-white text-base mb-1">Tap to Reveal</Text>
                         <Text className="text-slate-500 text-[10px] uppercase tracking-widest">Biometrics Required</Text>
                     </TouchableOpacity>
                 )}
             </View>
         </View>

         {/* Footer Actions - Compact Grid */}
         <View className="flex-row gap-3 h-28 mb-safe-bottom">
             {/* Cloud Sync */}
             <TouchableOpacity 
                onPress={handleToggleCloud}
                className={`flex-1 rounded-2xl border p-3 flex-col justify-between relative overflow-hidden ${cloudEnabled ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-surface border-white/5'}`}
             >
                 <Row className="justify-between items-start">
                    <Cloud size={20} className={cloudEnabled ? 'text-white' : 'text-slate-500'} />
                    <View className={`w-8 h-5 rounded-full p-0.5 transition-colors ${cloudEnabled ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                       <View className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${cloudEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
                    </View>
                 </Row>
                 <View>
                    <Text className={`font-bold text-sm ${cloudEnabled ? 'text-white' : 'text-slate-300'}`}>Cloud Vault</Text>
                    <Text className="text-[10px] text-slate-500 leading-tight mt-0.5">
                       {cloudEnabled ? 'Encrypted backup active' : 'Backup disabled'}
                    </Text>
                 </View>
             </TouchableOpacity>

             {/* Guardians */}
             <TouchableOpacity 
                onPress={handleAddGuardian}
                className="flex-1 rounded-2xl bg-surface border border-white/5 p-3 flex-col justify-between active:bg-white/5"
             >
                 <Row className="justify-between items-start">
                    <Users size={20} className="text-slate-400" />
                    <Plus size={16} className="text-slate-500" />
                 </Row>
                 <View>
                    <Text className="font-bold text-sm text-white">Guardians</Text>
                    {guardians.length > 0 ? (
                       <Row className="mt-1 gap-1">
                          {guardians.slice(0, 3).map((_, i) => (
                             <View key={i} className="w-2 h-2 rounded-full bg-emerald-500" />
                          ))}
                       </Row>
                    ) : (
                       <Text className="text-[10px] text-slate-500 leading-tight mt-0.5">No trusted contacts</Text>
                    )}
                 </View>
             </TouchableOpacity>
         </View>

      </View>
    </View>
  );
};
