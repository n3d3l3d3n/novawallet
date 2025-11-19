import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Asset } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { Send, Sparkles, Bot, User, TrendingUp, BarChart2, ShieldAlert, Activity } from 'lucide-react';

interface AdvisorProps {
  assets?: Asset[];
}

export const Advisor: React.FC<AdvisorProps> = ({ assets = [] }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Nova, your AI Market Analyst. I can help you analyze trends, assess portfolio risk, or explain complex crypto concepts. What's on your mind?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await sendMessageToGemini(textToSend);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const analysisChips = [
    { label: 'Market Overview', icon: TrendingUp, prompt: 'Give me a comprehensive overview of the current crypto market sentiment and major trends.' },
    { label: 'Analyze BTC', icon: Activity, prompt: 'Analyze Bitcoin (BTC) current price action, key support/resistance levels, and short-term outlook.' },
    { label: 'Analyze ETH', icon: Activity, prompt: 'Analyze Ethereum (ETH) ecosystem updates and price trends.' },
    { label: 'Portfolio Risk', icon: ShieldAlert, prompt: 'What are common risks in a crypto portfolio and how can I hedge against volatility?' },
    { label: 'DeFi Trends', icon: BarChart2, prompt: 'What are the emerging trends in DeFi right now?' },
  ];

  return (
    <div className="flex flex-col h-full pt-4 pb-20 animate-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="px-5 pb-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="text-white" size={20} />
        </div>
        <div>
           <h1 className="font-bold text-lg leading-none">Nova Analyst</h1>
           <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> AI Online
           </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
               </div>
               <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                 msg.role === 'user' 
                   ? 'bg-slate-800 text-white rounded-tr-sm' 
                   : 'bg-gradient-to-br from-indigo-600/90 to-purple-700/90 text-white backdrop-blur-sm rounded-tl-sm'
               }`}>
                 <div className="whitespace-pre-wrap font-light">{msg.text}</div>
               </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="flex gap-2 items-center ml-10 bg-surface px-4 py-3 rounded-2xl rounded-tl-sm">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Actions Area */}
      <div className="absolute bottom-[5.5rem] left-0 right-0 space-y-3">
        
        {/* Analysis Chips */}
        <div className="px-4 overflow-x-auto no-scrollbar flex gap-2">
          {analysisChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.prompt)}
              disabled={isTyping}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-medium text-slate-200 whitespace-nowrap hover:bg-primary/20 hover:border-primary/30 hover:text-white transition-all active:scale-95"
            >
              <chip.icon size={12} className="text-primary" />
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="px-4 max-w-md mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about market trends..."
              className="w-full bg-surface/90 backdrop-blur-xl border border-white/10 rounded-full py-3.5 pl-5 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-xl placeholder:text-slate-500"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="absolute right-2 p-2 bg-primary rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};