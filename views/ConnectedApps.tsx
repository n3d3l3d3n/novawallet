import React, { useState } from 'react';
import { ViewState, User, ConnectedApp } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, Smartphone, Trash2, QrCode, ExternalLink, Globe } from 'lucide-react';
import { Card } from '../components/ui/Card';

interface ConnectedAppsProps {
  user: User;
  onNavigate: (view: ViewState) => void;
  onUpdateUser: (user: User) => void;
  onSimulateRequest: (app: Partial<ConnectedApp>) => void;
}

export const ConnectedApps: React.FC<ConnectedAppsProps> = ({ user, onNavigate, onUpdateUser, onSimulateRequest }) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);

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

  // Simulate a scan action that triggers the consent screen
  const simulateScan = () => {
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
    <div className="p-5 space-y-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4 mt-4">
        <button onClick={() => onNavigate(ViewState.PROFILE)} className="p-2 rounded-full hover:bg-white/10">
           <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Nova Connect</h1>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="font-bold text-lg mb-1">Sign in with Nova</h2>
            <p className="text-sm text-indigo-100 mb-4">Scan QR codes to securely log in to decentralized apps using your wallet identity.</p>
            <button 
               onClick={simulateScan}
               className="bg-white text-indigo-600 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
            >
               <QrCode size={18} /> Scan QR Code
            </button>
         </div>
         <Smartphone className="absolute -right-6 -bottom-8 text-white opacity-20" size={120} />
      </div>

      <div className="space-y-2">
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Active Connections</h3>
         
         {(!user.connectedApps || user.connectedApps.length === 0) ? (
            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
               <Globe className="mx-auto text-slate-600 mb-2" size={24} />
               <p className="text-sm text-slate-500">No apps connected yet.</p>
               <button onClick={simulateScan} className="text-xs text-primary mt-2 hover:underline">Try Simulation</button>
            </div>
         ) : (
            user.connectedApps.map(app => (
               <Card key={app.id} className="p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-lg shadow-sm">
                        {app.icon}
                     </div>
                     <div>
                        <h4 className="font-bold text-sm">{app.name}</h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                           <Globe size={10} /> {app.domain}
                        </div>
                     </div>
                  </div>
                  <button 
                     onClick={() => handleRevoke(app.id)}
                     disabled={revokingId === app.id}
                     className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                     title="Disconnect"
                  >
                     {revokingId === app.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                     ) : (
                        <Trash2 size={18} />
                     )}
                  </button>
               </Card>
            ))
         )}
      </div>
    </div>
  );
};