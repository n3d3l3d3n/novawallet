
import React, { useState } from 'react';
import { ViewState } from '../types';
import { authService } from '../services/authService';
import { View, Text, TouchableOpacity, TextInput, Row } from '../components/native';
import { ChevronLeft, Mail, Lock, Loader2, Key, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';

interface LoginProps {
  onNavigate: (view: ViewState) => void;
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phrase'>('email');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phrase state
  const [phrase, setPhrase] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      let user;
      if (loginMethod === 'email') {
        user = await authService.login(email, password);
      } else {
        user = await authService.loginWithPhrase(phrase);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 h-full bg-[#050505] relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <View className="pt-14 px-6 z-10">
        <TouchableOpacity 
          onPress={() => onNavigate(ViewState.WELCOME)}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center active:bg-white/10 transition-colors"
        >
          <ChevronLeft size={20} className="text-white" /> 
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-8 z-10 flex flex-col">
        {/* Title Block */}
        <View className="mb-10">
          <Text className="text-4xl font-bold text-white mb-2 tracking-tight">
            Access <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Nova Vault</span>
          </Text>
          <Text className="text-slate-400 text-base">Securely manage your digital assets.</Text>
        </View>

        {/* Switcher */}
        <View className="bg-white/5 p-1 rounded-2xl flex-row border border-white/10 mb-8 relative">
           {/* Animated Slider Background - Simplified for React Native shim */}
           <View className={`absolute top-1 bottom-1 rounded-xl bg-white/10 transition-all duration-300 ease-out w-[48%] ${loginMethod === 'email' ? 'left-1' : 'left-[51%]'}`} />
           
           <TouchableOpacity
             onPress={() => setLoginMethod('email')}
             className="flex-1 py-3 items-center justify-center z-10"
           >
             <Text className={`text-sm font-bold transition-colors ${loginMethod === 'email' ? 'text-white' : 'text-slate-500'}`}>Cloud Account</Text>
           </TouchableOpacity>
           <TouchableOpacity
             onPress={() => setLoginMethod('phrase')}
             className="flex-1 py-3 items-center justify-center z-10"
           >
             <Text className={`text-sm font-bold transition-colors ${loginMethod === 'phrase' ? 'text-white' : 'text-slate-500'}`}>Self-Custody</Text>
           </TouchableOpacity>
        </View>

        {/* Form Container */}
        <View className="flex-1">
          {loginMethod === 'email' ? (
            <View className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
              <View className="space-y-2">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</Text>
                <View className="relative group">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 group-focus-within:border-indigo-500/50 group-focus-within:bg-white/10 transition-all" />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <TextInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 text-white text-base relative z-10 bg-transparent outline-none"
                    placeholder="name@example.com"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <View className="space-y-2">
                <Row className="justify-between items-center ml-1">
                   <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</Text>
                   <TouchableOpacity>
                     <Text className="text-xs font-bold text-indigo-400">Forgot?</Text>
                   </TouchableOpacity>
                </Row>
                <View className="relative group">
                  <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 group-focus-within:border-indigo-500/50 group-focus-within:bg-white/10 transition-all" />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <TextInput
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 text-white text-base relative z-10 bg-transparent outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
               <View className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex-row gap-3 items-start">
                  <ShieldCheck className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                  <Text className="text-xs text-yellow-200/80 leading-relaxed">
                    Enter your 12 or 24-word Secret Recovery Phrase to restore your wallet locally.
                  </Text>
               </View>

               <View className="space-y-2">
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Recovery Phrase</Text>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10 group-focus-within:border-yellow-500/50 transition-all" />
                    <Key className="absolute left-4 top-4 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                    <textarea
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      className="w-full h-40 bg-transparent p-4 pl-12 text-white text-base focus:outline-none resize-none relative z-10"
                      placeholder="apple banana cherry..."
                      style={{ lineHeight: '1.6' }}
                    />
                  </div>
              </View>
            </View>
          )}

          {error ? (
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-bottom-2">
              <Text className="text-red-400 text-sm text-center font-medium">{error}</Text>
            </div>
          ) : null}
        </View>

        {/* Action Area */}
        <View className="pb-safe-bottom mb-6">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`w-full h-14 rounded-2xl flex-row items-center justify-center gap-3 shadow-lg transition-all duration-300 ${
                 loginMethod === 'email' ? 'bg-primary shadow-indigo-500/25' : 'bg-white text-black shadow-white/10'
              }`}
            >
              {isLoading ? (
                 <Loader2 className={`animate-spin ${loginMethod === 'email' ? 'text-white' : 'text-black'}`} size={24} />
              ) : (
                 <>
                   <Text className={`font-bold text-lg ${loginMethod === 'email' ? 'text-white' : 'text-black'}`}>
                     {loginMethod === 'email' ? 'Sign In' : 'Restore Wallet'}
                   </Text>
                   <ArrowRight size={20} className={loginMethod === 'email' ? 'text-white' : 'text-black'} />
                 </>
              )}
            </TouchableOpacity>

            {loginMethod === 'email' && (
              <View className="mt-6 items-center">
                 <Text className="text-slate-500 text-sm">
                   Don't have an account?{' '}
                   <span 
                     onClick={() => onNavigate(ViewState.SIGNUP)}
                     className="text-white font-bold cursor-pointer hover:underline"
                   >
                     Create one
                   </span>
                 </Text>
              </View>
            )}
        </View>
      </View>
    </View>
  );
};
