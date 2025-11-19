import React, { useState } from 'react';
import { ViewState } from '../types';
import { authService } from '../services/authService';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="h-full p-6 animate-in slide-in-from-right duration-500">
      <button 
        onClick={() => onNavigate(ViewState.WELCOME)}
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="space-y-2 mb-6">
        <h2 className="text-3xl font-bold">Welcome back</h2>
        <p className="text-slate-400">Access your wallet securely.</p>
      </div>

      {/* Login Method Toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-xl border border-white/5 mb-8">
        <button
          onClick={() => setLoginMethod('email')}
          className={`py-2 text-sm font-medium rounded-lg transition-all ${
            loginMethod === 'email' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setLoginMethod('phrase')}
          className={`py-2 text-sm font-medium rounded-lg transition-all ${
            loginMethod === 'phrase' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Import Phrase
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {loginMethod === 'email' ? (
          <div className="space-y-4 animate-in fade-in">
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
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in">
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Recovery Phrase</label>
              <div className="relative">
                <Key className="absolute left-4 top-4 text-slate-500" size={18} />
                <textarea
                  required
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  className="w-full h-32 bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-slate-600 resize-none leading-relaxed"
                  placeholder="Enter your 12-word recovery phrase..."
                />
              </div>
              <p className="text-xs text-slate-500">Usually 12 or 24 words separated by spaces.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : (loginMethod === 'email' ? 'Sign In' : 'Recover Wallet')}
        </button>

        {loginMethod === 'email' && (
          <div className="text-center">
              <button type="button" className="text-sm text-primary hover:text-indigo-400">
                  Forgot Password?
              </button>
          </div>
        )}
      </form>
      
      <div className="mt-auto pt-12 text-center">
          <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={() => onNavigate(ViewState.SIGNUP)}
                className="text-white font-semibold hover:underline"
              >
                  Sign Up
              </button>
          </p>
      </div>
    </div>
  );
};