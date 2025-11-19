
import React, { useState, useEffect } from 'react';
import { ViewState, User, AppPermissions, ComplianceSettings } from '../types';
import { authService } from '../services/authService';
import { View, Text, TouchableOpacity, TextInput, Row, ScrollView } from '../components/native';
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

  const handleCreateAccount = async () => {
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
      setVerifyError('Invalid code. Try 123456'); // Hint for demo
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    if (savedPhrase && tempUser) {
      // Update session user to make sure verification status is current
      const currentUser = await authService.getCurrentUser();
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
          <View className="flex-1 h-full p-6">
             <View className="mb-6">
                <View className="w-12 h-12 bg-primary/20 rounded-2xl items-center justify-center mb-4">
                    <ShieldCheck className="text-primary" size={24} />
                </View>
                <Text className="text-2xl font-bold mb-2">Legal & Permissions</Text>
                <Text className="text-slate-400 text-sm">
                   Please review and accept our legal terms and configure your device permissions to ensure a secure and compliant banking experience.
                </Text>
             </View>

             <ScrollView className="flex-1 pb-4">
                 {/* Terms Box */}
                 <View className="bg-surface border border-white/10 rounded-xl p-4 h-32 mb-4">
                    <Text className="font-bold text-white mb-1 text-xs">1. Terms of Service</Text>
                    <Text className="mb-2 text-xs text-slate-400">By accessing Nova Wallet, you agree to be bound by these Terms of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</Text>
                    <Text className="font-bold text-white mb-1 text-xs">2. Privacy & Data</Text>
                    <Text className="text-xs text-slate-400">We prioritize your privacy. We collect minimal data required for regulatory compliance (KYC/AML) and to provide core services. Your private keys are never stored on our servers.</Text>
                 </View>

                 <View className="space-y-3 mb-4">
                    <TouchableOpacity 
                       onPress={() => setComplianceSettings(prev => ({...prev, termsAccepted: !prev.termsAccepted}))}
                       className="flex-row items-start gap-3"
                    >
                        <View className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${complianceSettings.termsAccepted ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                           {complianceSettings.termsAccepted && <CheckCircle size={14} className="text-white" />}
                        </View>
                        <Text className="text-sm text-slate-300 flex-1">I agree to the <Text className="text-primary font-bold">Terms of Service</Text>.</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                       onPress={() => setComplianceSettings(prev => ({...prev, privacyPolicyAccepted: !prev.privacyPolicyAccepted}))}
                       className="flex-row items-start gap-3"
                    >
                        <View className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${complianceSettings.privacyPolicyAccepted ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                           {complianceSettings.privacyPolicyAccepted && <CheckCircle size={14} className="text-white" />}
                        </View>
                        <Text className="text-sm text-slate-300 flex-1">I acknowledge the <Text className="text-primary font-bold">Privacy Policy</Text>.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                       onPress={() => setComplianceSettings(prev => ({...prev, dataProcessingConsent: !prev.dataProcessingConsent}))}
                       className="flex-row items-start gap-3"
                    >
                        <View className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${complianceSettings.dataProcessingConsent ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                           {complianceSettings.dataProcessingConsent && <CheckCircle size={14} className="text-white" />}
                        </View>
                        <Text className="text-sm text-slate-300 flex-1">I consent to data processing for fraud prevention.</Text>
                    </TouchableOpacity>
                 </View>

                 <View className="border-t border-white/10 pt-4 space-y-4">
                    <Text className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-2">Device Permissions</Text>
                    
                    <View className="gap-3">
                        {[
                            { key: 'nfc', label: 'NFC (Payments)', icon: CreditCard, desc: 'Required for Tap-to-Pay features.' },
                            { key: 'location', label: 'Location', icon: MapPin, desc: 'Required for fraud protection & regional compliance.' },
                            { key: 'notifications', label: 'Notifications', icon: Bell, desc: 'Receive transaction alerts & security codes.' },
                            { key: 'contacts', label: 'Contacts', icon: Smartphone, desc: 'Find friends to send payments to.' },
                            { key: 'camera', label: 'Camera', icon: Camera, desc: 'Scan QR codes and KYC verification.' }
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <View key={item.key} className="flex-row items-center justify-between p-3 bg-surface/50 rounded-xl border border-white/5">
                                    <Row className="items-center gap-3">
                                        <View className="p-2 bg-slate-800 rounded-lg">
                                            <Icon size={16} className="text-slate-400" />
                                        </View>
                                        <View>
                                            <Text className="font-bold text-sm">{item.label}</Text>
                                            <Text className="text-[10px] text-slate-500">{item.desc}</Text>
                                        </View>
                                    </Row>
                                    <TouchableOpacity 
                                    onPress={() => handlePermissionToggle(item.key as keyof AppPermissions)}
                                    className={`w-10 h-6 rounded-full relative ${permissions[item.key as keyof AppPermissions] === 'granted' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                    >
                                        <View className={`absolute top-1 w-4 h-4 bg-white rounded-full ${permissions[item.key as keyof AppPermissions] === 'granted' ? 'left-5' : 'left-1'}`} />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                 </View>
             </ScrollView>

             <View className="mt-4">
                 <TouchableOpacity
                   onPress={handleLegalAccept}
                   disabled={!complianceSettings.termsAccepted || !complianceSettings.privacyPolicyAccepted}
                   className="w-full bg-primary py-4 rounded-xl shadow-lg items-center justify-center"
                 >
                    <Text className="text-white font-bold">Accept & Continue</Text>
                 </TouchableOpacity>
             </View>
          </View>
      );
  }

  // Step 2: Email Verification
  if (step === 'verify') {
    return (
      <View className="flex-1 h-full p-6 items-center justify-center">
        <View className="w-16 h-16 bg-blue-500/20 rounded-full items-center justify-center mb-6">
          <ShieldCheck className="text-blue-400" size={32} />
        </View>
        <Text className="text-2xl font-bold mb-2">Verify Email</Text>
        <Text className="text-slate-400 text-center text-sm mb-8">
          We sent a 6-digit code to <Text className="text-white font-medium">{email}</Text>.
          {'\n'}(Demo: Use 123456)
        </Text>

        <View className="w-full space-y-6">
          <View>
             <TextInput
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-surface border border-white/10 rounded-2xl py-4 text-center text-2xl font-mono tracking-widest text-white"
              placeholder="000000"
              maxLength={6}
            />
          </View>

          {verifyError ? (
            <View className="p-3 bg-red-500/10 rounded-lg">
                <Text className="text-red-400 text-sm text-center">{verifyError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleVerification}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full bg-primary py-3.5 rounded-xl shadow-lg items-center justify-center"
          >
             {isLoading ? <Loader2 className="animate-spin text-white" size={20} /> : <Text className="text-white font-bold">Verify</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 3: Recovery Phrase
  if (step === 'phrase') {
    return (
      <View className="flex-1 h-full p-6">
        <View className="space-y-2 mb-6">
           <View className="w-12 h-12 bg-yellow-500/20 rounded-full items-center justify-center mb-2">
             <Key className="text-yellow-500" size={24} />
           </View>
           <Text className="text-2xl font-bold">Secret Recovery Phrase</Text>
           <Row className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl gap-3">
             <AlertTriangle className="text-yellow-500" size={20} />
             <Text className="text-xs text-yellow-200/80 leading-relaxed flex-1">
               This is the <Text className="font-bold text-white">ONLY</Text> way to recover your wallet. 
               Write it down and store it safely. We cannot recover it for you.
             </Text>
           </Row>
        </View>

        {/* Phrase Grid */}
        <View className="grid grid-cols-3 gap-2 mb-4">
          {generatedPhrase.split(' ').map((word, index) => (
            <View key={index} className="bg-surface border border-white/5 rounded-lg p-2 items-center relative">
              <Text className="absolute top-1 left-2 text-[10px] text-slate-500">{index + 1}</Text>
              <Text className="text-sm font-medium text-white">{word}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          onPress={copyToClipboard}
          className="flex-row items-center justify-center gap-2 mb-8"
        >
          <Copy size={14} className="text-primary" /> 
          <Text className="text-primary text-sm font-medium">Copy to clipboard</Text>
        </TouchableOpacity>

        <View className="mt-auto space-y-4">
          <TouchableOpacity 
             onPress={() => setSavedPhrase(!savedPhrase)}
             className="flex-row items-center gap-3"
          >
            <View className={`w-5 h-5 rounded border items-center justify-center ${savedPhrase ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
              {savedPhrase && <CheckCircle size={14} className="text-white" />}
            </View>
            <Text className="text-sm text-slate-300">
              I have saved my recovery phrase in a secure location.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFinish}
            disabled={!savedPhrase}
            className="w-full bg-primary py-3.5 rounded-xl shadow-lg items-center justify-center"
          >
            <Text className="text-white font-bold">Enter Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 1: Initial Form
  return (
    <View className="flex-1 h-full p-6">
      <TouchableOpacity 
        onPress={() => setStep('legal')}
        className="flex-row items-center gap-1 mb-6"
      >
        <ChevronLeft size={20} className="text-slate-400" /> 
        <Text className="text-slate-400">Back</Text>
      </TouchableOpacity>

      <View className="space-y-2 mb-6">
        <Text className="text-3xl font-bold">Create Account</Text>
        <Text className="text-slate-400">Claim your unique Web3 identity.</Text>
      </View>

      <View className="space-y-4">
        
        {/* Name */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-slate-300">Full Name</Text>
          <View className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white"
              placeholder="John Doe"
            />
          </View>
        </View>

        {/* Username */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-slate-300">Username</Text>
          <View className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <TextInput
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full bg-surface border rounded-xl py-3.5 pl-11 pr-10 text-white ${
                isUsernameAvailable === true ? 'border-emerald-500/50' : isUsernameAvailable === false ? 'border-red-500/50' : 'border-white/10'
              }`}
              placeholder="nedeleden"
            />
            <View className="absolute right-4 top-1/2 -translate-y-1/2">
              {isCheckingUsername ? (
                <Loader2 className="animate-spin text-slate-500" size={16} />
              ) : isUsernameAvailable === true ? (
                <CheckCircle className="text-emerald-500" size={16} />
              ) : isUsernameAvailable === false ? (
                <XCircle className="text-red-500" size={16} />
              ) : null}
            </View>
          </View>
          {isUsernameAvailable === false && (
             <Text className="text-xs text-red-400">Username is already taken.</Text>
          )}
        </View>

        {/* Email */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-slate-300">Email Address</Text>
          <View className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white"
              placeholder="name@example.com"
            />
          </View>
        </View>

        {/* Password */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-slate-300">Password</Text>
          <View className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white"
              placeholder="••••••••"
            />
          </View>
        </View>

        {error ? (
          <View className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-2">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleCreateAccount}
          disabled={isLoading || isUsernameAvailable === false}
          className="w-full bg-primary py-3.5 rounded-xl shadow-lg items-center justify-center mt-4"
        >
          {isLoading ? <Loader2 className="animate-spin text-white" size={20} /> : <Text className="text-white font-bold">Create Account</Text>}
        </TouchableOpacity>
      </View>
      
      <View className="mt-auto pt-6 items-center">
          <Row className="gap-1">
            <Text className="text-slate-400 text-sm">Already have an account?</Text>
            <TouchableOpacity onPress={() => onNavigate(ViewState.LOGIN)}>
                <Text className="text-white font-semibold text-sm">Sign In</Text>
            </TouchableOpacity>
          </Row>
      </View>
    </View>
  );
};
