
import React, { useState, useEffect } from 'react';
import { ViewState, User, AppPermissions, ComplianceSettings } from '../types';
import { authService } from '../services/authService';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
import { ChevronLeft, Mail, Lock, User as UserIcon, Loader2, Key, Copy, CheckCircle, AlertTriangle, AtSign, XCircle, ShieldCheck, ArrowRight, FileText, Eye, EyeOff } from 'lucide-react';

interface SignupProps {
  onNavigate: (view: ViewState) => void;
  onSignupSuccess: (user: User) => void;
}

const STEPS = ['Legal', 'Identity', 'Verify', 'Secure'];

export const Signup: React.FC<SignupProps> = ({ onNavigate, onSignupSuccess }) => {
  const [step, setStep] = useState<'legal' | 'form' | 'verify' | 'phrase'>('legal');
  
  // Legal & Permission State
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>({
     termsAccepted: false,
     privacyPolicyAccepted: false,
     dataProcessingConsent: false,
     marketingConsent: false,
     agreedToDate: 0
  });
  
  // Default permissions
  const [permissions] = useState<AppPermissions>({
     camera: 'prompt', photos: 'prompt', microphone: 'prompt', 
     contacts: 'prompt', location: 'prompt', nfc: 'prompt', notifications: 'prompt'
  });

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  
  // Username validation state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  // Phrase State
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [savedPhrase, setSavedPhrase] = useState(false);
  const [phraseRevealed, setPhraseRevealed] = useState(false);
  
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

  const handleBack = () => {
    if (step === 'legal') onNavigate(ViewState.WELCOME);
    else if (step === 'form') setStep('legal');
    else if (step === 'verify') setStep('form');
  };

  const handleLegalAccept = () => {
     if (complianceSettings.termsAccepted && complianceSettings.privacyPolicyAccepted) {
         setComplianceSettings(prev => ({ ...prev, agreedToDate: Date.now() }));
         setStep('form');
     }
  };

  const handleCreateAccount = async () => {
    setError('');
    const finalUsername = username.startsWith('@') ? username : '@' + username;
    
    if (!isUsernameAvailable && username.length >= 3) {
        setError('Username taken');
        return;
    }

    setIsLoading(true);

    try {
      const result = await authService.signup(name, email, password, finalUsername, permissions, complianceSettings);
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

  const handleVerification = async () => {
    setVerifyError('');
    setIsLoading(true);
    try {
      if (tempUser) {
        await authService.verifyEmailCode(tempUser.id, verificationCode);
        setIsLoading(false);
        setStep('phrase');
      }
    } catch (err: any) {
      setVerifyError('Invalid code');
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    if (savedPhrase && tempUser) {
      const currentUser = await authService.getCurrentUser();
      onSignupSuccess(currentUser || tempUser);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPhrase);
    alert("Copied to clipboard");
  };

  const getStepIndex = () => {
      if (step === 'legal') return 0;
      if (step === 'form') return 1;
      if (step === 'verify') return 2;
      return 3;
  };

  return (
    <View className="flex-1 h-full bg-[#050505] flex flex-col overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <View className="pt-14 px-6 z-10 flex-row justify-between items-center">
         <TouchableOpacity onPress={handleBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/10 transition-colors">
            <ChevronLeft size={20} className="text-white" />
         </TouchableOpacity>
         
         {/* Step Indicators */}
         <Row className="gap-2">
             {[0, 1, 2, 3].map(i => (
                 <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                        getStepIndex() >= i ? 'w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'w-2 bg-white/10'
                    }`}
                 />
             ))}
         </Row>
      </View>

      {/* Content Area */}
      <View className="flex-1 px-6 pt-8 pb-safe-bottom">
         
         {/* --- STEP 1: LEGAL --- */}
         {step === 'legal' && (
             <View className="flex-1 flex-col animate-in slide-in-from-right duration-300">
                <Text className="text-3xl font-bold text-white mb-2">Compliance</Text>
                <Text className="text-slate-400 mb-8">Please review our terms to ensure a compliant experience.</Text>

                <ScrollView className="flex-1 space-y-4" showsVerticalScrollIndicator={false}>
                    {[
                        { id: 'termsAccepted', title: 'Terms of Service', desc: 'I agree to the Terms of Service & User Agreement.' },
                        { id: 'privacyPolicyAccepted', title: 'Privacy Policy', desc: 'I acknowledge the Privacy Policy and how my data is handled.' },
                        { id: 'dataProcessingConsent', title: 'Data Processing', desc: 'I consent to the processing of my personal data for KYC.' },
                    ].map((item) => (
                        <TouchableOpacity 
                           key={item.id}
                           onPress={() => setComplianceSettings(prev => ({ ...prev, [item.id]: !prev[item.id as keyof ComplianceSettings] }))}
                           className={`p-5 rounded-2xl border transition-all duration-200 ${
                               complianceSettings[item.id as keyof ComplianceSettings] 
                               ? 'bg-indigo-500/10 border-indigo-500/50' 
                               : 'bg-white/5 border-white/10'
                           }`}
                        >
                           <Row className="items-start gap-4">
                               <div className={`w-6 h-6 rounded-full border flex items-center justify-center mt-1 transition-colors ${
                                   complianceSettings[item.id as keyof ComplianceSettings] ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                               }`}>
                                   {complianceSettings[item.id as keyof ComplianceSettings] && <CheckCircle size={14} className="text-white" />}
                               </div>
                               <View className="flex-1">
                                   <Text className="font-bold text-white mb-1">{item.title}</Text>
                                   <Text className="text-xs text-slate-400 leading-relaxed">{item.desc}</Text>
                               </View>
                           </Row>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity 
                    onPress={handleLegalAccept}
                    disabled={!complianceSettings.termsAccepted || !complianceSettings.privacyPolicyAccepted}
                    className={`mt-6 w-full py-4 rounded-2xl items-center transition-all ${
                        (!complianceSettings.termsAccepted || !complianceSettings.privacyPolicyAccepted) 
                        ? 'bg-white/10 opacity-50' 
                        : 'bg-indigo-600 shadow-lg shadow-indigo-600/20'
                    }`}
                >
                    <Text className="font-bold text-white">Accept & Continue</Text>
                </TouchableOpacity>
             </View>
         )}

         {/* --- STEP 2: FORM --- */}
         {step === 'form' && (
             <View className="flex-1 flex-col animate-in slide-in-from-right duration-300">
                 <View className="mb-8">
                     <Text className="text-3xl font-bold text-white mb-2">Create ID</Text>
                     <Text className="text-slate-400">Claim your unique Web3 identity.</Text>
                 </View>

                 <ScrollView className="flex-1 space-y-5">
                     <View className="space-y-2">
                         <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</Text>
                         <View className="bg-white/5 border border-white/10 rounded-2xl px-4 flex-row items-center h-14 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
                             <UserIcon size={18} className="text-slate-500 mr-3" />
                             <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="flex-1 h-full text-white bg-transparent outline-none" placeholderTextColor="#64748b" />
                         </View>
                     </View>

                     <View className="space-y-2">
                         <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Username</Text>
                         <View className={`bg-white/5 border rounded-2xl px-4 flex-row items-center h-14 transition-all ${
                             isUsernameAvailable === true ? 'border-emerald-500/50' : isUsernameAvailable === false ? 'border-red-500/50' : 'border-white/10 focus-within:border-indigo-500/50'
                         }`}>
                             <AtSign size={18} className="text-slate-500 mr-3" />
                             <TextInput value={username} onChange={(e) => setUsername(e.target.value)} placeholder="nova_user" className="flex-1 h-full text-white bg-transparent outline-none" autoCapitalize="none" placeholderTextColor="#64748b" />
                             {isCheckingUsername ? <Loader2 size={16} className="animate-spin text-slate-500" /> : isUsernameAvailable === true ? <CheckCircle size={16} className="text-emerald-500" /> : isUsernameAvailable === false ? <XCircle size={16} className="text-red-500" /> : null}
                         </View>
                     </View>

                     <View className="space-y-2">
                         <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Email</Text>
                         <View className="bg-white/5 border border-white/10 rounded-2xl px-4 flex-row items-center h-14 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
                             <Mail size={18} className="text-slate-500 mr-3" />
                             <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="flex-1 h-full text-white bg-transparent outline-none" placeholderTextColor="#64748b" />
                         </View>
                     </View>

                     <View className="space-y-2">
                         <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Password</Text>
                         <View className="bg-white/5 border border-white/10 rounded-2xl px-4 flex-row items-center h-14 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all">
                             <Lock size={18} className="text-slate-500 mr-3" />
                             <TextInput type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="flex-1 h-full text-white bg-transparent outline-none" placeholderTextColor="#64748b" />
                             <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                 {showPassword ? <EyeOff size={18} className="text-slate-500" /> : <Eye size={18} className="text-slate-500" />}
                             </TouchableOpacity>
                         </View>
                     </View>

                     {error ? <Text className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-lg">{error}</Text> : null}
                 </ScrollView>

                 <TouchableOpacity 
                    onPress={handleCreateAccount}
                    disabled={isLoading || !name || !username || !email || !password || isUsernameAvailable === false}
                    className="mt-4 w-full h-14 bg-indigo-600 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
                 >
                    {isLoading ? <Loader2 className="animate-spin text-white" /> : <><Text className="font-bold text-white text-lg">Create Account</Text><ArrowRight size={20} className="text-white" /></>}
                 </TouchableOpacity>
             </View>
         )}

         {/* --- STEP 3: VERIFY --- */}
         {step === 'verify' && (
             <View className="flex-1 flex-col items-center justify-center animate-in slide-in-from-right duration-300">
                 <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8 animate-pulse">
                     <Mail size={40} className="text-indigo-400" />
                 </div>
                 <Text className="text-3xl font-bold text-white mb-2">Check Email</Text>
                 <Text className="text-slate-400 text-center max-w-xs mb-10">
                    We've sent a 6-digit code to <span className="text-white font-bold">{email}</span>.
                 </Text>

                 <TextInput 
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="bg-transparent text-5xl font-mono text-white tracking-[0.5em] text-center w-full outline-none border-b-2 border-indigo-500/50 focus:border-indigo-500 pb-4 mb-8"
                    placeholder="000000"
                    placeholderTextColor="#334155"
                    autoFocus
                 />

                 {verifyError ? <Text className="text-red-400 mb-6">{verifyError}</Text> : null}

                 <TouchableOpacity 
                    onPress={handleVerification}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full h-14 bg-white text-black rounded-2xl items-center justify-center shadow-lg disabled:opacity-50"
                 >
                    {isLoading ? <Loader2 className="animate-spin text-black" /> : <Text className="font-bold text-lg text-black">Verify Code</Text>}
                 </TouchableOpacity>
             </View>
         )}

         {/* --- STEP 4: PHRASE --- */}
         {step === 'phrase' && (
             <View className="flex-1 flex-col animate-in slide-in-from-right duration-300">
                 <View className="mb-6">
                     <Row className="items-center gap-3 mb-2">
                         <ShieldCheck size={28} className="text-yellow-500" />
                         <Text className="text-2xl font-bold text-white">Secret Vault Key</Text>
                     </Row>
                     <View className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                         <Text className="text-xs text-yellow-200 leading-relaxed">
                            ⚠️ <span className="font-bold">CRITICAL:</span> Write this down. If you lose this phrase, your funds are lost forever. We cannot recover it.
                         </Text>
                     </View>
                 </View>

                 <View className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-1 relative overflow-hidden group">
                     {/* Blurring Overlay */}
                     {!phraseRevealed && (
                         <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center">
                             <Lock size={32} className="text-slate-400 mb-4" />
                             <Text className="text-slate-300 text-sm font-bold mb-4">Tap to reveal your key</Text>
                             <TouchableOpacity onPress={() => setPhraseRevealed(true)} className="px-6 py-2 bg-white/10 border border-white/10 rounded-full">
                                 <Text className="text-white text-xs font-bold">Reveal</Text>
                             </TouchableOpacity>
                         </div>
                     )}
                     
                     <ScrollView className="h-full p-4" contentContainerStyle="pb-4">
                         <View className="flex-row flex-wrap gap-3 justify-center">
                             {generatedPhrase.split(' ').map((word, i) => (
                                 <div key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
                                     <span className="text-[10px] text-slate-500 font-mono select-none">{i+1}</span>
                                     <span className="text-sm font-bold text-white select-all">{word}</span>
                                 </div>
                             ))}
                         </View>
                     </ScrollView>
                     
                     {phraseRevealed && (
                         <div className="absolute bottom-4 right-4 z-20">
                             <TouchableOpacity onPress={copyToClipboard} className="p-3 bg-indigo-600 rounded-xl shadow-lg">
                                 <Copy size={18} className="text-white" />
                             </TouchableOpacity>
                         </div>
                     )}
                 </View>

                 <View className="mt-6">
                     <TouchableOpacity onPress={() => setSavedPhrase(!savedPhrase)} className="flex-row items-center gap-3 mb-4 p-2">
                         <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${savedPhrase ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 bg-white/5'}`}>
                             {savedPhrase && <CheckCircle size={14} className="text-white" />}
                         </div>
                         <Text className="text-sm text-slate-300 flex-1">I have saved these 12 words in a secure location.</Text>
                     </TouchableOpacity>

                     <TouchableOpacity 
                        onPress={handleFinish}
                        disabled={!savedPhrase}
                        className="w-full h-14 bg-emerald-500 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/20 disabled:bg-slate-800 disabled:shadow-none"
                     >
                        <Text className="font-bold text-white text-lg">Enter Wallet</Text>
                     </TouchableOpacity>
                 </View>
             </View>
         )}

      </View>
    </View>
  );
};
