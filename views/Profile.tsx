
import React, { useRef, useState } from 'react';
import { ViewState, User } from '../types';
import { authService } from '../services/authService';
import { Settings, Users, Newspaper, Bell, Shield, HelpCircle, LogOut, Camera, ChevronRight, Edit2, Phone, CheckCircle, AlertCircle, Smartphone, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, Image, TextInput } from '../components/native';

interface ProfileProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onNavigate, onLogout, onUpdateUser }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const updated = await authService.updateProfile(user.id, { profileImage: base64String });
          onUpdateUser(updated);
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhone = async () => {
    if (!phoneInput) return;
    await authService.sendSmsVerification(phoneInput);
    setStep('verify');
  };

  const handleVerifyPhone = async () => {
     try {
       await authService.verifySmsCode(user.id, phoneCode);
       const updated = await authService.updateProfile(user.id, { phoneNumber: phoneInput });
       onUpdateUser(updated);
       setIsAddingPhone(false);
     } catch (e) {
       alert('Invalid code (Demo: 987654)');
     }
  };

  const menuItems = [
    { icon: Settings, label: 'Settings', view: ViewState.SETTINGS, color: 'text-slate-300' },
    { icon: Shield, label: 'Security Center', view: ViewState.SECURITY, color: 'text-emerald-400' },
    { icon: FileText, label: 'Legal & Compliance', view: ViewState.LEGAL, color: 'text-blue-400' },
    { icon: Smartphone, label: 'Connected Apps', view: ViewState.CONNECTED_APPS, color: 'text-indigo-300' },
    { icon: Users, label: 'Affiliate Program', view: ViewState.AFFILIATE, color: 'text-purple-400', badge: 'Earn' },
    { icon: Newspaper, label: 'Crypto News', view: ViewState.NEWS, color: 'text-orange-400' },
    { icon: Bell, label: 'Notifications', view: ViewState.NOTIFICATIONS, color: 'text-pink-400' },
    { icon: HelpCircle, label: 'Help & Support', view: ViewState.SUPPORT, color: 'text-slate-300' },
  ];

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="justify-between items-center mt-4 mb-2">
          <Text className="text-2xl font-bold">Profile</Text>
          <TouchableOpacity onPress={onLogout} className="p-2">
            <LogOut size={20} className="text-slate-400" />
          </TouchableOpacity>
        </Row>

        {/* User Card */}
        <View className="items-center py-6">
           <View className="relative group">
              <View className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20">
                 <View className="w-full h-full rounded-full bg-surface overflow-hidden items-center justify-center">
                   {user.profileImage ? (
                     <Image source={user.profileImage} className="w-full h-full" />
                   ) : (
                     <View className="w-full h-full items-center justify-center bg-slate-800">
                        <Text className="text-4xl font-bold text-indigo-500">{user.name[0]}</Text>
                     </View>
                   )}
                 </View>
              </View>
              <TouchableOpacity 
                onPress={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-surface border border-white/10 rounded-full shadow-lg"
              >
                <Camera size={16} className="text-white" />
              </TouchableOpacity>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
           </View>
           
           <View className="mt-4 items-center gap-1">
              <Row className="items-center gap-2">
                <Text className="text-xl font-bold">{user.name}</Text>
                <TouchableOpacity><Edit2 size={14} className="text-slate-500" /></TouchableOpacity>
              </Row>
              <Text className="text-primary font-medium">{user.username || '@username'}</Text>
              <Text className="text-xs text-slate-500">Joined {new Date(user.joinedDate).toLocaleDateString()}</Text>
           </View>
        </View>

        {/* Verification Badges */}
        <Row className="justify-center gap-4 mb-2">
           <View className={`px-3 py-1 rounded-full border flex-row items-center gap-1 ${user.kyc.level >= 2 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-500/30'}`}>
              {user.kyc.level >= 2 ? <CheckCircle size={12} className="text-emerald-400" /> : <AlertCircle size={12} className="text-slate-400" />} 
              <Text className={`text-xs font-medium ${user.kyc.level >= 2 ? 'text-emerald-400' : 'text-slate-400'}`}>Verified</Text>
           </View>
           <TouchableOpacity 
             onPress={() => !user.isPhoneVerified && setIsAddingPhone(true)}
             className={`px-3 py-1 rounded-full border flex-row items-center gap-1 ${user.isPhoneVerified ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-500/30 bg-surface'}`}
           >
              {user.isPhoneVerified ? <CheckCircle size={12} className="text-emerald-400" /> : <Phone size={12} className="text-slate-400" />} 
              <Text className={`text-xs font-medium ${user.isPhoneVerified ? 'text-emerald-400' : 'text-slate-400'}`}>
                {user.isPhoneVerified ? 'Phone' : 'Add Phone'}
              </Text>
           </TouchableOpacity>
        </Row>

        {/* Stats */}
        <Row className="gap-3 mt-3">
           <Card className="flex-1 p-3 items-center gap-1 bg-indigo-500/10 border-indigo-500/20">
              <Text className="text-xs text-slate-400">Total Referrals</Text>
              <Text className="text-xl font-bold text-white">{user.affiliateStats?.referrals || 0}</Text>
           </Card>
           <Card className="flex-1 p-3 items-center gap-1 bg-emerald-500/10 border-emerald-500/20">
              <Text className="text-xs text-slate-400">Earnings</Text>
              <Text className="text-xl font-bold text-white">${user.affiliateStats?.earnings || 0}</Text>
           </Card>
        </Row>

        {/* Menu */}
        <View className="gap-2 mt-6">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => item.view && onNavigate(item.view)}
              className="flex-row items-center justify-between p-4 bg-surface/50 border border-white/5 rounded-2xl"
            >
              <Row className="items-center gap-3">
                 <View className="p-2.5 rounded-xl bg-white/5">
                   <item.icon size={20} className={item.color} />
                 </View>
                 <Text className="font-medium text-sm">{item.label}</Text>
              </Row>
              <Row className="items-center gap-2">
                {item.badge && (
                  <View className="bg-indigo-500 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-bold text-white">{item.badge}</Text>
                  </View>
                )}
                <ChevronRight size={16} className="text-slate-500" />
              </Row>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Phone Modal */}
      {isAddingPhone && (
        <View className="absolute inset-0 bg-black/90 z-50 items-center justify-center p-6">
           <View className="w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-6">
              <Text className="text-lg font-bold mb-4">{step === 'input' ? 'Add Phone Number' : 'Enter SMS Code'}</Text>
              
              {step === 'input' ? (
                <>
                  <TextInput 
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 mb-4 text-white"
                  />
                  <Row className="gap-2">
                    <TouchableOpacity onPress={() => setIsAddingPhone(false)} className="flex-1 py-3 rounded-xl bg-white/5 items-center">
                        <Text className="text-sm">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddPhone} className="flex-1 py-3 rounded-xl bg-primary items-center">
                        <Text className="text-white font-bold text-sm">Send Code</Text>
                    </TouchableOpacity>
                  </Row>
                </>
              ) : (
                 <>
                  <Text className="text-xs text-slate-400 mb-4">Enter code sent to {phoneInput}. (Demo: 987654)</Text>
                  <TextInput 
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 mb-4 text-white text-center tracking-widest text-xl"
                  />
                  <Row className="gap-2">
                    <TouchableOpacity onPress={() => setStep('input')} className="flex-1 py-3 rounded-xl bg-white/5 items-center">
                        <Text className="text-sm">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleVerifyPhone} className="flex-1 py-3 rounded-xl bg-primary items-center">
                        <Text className="text-white font-bold text-sm">Verify</Text>
                    </TouchableOpacity>
                  </Row>
                </>
              )}
           </View>
        </View>
      )}
    </View>
  );
};
