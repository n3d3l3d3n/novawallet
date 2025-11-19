import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { ChevronLeft, Moon, Shield, Eye, Bell, DollarSign, Globe, Smartphone } from 'lucide-react';
import { authService } from '../services/authService';

interface SettingsProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [settings, setSettings] = useState(user.settings);

  const handleToggle = async (key: string, subKey?: string) => {
    const newSettings = { ...settings };
    if (subKey && key === 'notifications') {
      // @ts-ignore
      newSettings.notifications[subKey] = !newSettings.notifications[subKey];
    } else {
      // @ts-ignore
      newSettings[key] = !newSettings[key];
    }
    setSettings(newSettings);
    
    // Persist
    try {
      const updatedUser = await authService.updateProfile(user.id, { settings: newSettings });
      onUpdateUser(updatedUser);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
           <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Account */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">General</h3>
        
        <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><DollarSign size={18} /></div>
               <div>
                 <div className="text-sm font-medium">Currency</div>
                 <div className="text-xs text-slate-400">USD ($)</div>
               </div>
            </div>
            <span className="text-xs text-slate-500">Change</span>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Globe size={18} /></div>
               <div>
                 <div className="text-sm font-medium">Language</div>
                 <div className="text-xs text-slate-400">English</div>
               </div>
            </div>
            <span className="text-xs text-slate-500">Change</span>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Security & Privacy</h3>
        
        <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
           {/* Biometrics */}
           <div className="p-4 flex items-center justify-between border-b border-white/5">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Smartphone size={18} /></div>
                <span className="text-sm font-medium">Biometric Login</span>
             </div>
             <button 
               onClick={() => handleToggle('biometricsEnabled')}
               className={`w-11 h-6 rounded-full transition-colors relative ${settings.biometricsEnabled ? 'bg-primary' : 'bg-slate-700'}`}
             >
               <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.biometricsEnabled ? 'left-6' : 'left-1'}`} />
             </button>
           </div>

           {/* Hide Balances */}
           <div className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-500/10 rounded-lg text-slate-400"><Eye size={18} /></div>
                <span className="text-sm font-medium">Hide Balances</span>
             </div>
             <button 
               onClick={() => handleToggle('hideBalances')}
               className={`w-11 h-6 rounded-full transition-colors relative ${settings.hideBalances ? 'bg-primary' : 'bg-slate-700'}`}
             >
               <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.hideBalances ? 'left-6' : 'left-1'}`} />
             </button>
           </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Notifications</h3>
        
        <div className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden">
           {['priceAlerts', 'news', 'security'].map((key, i) => (
             <div key={key} className={`p-4 flex items-center justify-between ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Bell size={18} /></div>
                   <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                <button 
                  // @ts-ignore
                  onClick={() => handleToggle('notifications', key)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    // @ts-ignore
                    settings.notifications[key] ? 'bg-primary' : 'bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${
                    // @ts-ignore
                    settings.notifications[key] ? 'left-6' : 'left-1'
                  }`} />
                </button>
             </div>
           ))}
        </div>
      </section>

      <div className="text-center pt-4">
        <p className="text-xs text-slate-600">Nova Wallet v1.0.2 (Build 420)</p>
      </div>
    </div>
  );
};