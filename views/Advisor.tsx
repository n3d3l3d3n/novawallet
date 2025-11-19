
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Asset, User, ViewState } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { View, Text, ScrollView, TouchableOpacity, Row, TextInput } from '../components/native';
import { Send, Sparkles, Bot, User as UserIcon, TrendingUp, BarChart2, ShieldAlert, Activity, PieChart, ChevronLeft } from 'lucide-react';

interface AdvisorProps {
  assets?: Asset[];
  user?: User | null;
  initialPrompt?: string;
  onNavigate?: (view: ViewState) => void;
}

export const Advisor: React.FC<AdvisorProps> = ({ assets = [], user, initialPrompt, onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${user?.name.split(' ')[0] || 'there'}! I'm Nova, your AI Market Analyst. I can see your portfolio and live market data. How can I optimize your strategy today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasAutoSent, setHasAutoSent] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-send initial prompt if provided (e.g., coming from AssetDetails)
  useEffect(() => {
    if (initialPrompt && !hasAutoSent) {
      handleSend(initialPrompt);
      setHasAutoSent(true);
    }
  }, [initialPrompt]);

  // Helper to build the context string for the AI
  const buildMarketContext = () => {
    if (assets.length === 0) return "User has no assets currently.";
    
    const totalValue = assets.reduce((acc, a) => acc + (a.balance * a.price), 0);
    const assetSummary = assets.map(a => 
      `${a.symbol}: Price $${a.price.toFixed(2)} (${a.change24h}% 24h), User Holds: ${a.balance} (${((a.balance * a.price / totalValue) * 100).toFixed(1)}% of portfolio)`
    ).join('; ');

    return `Total Portfolio Value: $${totalValue.toFixed(2)}. Assets Breakdown: [${assetSummary}]`;
  };

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

    // Inject the live context
    const marketContext = buildMarketContext();
    const responseText = await sendMessageToGemini(textToSend, marketContext);

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
    { label: 'My Portfolio', icon: PieChart, prompt: 'Analyze my current portfolio allocation. Am I too concentrated in one asset? What risks do you see?' },
    { label: 'Market Mood', icon: TrendingUp, prompt: 'Based on the current prices of BTC and ETH, what is the general market sentiment right now?' },
    { label: 'Top Opportunities', icon: Sparkles, prompt: 'Which of my assets has the strongest momentum right now based on 24h change?' },
    { label: 'Risk Check', icon: ShieldAlert, prompt: 'Evaluate the risk level of my current holdings.' },
  ];

  return (
    <View className="flex-1 h-full pb-20 bg-black">
      {/* Header */}
      <View className="px-5 pt-4 pb-4 border-b border-white/5 bg-background z-10">
        <Row className="items-center justify-between">
            <Row className="items-center gap-3">
                {onNavigate && (
                  <TouchableOpacity onPress={() => onNavigate(ViewState.HOME)} className="mr-2">
                     <ChevronLeft className="text-slate-400" size={24} />
                  </TouchableOpacity>
                )}
                <View className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Sparkles className="text-white" size={20} />
                </View>
                <View>
                    <Text className="font-bold text-lg leading-none">Nova Analyst</Text>
                    <Row className="items-center gap-1 mt-1">
                        <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <Text className="text-xs text-emerald-400 font-medium">Live Market Data Synced</Text>
                    </Row>
                </View>
            </Row>
        </Row>
      </View>

      {/* Messages Area */}
      <ScrollView className="flex-1 p-4 space-y-4">
        {messages.map((msg) => (
          <Row key={msg.id} className={`mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Row className={`gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <View className={`w-8 h-8 rounded-full flex-shrink-0 items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-600'}`}>
                  {msg.role === 'user' ? <UserIcon size={14} className="text-white" /> : <Bot size={16} className="text-white" />}
               </View>
               <View className={`p-3.5 rounded-2xl shadow-md ${
                 msg.role === 'user' 
                   ? 'bg-slate-800 rounded-tr-sm' 
                   : 'bg-gradient-to-br from-indigo-600/90 to-purple-700/90 backdrop-blur-sm rounded-tl-sm border border-white/10'
               }`}>
                 {/* Simple Markdown-ish parsing for bold text */}
                 <Text className="text-sm leading-relaxed font-light text-white">
                    {msg.text.split('**').map((part, i) => 
                        i % 2 === 1 ? <span key={i} className="font-bold text-white">{part}</span> : part
                    )}
                 </Text>
               </View>
            </Row>
          </Row>
        ))}
        {isTyping && (
           <Row className="justify-start mb-4">
             <Row className="gap-2 items-center ml-10 bg-surface px-4 py-3 rounded-2xl rounded-tl-sm">
               <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </Row>
           </Row>
        )}
        <div ref={messagesEndRef} />
      </ScrollView>

      {/* Input & Actions Area */}
      <View className="absolute bottom-[5.5rem] left-0 right-0 gap-3">
        
        {/* Analysis Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 gap-2">
          {analysisChips.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSend(chip.prompt)}
              disabled={isTyping}
              className="flex-row items-center gap-1.5 px-3 py-1.5 bg-surface/60 backdrop-blur-md border border-white/10 rounded-full mr-2 shadow-lg"
            >
              <chip.icon size={12} className="text-primary" />
              <Text className="text-xs font-medium text-slate-200">{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View className="px-4 max-w-md mx-auto w-full">
          <View className="relative justify-center">
            <TextInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Nova about your coins..."
              className="w-full bg-surface/90 backdrop-blur-xl border border-white/10 rounded-full py-3.5 pl-5 pr-12 text-sm text-white shadow-xl"
            />
            <TouchableOpacity 
              onPress={() => handleSend()}
              disabled={!input.trim()}
              className="absolute right-2 p-2 bg-primary rounded-full items-center justify-center shadow-lg"
            >
              <Send size={16} className="text-white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
