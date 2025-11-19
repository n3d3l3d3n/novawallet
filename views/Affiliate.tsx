import React from 'react';
import { ViewState, User } from '../types';
import { ChevronLeft, Copy, Share2, Users, Award, Trophy } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface AffiliateProps {
  user: User;
  onNavigate: (view: ViewState) => void;
}

export const Affiliate: React.FC<AffiliateProps> = ({ user, onNavigate }) => {
  const referralLink = `https://nova.app/r/${user.username.replace('@', '')}`;

  return (
    <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
           <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Affiliate Program</h1>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-center shadow-lg shadow-indigo-500/30 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
         <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
               <Trophy className="text-yellow-300" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-white">${user.affiliateStats?.earnings.toFixed(2)}</h2>
            <p className="text-indigo-100 text-sm">Total Earnings</p>
         </div>
      </div>

      {/* Rank Progress */}
      <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
         <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Current Rank</span>
            <span className="text-xs font-bold text-indigo-400">{user.affiliateStats?.rank}</span>
         </div>
         <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-[65%]" />
         </div>
         <p className="text-[10px] text-slate-500 mt-2">Invite 3 more friends to reach Gold rank.</p>
      </div>

      {/* Referral Link */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300 ml-1">Your Referral Link</label>
        <div className="flex gap-2">
           <div className="flex-1 bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 truncate">
              {referralLink}
           </div>
           <button className="p-3 bg-primary rounded-xl text-white shadow-lg hover:bg-indigo-500 active:scale-95 transition-all">
              <Copy size={20} />
           </button>
           <button className="p-3 bg-surface border border-white/10 rounded-xl text-white hover:bg-slate-700 active:scale-95 transition-all">
              <Share2 size={20} />
           </button>
        </div>
      </div>

      {/* Friends List Mockup */}
      <div className="space-y-3">
         <h3 className="font-bold text-lg">Recent Referrals</h3>
         {[1, 2, 3].map((i) => (
            <Card key={i} className="flex items-center justify-between p-3">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                     <Users size={18} className="text-slate-400" />
                  </div>
                  <div>
                     <div className="font-bold text-sm">CryptoUser_{900+i}</div>
                     <div className="text-xs text-slate-500">Joined Today</div>
                  </div>
               </div>
               <div className="text-emerald-400 font-bold text-sm">+$12.50</div>
            </Card>
         ))}
      </div>
    </div>
  );
};