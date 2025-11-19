
import React, { useState, useEffect } from 'react';
import { ViewState, User, AppPermissions, ComplianceSettings } from '../types';
import { authService } from '../services/authService';
import { ChevronLeft, Mail, Lock, User as UserIcon, Loader2, Key, Copy, CheckCircle, AlertTriangle, AtSign, XCircle, ShieldCheck, FileText, MapPin, Smartphone, CreditCard, Bell, Camera } from 'lucide-react';

interface SignupProps {
  onNavigate: (view: ViewState) => void;
  onSignupSuccess: (user: User) => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate, onSignupSuccess }) => {
  const [step, setStep] = useState<'legal' | 'form' | 'verify' | 'phrase'>('legal');
  
  // Legal & Permission State
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>({
     termsAccepted: false,
     privacyPolicyAccepted: false,
     dataProcessingConsent: false,
     marketingConsent: false,
     agreedToDate: 0
  });
  
  const [permissions, setPermissions] = useState<AppPermissions>({
     camera: 'prompt',
     photos: 'prompt',
     microphone: 'prompt',
     contacts: 'prompt',
     location: 'prompt',
     nfc: 'prompt',
     notifications: 'prompt'
  });

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  
  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  // Phrase State
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [savedPhrase, setSavedPhrase] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempUser, setTempUser] = useState<User | null>(null);

  // Debounce username check
  useEffect(() => {
    if (step !== 'form') return;
    
    const checkUsername = async () => {
      if (username.length < 3) {
        setIsUsernameAvailable(null);
        return;
      }
      setIsCheckingUsername(true);
      const formatted = username.startsWith('@') ? username : '@' + username;
      try {
        const available = await authService.checkUsernameAvailability(formatted);
        setIsUsernameAvailable(available);
      } catch (e) {
        setIsUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, step]);

  const handleLegalAccept = () => {
     if (complianceSettings.termsAccepted && complianceSettings.privacyPolicyAccepted) {
         setComplianceSettings(prev => ({ ...prev, agreedToDate: Date.now() }));
         setStep('form');
     }
  };

  const handlePermissionToggle = (key: keyof AppPermissions) => {
      setPermissions(prev => ({
          ...prev,
          [key]: prev[key] === 'granted' ? 'denied' : 'granted'
      }));
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalUsername = username.startsWith('@') ? username : '@' + username;
    if (!isUsernameAvailable) {
      setError('Please choose a unique username');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signup(
          name, 
          email, 
          password, 
          finalUsername,
          permissions,
          complianceSettings
      );
      // Send verification email immediately
      await authService.sendEmailVerification(email);
      
      setTempUser(result.user);
      setGeneratedPhrase(result.phrase);
      setIsLoading(false);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    setIsLoading(true);

    try {
      if (tempUser) {
        await authService.verifyEmailCode(tempUser.id, verificationCode);
        setIsLoading(false);
        setStep('phrase');
      }
    } catch (err: any) {
      setVerifyError('Invalid code. Try 123456'); // Hint for demo
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (savedPhrase && tempUser) {
      // Update session user to make sure verification status is current
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
          onSignupSuccess(currentUser);
      } else {
          onSignupSuccess(tempUser);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPhrase);
  };

  // --- Step 0: Legal & Compliance ---
  if (step === 'legal') {
      return (
          <div className="h-full p-6 animate-in slide-in-from-right duration-500 flex flex-col">
             <div className="mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                    <ShieldCheck className="text-primary" size={24} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Legal & Permissions</h2>
                <p className="text-slate-400 text-sm">
                   Please review and accept our legal terms and configure your device permissions to ensure a secure and compliant banking experience.
                </p>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
                 {/* Terms Box */}
                 <div className="bg-surface border border-white/10 rounded-xl p-4 h-32 overflow-y-auto text-xs text-slate-400 leading-relaxed mb-4 scrollbar-thin">
                    <h4 className="font-bold text-white mb-1">1. Terms of Service</h4>
                    <p className="mb-2">By accessing Nova Wallet, you agree to be bound by these Terms of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
                    <h4 className="font-bold text-white mb-1">2. Privacy & Data</h4>
                    <p>We prioritize your privacy. We collect minimal data required for regulatory compliance (KYC/AML) and to provide core services. Your private keys are never stored on our servers.</p>
                 </div>

                 <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                           type="checkbox" 
                           className="mt-1 rounded border-slate-600 bg-transparent checked:bg-primary" 
                           checked={complianceSettings.termsAccepted}
                           onChange={e => setComplianceSettings(prev => ({...prev, termsAccepted: e.target.checked}))}
                        />
                        <span className="text-sm text-slate-300">I agree to the <span className="text-primary font-bold">Terms of Service</span>.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                           type="checkbox" 
                           className="mt-1 rounded border-slate-600 bg-transparent checked:bg-primary" 
                           checked={complianceSettings.privacyPolicyAccepted}
                           onChange={e => setComplianceSettings(prev => ({...prev, privacyPolicyAccepted: e.target.checked}))}
                        />
                        <span className="text-sm text-slate-300">I acknowledge the <span className="text-primary font-bold">Privacy Policy</span>.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                           type="checkbox" 
                           className="mt-1 rounded border-slate-600 bg-transparent checked:bg-primary" 
                           checked={complianceSettings.dataProcessingConsent}
                           onChange={e => setComplianceSettings(prev => ({...prev, dataProcessingConsent: e.target.checked}))}
                        />
                        <span className="text-sm text-slate-300">I consent to data processing for fraud prevention.</span>
                    </label>
                 </div>

                 <div className="border-t border-white/10 pt-4 space-y-4">
                    <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Device Permissions</h3>
                    
                    <div className="space-y-3">
                        {[
                            { key: 'nfc', label: 'NFC (Payments)', icon: CreditCard, desc: 'Required for Tap-to-Pay features.' },
                            { key: 'location', label: 'Location', icon: MapPin, desc: 'Required for fraud protection & regional compliance.' },
                            { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Receive transaction alerts & security codes.' },
                            { key: 'contacts', label: 'Contacts', icon: Smartphone, desc: 'Find friends to send payments to.' },
                            { key: 'camera', label: 'Camera', icon: Camera, desc: 'Scan QR codes and KYC verification.' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                        <item.icon size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{item.label}</div>
                                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                                    </div>
                                </div>
                                <button 
                                   onClick={() => handlePermissionToggle(item.key as keyof AppPermissions)}
                                   className={`w-10 h-6 rounded-full relative transition-colors ${permissions[item.key as keyof AppPermissions] === 'granted' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions[item.key as keyof AppPermissions] === 'granted' ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>

             <div className="mt-4">
                 <button
                   onClick={handleLegalAccept}
                   disabled={!complianceSettings.termsAccepted || !complianceSettings.privacyPolicyAccepted}
                   className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Accept & Continue
                 </button>
             </div>
          </div>
      );
  }

  // Step 2: Email Verification
  if (step === 'verify') {
    return (
      <div className="h-full p-6 animate-in slide-in-from-right duration-500 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <ShieldCheck className="text-blue-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Verify Email</h2>
        <p className="text-slate-400 text-center text-sm mb-8">
          We sent a 6-digit code to <span className="text-white font-medium">{email}</span>.
          <br />(Demo: Use 123456)
        </p>

        <form onSubmit={handleVerification} className="w-full space-y-6">
          <div>
             <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-surface border border-white/10 rounded-2xl py-4 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-700"
              placeholder="000000"
            />
          </div>

          {verifyError && (
            <div className="p-3 bg-red-500/10 rounded-lg text-red-400 text-sm text-center">
              {verifyError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
             {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  // Step 3: Recovery Phrase
  if (step === 'phrase') {
    return (
      <div className="h-full p-6 animate-in slide-in-from-right duration-500 flex flex-col">
        <div className="space-y-2 mb-6">
           <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
             <Key className="text-yellow-500" size={24} />
           </div>
           <h2 className="text-2xl font-bold">Secret Recovery Phrase</h2>
           <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3">
             <AlertTriangle className="text-yellow-500 flex-shrink-0" size={20} />
             <p className="text-xs text-yellow-200/80 leading-relaxed">
               This is the <span className="font-bold text-white">ONLY</span> way to recover your wallet. 
               Write it down and store it safely. We cannot recover it for you.
             </p>
           </div>
        </div>

        {/* Phrase Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {generatedPhrase.split(' ').map((word, index) => (
            <div key={index} className="bg-surface border border-white/5 rounded-lg p-2 text-center relative group">
              <span className="absolute top-1 left-2 text-[10px] text-slate-500">{index + 1}</span>
              <span className="text-sm font-medium text-white">{word}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 text-primary text-sm font-medium hover:text-indigo-400 transition-colors mb-8"
        >
          <Copy size={14} /> Copy to clipboard
        </button>

        <div className="mt-auto space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 ${savedPhrase ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 group-hover:border-slate-400'}`}>
              {savedPhrase && <CheckCircle size={14} className="text-white" />}
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={savedPhrase} 
              onChange={(e) => setSavedPhrase(e.target.checked)} 
            />
            <span className="text-sm text-slate-300 select-none">
              I have saved my recovery phrase in a secure location.
            </span>
          </label>

          <button
            onClick={handleFinish}
            disabled={!savedPhrase}
            className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Wallet
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Initial Form
  return (
    <div className="h-full p-6 animate-in slide-in-from-right duration-500">
      <button 
        onClick={() => setStep('legal')}
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="space-y-2 mb-6">
        <h2 className="text-3xl font-bold">Create Account</h2>
        <p className="text-slate-400">Claim your unique Web3 identity.</p>
      </div>

      <form onSubmit={handleCreateAccount} className="space-y-4">
        
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Username</label>
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full bg-surface border rounded-xl py-3.5 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600 ${
                isUsernameAvailable === true ? 'border-emerald-500/50' : isUsernameAvailable === false ? 'border-red-500/50' : 'border-white/10'
              }`}
              placeholder="nedeleden"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCheckingUsername ? (
                <Loader2 className="animate-spin text-slate-500" size={16} />
              ) : isUsernameAvailable === true ? (
                <CheckCircle className="text-emerald-500" size={16} />
              ) : isUsernameAvailable === false ? (
                <XCircle className="text-red-500" size={16} />
              ) : null}
            </div>
          </div>
          {isUsernameAvailable === false && (
             <p className="text-xs text-red-400">Username is already taken.</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isUsernameAvailable === false}
          className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
        </button>
      </form>
      
      <div className="mt-auto pt-6 text-center">
          <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => onNavigate(ViewState.LOGIN)}
                className="text-white font-semibold hover:underline"
              >
                  Sign In
              </button>
          </p>
      </div>
    </div>
  );
};
