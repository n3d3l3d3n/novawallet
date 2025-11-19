
import React, { useState, useEffect } from 'react';
import { ViewState, NotificationItem } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, Bell, ShieldAlert, TrendingUp, Info, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row } from '../components/native';

interface NotificationsProps {
  onNavigate: (view: ViewState) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setNotifications(authService.getNotifications());
  }, []);

  const markRead = (id: string) => {
    authService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldAlert className="text-red-400" size={20} />;
      case 'price': return <TrendingUp className="text-emerald-400" size={20} />;
      case 'system': return <Info className="text-blue-400" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Notifications</Text>
        </Row>

        <View className="gap-3">
           {notifications.length === 0 && (
              <View className="items-center py-10 opacity-50">
                 <Bell size={48} className="mb-4 text-slate-600" />
                 <Text className="text-slate-400">No notifications yet.</Text>
              </View>
           )}

           {notifications.map(notif => (
              <Card 
                 key={notif.id} 
                 className={`p-4 relative overflow-hidden ${!notif.isRead ? 'bg-surface border-primary/30' : 'opacity-70'}`}
                 onClick={() => markRead(notif.id)}
              >
                 <Row className="gap-4 items-start">
                    {!notif.isRead && <View className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full -mr-1 -mt-1" />}
                    
                    <View className="mt-1">{getIcon(notif.type)}</View>
                    <View className="flex-1">
                       <Text className="font-bold text-sm mb-1">{notif.title}</Text>
                       <Text className="text-xs text-slate-300 leading-relaxed mb-2">{notif.message}</Text>
                       <Text className="text-[10px] text-slate-500">{new Date(notif.timestamp).toLocaleString()}</Text>
                    </View>
                    {notif.isRead && <Check size={16} className="text-slate-600" />}
                 </Row>
              </Card>
           ))}
        </View>
      </ScrollView>
    </View>
  );
};
