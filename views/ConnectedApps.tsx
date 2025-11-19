
import React, { useState } from 'react';
import { ViewState, User, ConnectedApp } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, Smartphone, Trash2, QrCode, ExternalLink, Globe } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row } from '../components/native';
import { QRScanner } from '../components/ui/QRScanner';

interface ConnectedAppsProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
  onSimulateRequest: (app: Partial<ConnectedApp>) => void;
}

export const ConnectedApps: React.FC<ConnectedAppsProps> = ({ user, onNavigate, onUpdateUser, onSimulateRequest }) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleRevoke = async (appId: string) => {
    setRevokingId(appId);
    try {
      const updatedUser = await authService.revokeApp(user.id, appId);
      onUpdateUser(updatedUser);
    } catch (e) {
      console.error(e);
    } finally {
      setRevokingId(null);
    }
  };

  const handleScan = (data: string) => {
     setShowScanner(false);
     // Simulate finding a DApp via QR
     const mockAppRequest: Partial<ConnectedApp> = {
       id: 'app_' + Math.random().toString(36).substr(2, 9),
       name: 'DeFi Swap Protocol',
       domain: 'defiswap.finance',
       icon: '🦄',
       permissions: ['view_profile', 'view_balance']
     };
     onSimulateRequest(mockAppRequest);
  };

  return (
    <View className="flex-1 h-full">
      {showScanner && (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => setShowScanner(false)} 
            label="Scan WalletConnect QR"
          />
      )}

      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Nova Connect</Text>
        </Row>

        <View className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 shadow-lg relative overflow-hidden mb-6">
           <View className="relative z-10">
              <Text className="font-bold text-lg mb-1 text-white">Sign in with Nova</Text>
              <Text className="text-sm text-indigo-100 mb-4 leading-relaxed">Scan QR codes to securely log in to decentralized apps using your wallet identity.</Text>
              <TouchableOpacity 
                 onPress={() => setShowScanner(true)}
                 className="bg-white self-start px-4 py-2.5 rounded-lg flex-row items-center gap-2 shadow-sm"
              >
                 <QrCode size={18} className="text-indigo-600" /> 
                 <Text className="text-sm font-bold text-indigo-600">Scan QR Code</Text>
              </TouchableOpacity>
           </View>
           <Smartphone className="absolute -right-6 -bottom-8 text-white opacity-20" size={120} />
        </View>

        <View className="space-y-3">
           <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Active Connections</Text>
           
           {(!user.connectedApps || user.connectedApps.length === 0) ? (
              <View className="items-center py-8 border border-dashed border-white/10 rounded-xl">
                 <Globe className="text-slate-600 mb-2" size={24} />
                 <Text className="text-sm text-slate-500">No apps connected yet.</Text>
                 <TouchableOpacity onPress={() => setShowScanner(true)} className="mt-2">
                    <Text className="text-xs text-primary">Scan to Connect</Text>
                 </TouchableOpacity>
              </View>
           ) : (
              user.connectedApps.map(app => (
                 <Card key={app.id} className="p-4">
                    <Row className="items-center justify-between">
                      <Row className="items-center gap-3">
                         <View className="w-10 h-10 rounded-xl bg-surface border border-white/10 items-center justify-center shadow-sm">
                            <Text className="text-lg">{app.icon}</Text>
                         </View>
                         <View>
                            <Text className="font-bold text-sm">{app.name}</Text>
                            <Row className="items-center gap-1">
                               <Globe size={10} className="text-slate-500" /> 
                               <Text className="text-xs text-slate-500">{app.domain}</Text>
                            </Row>
                         </View>
                      </Row>
                      <TouchableOpacity 
                         onPress={() => handleRevoke(app.id)}
                         disabled={revokingId === app.id}
                         className="p-2 bg-surface border border-white/5 rounded-lg"
                      >
                         {revokingId === app.id ? (
                            <View className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                         ) : (
                            <Trash2 size={18} className="text-slate-500 hover:text-red-400" />
                         )}
                      </TouchableOpacity>
                    </Row>
                 </Card>
              ))
           )}
        </View>
      </ScrollView>
    </View>
  );
};
