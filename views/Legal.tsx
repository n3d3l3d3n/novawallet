
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, FileText, Upload, ShieldCheck, UserCheck, Download, Trash2, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';

interface LegalProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const Legal: React.FC<LegalProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleUpload = async (type: string) => {
    setIsUploading(true);
    try {
       const updated = await authService.submitKYCDocument(user.id, type);
       onUpdateUser(updated);
    } catch (e) {
       console.error(e);
    } finally {
       setIsUploading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    await authService.exportUserData();
    setIsExporting(false);
    alert('Data export started. Check your email.');
  };

  const handleDelete = async () => {
    if (deleteConfirm !== user.username) {
       alert('Username does not match.');
       return;
    }
    await authService.deleteAccount(user.id);
    window.location.reload(); // Hard reset
  };

  const kycSteps = [
    { level: 1, label: 'Email & Phone Verification', done: user.isEmailVerified && user.isPhoneVerified },
    { level: 2, label: 'Identity Verification (ID/Passport)', done: user.kyc.level >= 2 },
    { level: 3, label: 'Proof of Address', done: user.kyc.level >= 3 },
  ];

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Legal & Compliance</Text>
        </Row>

        {/* Verification Status */}
        <View className="space-y-2 mb-6">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Identity Verification (KYC)</Text>
           <Card className="p-5 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <Row className="items-center justify-between mb-6">
                 <View>
                    <Text className="text-lg font-bold text-white">Level {user.kyc.level}</Text>
                    <Text className="text-xs text-slate-400">Current Verification Status</Text>
                 </View>
                 <View className={`px-3 py-1 rounded-full border ${user.kyc.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                    <Text className={`text-xs font-bold ${user.kyc.status === 'verified' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {user.kyc.status.toUpperCase()}
                    </Text>
                 </View>
              </Row>

              <View className="relative">
                 {/* Vertical Line */}
                 <View className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/10 z-0" />
                 
                 {kycSteps.map((step, idx) => (
                    <Row key={idx} className="relative z-10 items-center gap-4 mb-4 last:mb-0">
                       <View className={`w-6 h-6 rounded-full items-center justify-center border-2 ${step.done ? 'bg-emerald-500 border-emerald-500' : 'bg-surface border-slate-600'}`}>
                          {step.done && <CheckCircle size={14} className="text-white" />}
                       </View>
                       <View className="flex-1">
                          <Text className={`text-sm font-bold ${step.done ? 'text-white' : 'text-slate-400'}`}>{step.label}</Text>
                          {!step.done && user.kyc.level === step.level - 1 && (
                             <Row className="mt-2 gap-2">
                                <TouchableOpacity 
                                  onPress={() => handleUpload('passport')}
                                  disabled={isUploading}
                                  className="px-3 py-1.5 bg-primary rounded-lg flex-row items-center gap-1"
                                >
                                   {isUploading ? <Loader2 size={12} className="animate-spin text-white" /> : <Upload size={12} className="text-white" />} 
                                   <Text className="text-xs font-bold text-white">Upload Document</Text>
                                </TouchableOpacity>
                             </Row>
                          )}
                       </View>
                    </Row>
                 ))}
              </View>
           </Card>
        </View>

        {/* Legal Documents */}
        <View className="space-y-2 mb-6">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Documents</Text>
           <View className="grid grid-cols-2 gap-3">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Risk Disclosure'].map(doc => (
                 <Card key={doc} className="p-3">
                    <Row className="items-center gap-3">
                      <FileText className="text-slate-400" size={20} />
                      <Text className="text-sm font-medium">{doc}</Text>
                    </Row>
                 </Card>
              ))}
           </View>
        </View>

        {/* Data Rights (GDPR) */}
        <View className="space-y-2">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Your Data Rights</Text>
           
           <Card className="p-4 mb-2">
              <Row className="items-center justify-between">
                <Row className="items-center gap-3">
                   <View className="p-2 bg-blue-500/10 rounded-lg"><Download size={18} className="text-blue-400" /></View>
                   <View>
                      <Text className="text-sm font-bold">Export Data</Text>
                      <Text className="text-xs text-slate-400">Download all your personal data (GDPR)</Text>
                   </View>
                </Row>
                <TouchableOpacity onPress={handleExport} disabled={isExporting}>
                   <Text className="text-xs font-bold text-blue-400">
                     {isExporting ? 'Preparing...' : 'Request'}
                   </Text>
                </TouchableOpacity>
              </Row>
           </Card>

           <Card className="p-4 border-red-500/20 bg-red-500/5">
              <Row className="items-center gap-3 mb-3">
                 <View className="p-2 bg-red-500/10 rounded-lg"><Trash2 size={18} className="text-red-400" /></View>
                 <View>
                    <Text className="text-sm font-bold text-red-400">Delete Account</Text>
                    <Text className="text-xs text-slate-400">Permanently remove all data.</Text>
                 </View>
              </Row>
              <View className="space-y-2">
                 <TextInput 
                   value={deleteConfirm}
                   onChange={(e) => setDeleteConfirm(e.target.value)}
                   placeholder={`Type "${user.username}" to confirm`}
                   className="w-full bg-black/20 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-200"
                 />
                 <TouchableOpacity 
                   onPress={handleDelete}
                   disabled={!deleteConfirm}
                   className={`w-full py-2 bg-red-500/20 rounded-lg items-center ${!deleteConfirm ? 'opacity-50' : ''}`}
                 >
                   <Text className="text-xs font-bold text-red-400">Confirm Deletion</Text>
                 </TouchableOpacity>
              </View>
           </Card>
        </View>
      </ScrollView>
    </View>
  );
};
