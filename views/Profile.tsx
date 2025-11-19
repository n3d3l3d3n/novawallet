import React, { useRef, useState } from 'react';
import { ViewState, User } from '../types';
import { authService } from '../services/authService';
import { Settings, Users, Newspaper, Bell, Shield, HelpCircle, LogOut, Camera, ChevronRight, Edit2, Phone, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';
import { Card } from '../components/ui/Card';

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
    { icon: Smartphone, label: 'Connected Apps', view: ViewState.CONNECTED_APPS, color: 'text-blue-400' },
    { icon: Users, label: 'Affiliate Program', view: ViewState.AFFILIATE, color: 'text-indigo-400', badge: 'Earn' },
    { icon: Newspaper, label: 'Crypto News', view: ViewState.NEWS, color: 'text-emerald-400' },
    { icon: Bell, label: 'Notifications', view: null, color: 'text-slate-300' }, // Placeholder logic
    { icon: Shield, label: 'Security', view: null, color: 'text-slate-300' },
    { icon: HelpCircle, label: 'Help & Support', view: null, color: 'text-slate-300' },
  ];

  return (
    <div className="p-5 space-y-6 pb-24 animate-in fade-in duration-500 relative h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mt-4 mb-2">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* User Card */}
      <div className="flex flex-col items-center py-6 relative">
         <div className="relative group">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/20">
               <div className="w-full h-full rounded-full bg-surface overflow-hidden relative">
                 {user.profileImage ? (
                   <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-slate-800 text-4xl font-bold text-indigo-500">
                     {user.name[0]}
                   </div>
                 )}
               </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-surface border border-white/10 rounded-full text-white shadow-lg hover:bg-slate-700 transition-colors"
            >
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
         </div>
         
         <div className="mt-4 text-center space-y-1">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              {user.name} 
              <button className="text-slate-500 hover:text-white"><Edit2 size={14} /></button>
            </h2>
            <p className="text-primary font-medium">{user.username || '@username'}</p>
            <p className="text-xs text-slate-500">Joined {new Date(user.joinedDate).toLocaleDateString()}</p>
         </div>
      </div>

      {/* Verification Badges */}
      <div className="flex justify-center gap-4 mb-2">
         <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${user.isEmailVerified ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
            {user.isEmailVerified ? <CheckCircle size={12} /> : <AlertCircle size={12} />} Email
         </div>
         <button 
           onClick={() => !user.isPhoneVerified && setIsAddingPhone(true)}
           className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${user.isPhoneVerified ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 cursor-default' : 'border-slate-500/30 bg-surface text-slate-400 hover:border-primary/50 hover:text-white'}`}
         >
            {user.isPhoneVerified ? <CheckCircle size={12} /> : <Phone size={12} />} {user.isPhoneVerified ? 'Phone' : 'Add Phone'}
         </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
         <Card className="p-3 flex flex-col items-center gap-1 bg-indigo-500/10 border-indigo-500/20">
            <span className="text-xs text-slate-400">Total Referrals</span>
            <span className="text-xl font-bold text-white">{user.affiliateStats?.referrals || 0}</span>
         </Card>
         <Card className="p-3 flex flex-col items-center gap-1 bg-emerald-500/10 border-emerald-500/20">
            <span className="text-xs text-slate-400">Earnings</span>
            <span className="text-xl font-bold text-white">${user.affiliateStats?.earnings || 0}</span>
         </Card>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => item.view && onNavigate(item.view)}
            className="w-full flex items-center justify-between p-4 bg-surface/50 border border-white/5 rounded-2xl hover:bg-surface transition-all active:scale-98 group"
          >
            <div className="flex items-center gap-3">
               <div className={`p-2.5 rounded-xl bg-white/5 ${item.color}`}>
                 <item.icon size={20} />
               </div>
               <span className="font-medium text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="text-[10px] font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Phone Modal */}
      {isAddingPhone && (
        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="w-full max-w-sm bg-surface border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">{step === 'input' ? 'Add Phone Number' : 'Enter SMS Code'}</h3>
              
              {step === 'input' ? (
                <>
                  <input 
                    type="tel" 
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 mb-4 text-white"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setIsAddingPhone(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-sm">Cancel</button>
                    <button onClick={handleAddPhone} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm">Send Code</button>
                  </div>
                </>
              ) : (
                 <>
                  <p className="text-xs text-slate-400 mb-4">Enter code sent to {phoneInput}. (Demo: 987654)</p>
                  <input 
                    type="text" 
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 mb-4 text-white text-center tracking-widest text-xl"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setStep('input')} className="flex-1 py-3 rounded-xl bg-white/5 text-sm">Back</button>
                    <button onClick={handleVerifyPhone} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm">Verify</button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};