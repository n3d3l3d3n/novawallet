import React from 'react';
import { Asset, User } from '../types';
import { Card } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CreditCard, Wallet, LogOut } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface HomeProps {
  assets: Asset[];
  totalBalance: number;
  user: User | null;
  onLogout: () => void;
}

export const Home: React.FC<HomeProps> = ({ assets, totalBalance, user, onLogout }) => {
  return (
    <div className="p-5 space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header / Total Balance */}
      <div className="space-y-1 mt-4 relative">
        <div className="flex justify-between items-start">
           <span className="text-slate-400 text-sm font-medium">
              Welcome back, {user?.name.split(' ')[0]}
           </span>
           <button 
             onClick={onLogout}
             className="p-2 bg-surface rounded-full text-slate-400 hover:text-red-400 transition-colors"
             title="Logout"
           >
             <LogOut size={16} />
           </button>
        </div>
        
        <span className="text-slate-400 text-sm font-medium block">Total Balance</span>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-2 py-1 rounded-lg w-fit">
          <ArrowUpRight size={16} />
          <span>+$1,240.50 (2.4%)</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 justify-between">
        {[
          { icon: ArrowUpRight, label: 'Send', color: 'bg-indigo-500' },
          { icon: ArrowDownLeft, label: 'Receive', color: 'bg-slate-700' },
          { icon: ArrowLeftRight, label: 'Swap', color: 'bg-slate-700' },
          { icon: CreditCard, label: 'Buy', color: 'bg-slate-700' },
        ].map((action, i) => (
          <button key={i} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-lg shadow-indigo-500/20 group-active:scale-95 transition-transform`}>
              <action.icon className="text-white" size={24} />
            </div>
            <span className="text-xs font-medium text-slate-300">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Your Assets</h2>
          <span className="text-primary text-sm font-medium">See All</span>
        </div>
        
        {assets.map((asset) => (
          <Card key={asset.id} className="flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${asset.color}`}>
                {asset.symbol[0]}
              </div>
              <div>
                <h3 className="font-bold text-white">{asset.name}</h3>
                <span className="text-xs text-slate-400">{asset.balance} {asset.symbol}</span>
              </div>
            </div>
            
            <div className="w-24 h-10">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={asset.chartData}>
                   <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={asset.change24h >= 0 ? "#10b981" : "#ef4444"} 
                    fill="transparent" 
                    strokeWidth={2} 
                   />
                 </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="text-right">
              <div className="font-bold">${(asset.price * asset.balance).toLocaleString()}</div>
              <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Promo Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-5 mt-4">
         <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1">Invite Friends</h3>
            <p className="text-sm text-white/80 mb-3">Get $20 in BTC when they sign up.</p>
            <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm">Share Link</button>
         </div>
         <div className="absolute -right-4 -bottom-10 opacity-30">
            <Wallet size={120} />
         </div>
      </div>
    </div>
  );
};