
import React from 'react';
import { ViewState, User } from '../types';
import { ChevronLeft, Copy, Share2, Users, Award, Trophy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { View, Text, ScrollView, TouchableOpacity, Row } from '../components/native';

interface AffiliateProps {
  user: User;
  onNavigate: (view: ViewState) => void;
}

export const Affiliate: React.FC<AffiliateProps> = ({ user, onNavigate }) => {
  const referralLink = `https://nova.app/r/${user.username.replace('@', '')}`;

  return (
    <View className="flex-1 h-full">
      <ScrollView contentContainerStyle="p-5 pb-24">
        <Row className="items-center gap-4 mt-4 mb-6">
          <TouchableOpacity onPress={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
             <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Affiliate Program</Text>
        </Row>

        {/* Hero Card */}
        <View className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 items-center shadow-lg shadow-indigo-500/30 relative overflow-hidden mb-6">
           <View className="absolute top-0 left-0 w-full h-full opacity-20" />
           <View className="relative z-10 items-center">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mb-3">
                 <Trophy className="text-yellow-300" size={24} />
              </View>
              <Text className="text-3xl font-bold text-white">${user.affiliateStats?.earnings.toFixed(2)}</Text>
              <Text className="text-indigo-100 text-sm">Total Earnings</Text>
           </View>
        </View>

        {/* Rank Progress */}
        <View className="bg-surface/50 border border-white/5 rounded-xl p-4 mb-6">
           <Row className="justify-between items-center mb-2">
              <Text className="text-xs font-bold text-slate-400 uppercase">Current Rank</Text>
              <Text className="text-xs font-bold text-indigo-400">{user.affiliateStats?.rank}</Text>
           </Row>
           <View className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <View className="h-full bg-indigo-500 w-[65%]" />
           </View>
           <Text className="text-[10px] text-slate-500 mt-2">Invite 3 more friends to reach Gold rank.</Text>
        </View>

        {/* Referral Link */}
        <View className="space-y-2 mb-6">
          <Text className="text-sm font-medium text-slate-300 ml-1">Your Referral Link</Text>
          <Row className="gap-2">
             <View className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3">
                <Text className="text-sm text-slate-300" numberOfLines={1}>{referralLink}</Text>
             </View>
             <TouchableOpacity className="p-3 bg-primary rounded-xl items-center justify-center shadow-lg">
                <Copy size={20} className="text-white" />
             </TouchableOpacity>
             <TouchableOpacity className="p-3 bg-surface border border-white/10 rounded-xl items-center justify-center">
                <Share2 size={20} className="text-white" />
             </TouchableOpacity>
          </Row>
        </View>

        {/* Friends List Mockup */}
        <View className="space-y-3">
           <Text className="font-bold text-lg">Recent Referrals</Text>
           {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3">
                 <Row className="items-center justify-between">
                   <Row className="items-center gap-3">
                      <View className="w-10 h-10 rounded-full bg-slate-700 items-center justify-center">
                         <Users size={18} className="text-slate-400" />
                      </View>
                      <View>
                         <Text className="font-bold text-sm">CryptoUser_{900+i}</Text>
                         <Text className="text-xs text-slate-500">Joined Today</Text>
                      </View>
                   </Row>
                   <Text className="text-emerald-400 font-bold text-sm">+$12.50</Text>
                 </Row>
              </Card>
           ))}
        </View>
      </ScrollView>
    </View>
  );
};
