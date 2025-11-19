
import React, { useState } from 'react';
import { ViewState } from '../types';
import { authService } from '../services/authService';
import { View, Text, TouchableOpacity, TextInput, Row } from '../components/native';
import { ChevronLeft, Mail, Lock, Loader2, Key } from 'lucide-react';

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
    <View className="flex-1 h-full p-6">
      <TouchableOpacity 
        onPress={() => onNavigate(ViewState.WELCOME)}
        className="flex-row items-center gap-1 mb-6"
      >
        <ChevronLeft size={20} className="text-slate-400" /> 
        <Text className="text-slate-400">Back</Text>
      </TouchableOpacity>

      <View className="space-y-2 mb-6">
        <Text className="text-3xl font-bold text-white">Welcome back</Text>
        <Text className="text-slate-400">Access your wallet securely.</Text>
      </View>

      {/* Login Method Toggle */}
      <Row className="p-1 bg-surface rounded-xl border border-white/5 mb-8">
        <TouchableOpacity
          onPress={() => setLoginMethod('email')}
          className={`flex-1 py-2 items-center rounded-lg ${loginMethod === 'email' ? 'bg-white/10 shadow-sm' : ''}`}
        >
          <Text className={`text-sm font-medium ${loginMethod === 'email' ? 'text-white' : 'text-slate-400'}`}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLoginMethod('phrase')}
          className={`flex-1 py-2 items-center rounded-lg ${loginMethod === 'phrase' ? 'bg-white/10 shadow-sm' : ''}`}
        >
          <Text className={`text-sm font-medium ${loginMethod === 'phrase' ? 'text-white' : 'text-slate-400'}`}>Import Phrase</Text>
        </TouchableOpacity>
      </Row>

      <View className="flex-1">
        {loginMethod === 'email' ? (
          <View className="space-y-4">
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
          </View>
        ) : (
          <View className="space-y-4">
             <View className="space-y-2">
              <Text className="text-sm font-medium text-slate-300">Recovery Phrase</Text>
              <View className="relative">
                <Key className="absolute left-4 top-4 text-slate-500" size={18} />
                <textarea
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  className="w-full h-32 bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none resize-none"
                  placeholder="Enter your 12-word recovery phrase..."
                />
              </View>
              <Text className="text-xs text-slate-500">Usually 12 or 24 words separated by spaces.</Text>
            </View>
          </View>
        )}

        {error ? (
          <View className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-4">
            <Text className="text-red-400 text-sm text-center">{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          className="w-full bg-primary py-3.5 rounded-xl shadow-lg mt-6 items-center justify-center flex-row gap-2"
        >
          {isLoading ? <Loader2 className="animate-spin text-white" size={20} /> : <Text className="text-white font-bold">{loginMethod === 'email' ? 'Sign In' : 'Recover Wallet'}</Text>}
        </TouchableOpacity>

        {loginMethod === 'email' && (
          <View className="items-center mt-4">
              <TouchableOpacity>
                <Text className="text-sm text-primary">Forgot Password?</Text>
              </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View className="mt-auto pt-12 items-center">
          <Row className="gap-1">
            <Text className="text-slate-400 text-sm">Don't have an account?</Text>
            <TouchableOpacity onPress={() => onNavigate(ViewState.SIGNUP)}>
                <Text className="text-white font-semibold text-sm">Sign Up</Text>
            </TouchableOpacity>
          </Row>
      </View>
    </View>
  );
};
