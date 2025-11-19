
import React, { useState } from 'react';
import { ViewState, DeviceSession } from '../types';
import { View, Text, TouchableOpacity, Row, ScrollView } from '../components/native';
import { ChevronLeft, Smartphone, Monitor, Tablet, MapPin, Clock, XCircle, ShieldAlert, Info } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface DevicesProps {
  onNavigate: (view: ViewState) => void;
}

const MOCK_SESSIONS: DeviceSession[] = [
  { id: 'dev_1', deviceName: 'iPhone 15 Pro', deviceType: 'mobile', ipAddress: '192.168.1.42', location: 'San Francisco, US', lastActive: Date.now(), isCurrent: true },
  { id: 'dev_2', deviceName: 'MacBook Pro M3', deviceType: 'desktop', ipAddress: '172.16.0.1', location: 'San Jose, US', lastActive: Date.now() - 86400000, isCurrent: false },
  { id: 'dev_3', deviceName: 'iPad Air', deviceType: 'tablet', ipAddress: '10.0.0.5', location: 'New York, US', lastActive: Date.now() - 604800000, isCurrent: false },
];

export const Devices: React.FC<DevicesProps> = ({ onNavigate }) => {
  const [sessions, setSessions] = useState<DeviceSession[]>(MOCK_SESSIONS);

  const handleRevoke = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const handleRevokeAll = () => {
    setSessions(sessions.filter(s => s.isCurrent));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'mobile': return <Smartphone size={24} className="text-slate-300" />;
      case 'desktop': return <Monitor size={24} className="text-slate-300" />;
      case 'tablet': return <Tablet size={24} className="text-slate-300" />;
      default: return <Monitor size={24} className="text-slate-300" />;
    }
  };

  return (
    <View className="flex-1 h-full bg-black">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center justify-between bg-background border-b border-white/5 z-10">
        <Row className="items-center gap-3">
            <TouchableOpacity onPress={() => onNavigate(ViewState.SECURITY)} className="p-2 rounded-full hover:bg-white/10">
                <ChevronLeft size={20} className="text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold">Device Management</Text>
        </Row>
      </View>

      <ScrollView contentContainerStyle="p-5 pb-24">
         <View className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex-row gap-3">
            <Info size={20} className="text-indigo-400 flex-shrink-0" />
            <Text className="text-xs text-indigo-200 leading-relaxed">
              You are logged in on {sessions.length} device{sessions.length > 1 ? 's' : ''}. If you don't recognize a session, revoke it immediately to secure your wallet.
            </Text>
         </View>

         {/* Current Session */}
         <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-2">Current Device</Text>
         {sessions.filter(s => s.isCurrent).map(session => (
             <Card key={session.id} className="p-4 border-l-4 border-l-emerald-500 mb-6">
                <Row className="items-start gap-4">
                    <View className="w-12 h-12 rounded-xl bg-slate-800 items-center justify-center">
                       {getIcon(session.deviceType)}
                    </View>
                    <View className="flex-1">
                       <Text className="font-bold text-lg mb-1">{session.deviceName}</Text>
                       <Row className="items-center gap-1 mb-1">
                          <MapPin size={12} className="text-emerald-400" />
                          <Text className="text-xs text-slate-300">{session.location}</Text>
                       </Row>
                       <Row className="items-center gap-2">
                          <View className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <Text className="text-[10px] font-bold text-emerald-400">Online Now</Text>
                          <Text className="text-[10px] text-slate-500">• {session.ipAddress}</Text>
                       </Row>
                    </View>
                </Row>
             </Card>
         ))}

         {/* Other Sessions */}
         <Row className="justify-between items-center mb-2">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Active Sessions</Text>
            {sessions.length > 1 && (
               <TouchableOpacity onPress={handleRevokeAll}>
                   <Text className="text-xs font-bold text-red-400">Revoke All</Text>
               </TouchableOpacity>
            )}
         </Row>

         <View className="gap-3">
             {sessions.filter(s => !s.isCurrent).map(session => (
                 <Card key={session.id} className="p-4">
                    <Row className="items-center justify-between">
                        <Row className="items-center gap-4">
                            <View className="w-10 h-10 rounded-xl bg-surface border border-white/10 items-center justify-center opacity-70">
                                {getIcon(session.deviceType)}
                            </View>
                            <View>
                                <Text className="font-bold text-sm mb-0.5">{session.deviceName}</Text>
                                <Row className="items-center gap-1">
                                   <Text className="text-[10px] text-slate-400">{session.location}</Text>
                                   <Text className="text-[10px] text-slate-600">•</Text>
                                   <Text className="text-[10px] text-slate-400">Last seen {new Date(session.lastActive).toLocaleDateString()}</Text>
                                </Row>
                            </View>
                        </Row>
                        <TouchableOpacity onPress={() => handleRevoke(session.id)} className="p-2 bg-red-500/10 rounded-lg">
                           <XCircle size={18} className="text-red-400" />
                        </TouchableOpacity>
                    </Row>
                 </Card>
             ))}
             {sessions.filter(s => !s.isCurrent).length === 0 && (
                 <View className="p-8 items-center border border-dashed border-white/10 rounded-xl">
                    <ShieldAlert size={32} className="text-slate-600 mb-2" />
                    <Text className="text-slate-500 text-sm">No other devices active.</Text>
                 </View>
             )}
         </View>
      </ScrollView>
    </View>
  );
};
