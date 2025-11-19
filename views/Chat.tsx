
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Friend, Attachment, Asset } from '../types';
import { authService } from '../services/authService';
import { databaseService } from '../services/databaseService';
import { encryptionService } from '../services/encryptionService';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Row, Image } from '../components/native';
import { ChevronLeft, Send, Lock, Ghost, Users, Plus, Image as ImageIcon, X, Film, Phone, Video, Mic, MicOff, PhoneOff, DollarSign, CheckCircle, Play, Receipt, ShieldCheck } from 'lucide-react';

interface ChatProps {
  currentUser: User;
  targetId: string;
  isGroup: boolean;
  onBack: () => void;
  assets?: Asset[];
  onSendTransaction?: (amount: number, symbol: string) => void;
  onStartCall?: (video: boolean) => void;
}

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

export const Chat: React.FC<ChatProps> = ({ currentUser, targetId, isGroup, onBack, assets, onSendTransaction, onStartCall }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [targetInfo, setTargetInfo] = useState<{name: string, icon?: string, subtext: string} | null>(null);
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordInterval = useRef<NodeJS.Timeout | null>(null);

  // Payment State
  const [isSendingMoney, setIsSendingMoney] = useState(false);
  const [isRequestingMoney, setIsRequestingMoney] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payAsset, setPayAsset] = useState<Asset | null>(null);
  const [invoiceDesc, setInvoiceDesc] = useState('');
  
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (assets && assets.length > 0 && !payAsset) {
        setPayAsset(assets[0]);
    }
  }, [assets]);

  // 1. Initialize Encryption & Load Metadata
  useEffect(() => {
    const initChat = async () => {
      // Set Target Info
      if (isGroup) {
        const group = authService.getGroupDetails(targetId);
        if (group) {
          setTargetInfo({ name: group.name, icon: group.icon, subtext: `${group.members.length} members` });
        }
      } else {
        const friend = authService.getFriends(currentUser.friends).find(f => f.id === targetId);
        if (friend) {
          setTargetInfo({ name: friend.name, subtext: friend.status === 'online' ? 'Online' : 'Last seen recently' });
        }
        
        // Derive Key for 1:1 Chat
        const key = await encryptionService.deriveSessionKey(currentUser.id, targetId);
        setSessionKey(key);
      }
    };
    initChat();
  }, [currentUser.id, targetId, isGroup]);

  // 2. Load & Decrypt Messages
  useEffect(() => {
    if (!sessionKey && !isGroup) return; // Wait for key in 1:1

    const loadAndDecrypt = async () => {
       const rawMessages = await authService.fetchMessages(currentUser.id, targetId, isGroup);
       
       // Decrypt contents
       const decryptedMessages = await Promise.all(rawMessages.map(async (msg) => {
           if (msg.text && !isGroup && sessionKey) {
               const plain = await encryptionService.decrypt(msg.text, sessionKey);
               return { ...msg, text: plain };
           }
           return msg;
       }));
       
       setMessages(decryptedMessages);
    };

    loadAndDecrypt();

    // Realtime Subscription
    const channel = databaseService.subscribeToMessages(async (newMsg: Message) => {
        const isRelevant = isGroup 
            ? newMsg.receiverId === targetId 
            : (newMsg.senderId === currentUser.id && newMsg.receiverId === targetId) || (newMsg.senderId === targetId && newMsg.receiverId === currentUser.id);

        if (isRelevant) {
            // Decrypt incoming
            let finalText = newMsg.text;
            if (newMsg.text && !isGroup && sessionKey) {
                finalText = await encryptionService.decrypt(newMsg.text, sessionKey);
            }

            setMessages(prev => {
                if (prev.some(m => m.id === newMsg.id)) return prev;
                return [...prev, { ...newMsg, text: finalText }];
            });
        }
    });

    return () => { if (channel) channel.unsubscribe(); };
  }, [sessionKey, currentUser.id, targetId, isGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Handlers ---

  const startRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    recordInterval.current = setInterval(() => setRecordDuration(prev => prev + 1), 1000);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordDuration(0);
    if (recordInterval.current) clearInterval(recordInterval.current);
  };

  const sendVoiceNote = async () => {
    setIsRecording(false);
    if (recordInterval.current) clearInterval(recordInterval.current);
    
    // For prototype, voice notes are just attachments, not encrypted blobs yet
    const attachment: Attachment = {
       id: 'audio_' + Date.now(),
       type: 'audio',
       duration: recordDuration,
       url: 'mock_audio_url'
    };
    
    await sendMessage('', [attachment]);
  };

  const handleSend = async () => {
    if (!input.trim() && !pendingAttachment) return;
    const attachments = pendingAttachment ? [pendingAttachment] : undefined;
    await sendMessage(input, attachments);
    setInput('');
    setPendingAttachment(null);
    setShowAttachMenu(false);
  };

  const sendMessage = async (text: string, attachments?: Attachment[]) => {
      // 1. Encrypt
      let cipherText = text;
      if (text && !isGroup && sessionKey) {
          cipherText = await encryptionService.encrypt(text, sessionKey);
      }

      // 2. Optimistic Update (Show Plain Text)
      const tempMsg: Message = {
        id: 'temp_' + Date.now(),
        senderId: currentUser.id,
        receiverId: targetId,
        text: text, // Show plain text in UI
        attachments: attachments,
        timestamp: Date.now(),
        isEphemeral,
        isRead: false
      };
      setMessages(prev => [...prev, tempMsg]);

      // 3. Send Encrypted to DB
      await authService.sendMessage(
        currentUser.id, 
        targetId, 
        cipherText, // Send ciphertext
        isEphemeral, 
        isGroup,
        attachments
      );
  };
  
  // ... (Payment Logic - kept mostly same, but calls sendMessage)
  const confirmPayment = async () => {
      if (!payAmount || !payAsset || !onSendTransaction) return;
      const amount = parseFloat(payAmount);
      onSendTransaction(amount, payAsset.symbol);
      
      const attachment: Attachment = {
          id: 'pay_' + Date.now(),
          type: 'transfer',
          metadata: { amount, symbol: payAsset.symbol, valueUsd: amount * payAsset.price, status: 'completed' }
      };
      
      setIsSendingMoney(false);
      setPayAmount('');
      setShowAttachMenu(false);
      await sendMessage(`Sent ${amount} ${payAsset.symbol}`, [attachment]);
  };

  const sendInvoice = async () => {
      if (!payAmount || !payAsset) return;
      const amount = parseFloat(payAmount);
      
      const attachment: Attachment = {
          id: 'inv_' + Date.now(),
          type: 'invoice',
          metadata: { amount, symbol: payAsset.symbol, valueUsd: amount * payAsset.price, status: 'pending', description: invoiceDesc || 'Payment Request' }
      };

      setIsRequestingMoney(false);
      setPayAmount('');
      setInvoiceDesc('');
      setShowAttachMenu(false);
      await sendMessage(`Requested ${amount} ${payAsset.symbol}`, [attachment]);
  };

  const handlePayInvoice = (att: Attachment) => {
     if (att.metadata) {
         setPayAmount(att.metadata.amount.toString());
         const asset = assets?.find(a => a.symbol === att.metadata?.symbol);
         if (asset) setPayAsset(asset);
         setIsSendingMoney(true);
     }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { alert('File too large. Max 10MB.'); return; }

    const reader = new FileReader();
    reader.onload = () => {
        setPendingAttachment({
            id: `temp_${Date.now()}`,
            type: file.type.startsWith('video/') ? 'video' : 'image',
            url: reader.result as string,
            fileName: file.name,
            fileSize: file.size
        });
    };
    reader.readAsDataURL(file);
  };

  const renderAttachment = (att: Attachment, isMe: boolean) => {
      if (att.type === 'transfer' && att.metadata) {
          return (
              <View className="bg-white rounded-xl p-3 w-52 overflow-hidden relative shadow-sm">
                  <Row className="items-center justify-between mb-2">
                      <Row className="items-center gap-1.5">
                          <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                              <DollarSign size={14} className="text-white" />
                          </View>
                          <Text className="text-xs font-bold text-slate-800">Transfer</Text>
                      </Row>
                      <CheckCircle size={14} className="text-emerald-500" />
                  </Row>
                  <Text className="text-2xl font-bold text-slate-900">{att.metadata.amount} {att.metadata.symbol}</Text>
                  <Text className="text-xs text-slate-500 mb-2">≈ ${att.metadata.valueUsd.toFixed(2)}</Text>
              </View>
          );
      }
      // ... (Invoice, Audio, Video, Image rendering - same as before)
      if (att.type === 'invoice' && att.metadata) {
          return (
              <View className="bg-white rounded-xl p-3 w-56 overflow-hidden relative shadow-sm">
                   <Row className="items-center justify-between mb-2">
                      <Row className="items-center gap-1.5">
                          <View className="w-6 h-6 rounded-full bg-indigo-500 items-center justify-center"><Receipt size={14} className="text-white" /></View>
                          <Text className="text-xs font-bold text-slate-800">Request</Text>
                      </Row>
                      <View className={`px-2 py-0.5 rounded-full ${att.metadata.status === 'completed' ? 'bg-emerald-100' : 'bg-yellow-100'}`}>
                         <Text className={`text-[10px] font-bold ${att.metadata.status === 'completed' ? 'text-emerald-600' : 'text-yellow-600'}`}>{att.metadata.status.toUpperCase()}</Text>
                      </View>
                  </Row>
                  <Text className="text-2xl font-bold text-slate-900 mb-1">{att.metadata.amount} {att.metadata.symbol}</Text>
                  <Text className="text-xs text-slate-500 mb-3 italic">"{att.metadata.description}"</Text>
                  {!isMe && att.metadata.status === 'pending' && (
                      <TouchableOpacity onPress={() => handlePayInvoice(att)} className="w-full h-9 bg-indigo-600 rounded-lg items-center justify-center shadow">
                          <Text className="text-xs font-bold text-white">Pay Now</Text>
                      </TouchableOpacity>
                  )}
              </View>
          );
      }
      if (att.type === 'audio') {
          return (
             <View className="flex-row items-center gap-3 p-2 bg-black/20 rounded-xl w-48">
                 <TouchableOpacity className="w-8 h-8 rounded-full bg-white items-center justify-center"><Play size={14} className="text-black fill-black ml-0.5" /></TouchableOpacity>
                 <Text className="text-xs text-white font-mono">0:{att.duration?.toString().padStart(2, '0')}</Text>
             </View>
          );
      }
      if (att.type === 'video') return (<View className="mb-2 overflow-hidden rounded-lg bg-black relative w-full max-w-[250px] aspect-video"><video src={att.url} controls className="w-full h-full object-contain" /></View>);
      return (<View className="mb-2 overflow-hidden rounded-lg relative w-full max-w-[250px]"><Image source={att.url!} className="w-full h-40 object-cover" /></View>);
  };

  if (!targetInfo) return <View className="p-10 items-center"><Text>Loading Chat...</Text></View>;

  return (
    <View className={`flex-1 h-full flex-col pb-4 relative ${isEphemeral ? 'bg-slate-900' : 'bg-black'}`}>
      {/* Money Modal Reuse */}
      {(isSendingMoney || isRequestingMoney) && assets && (
          <View className="absolute inset-0 z-[60] bg-black/90 flex items-center justify-center p-6">
              <View className="w-full max-w-xs bg-surface border border-white/10 rounded-2xl p-5">
                  <Row className="justify-between items-center mb-6">
                      <Text className="text-lg font-bold">{isSendingMoney ? 'Send Crypto' : 'Request Crypto'}</Text>
                      <TouchableOpacity onPress={() => { setIsSendingMoney(false); setIsRequestingMoney(false); }} className="p-1 bg-white/10 rounded-full"><X size={16} className="text-slate-400" /></TouchableOpacity>
                  </Row>
                  <View className="space-y-4">
                      <View>
                          <Text className="text-xs text-slate-400 mb-2 font-bold uppercase">Amount ({payAsset?.symbol})</Text>
                          <TextInput type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xl font-bold text-white" autoFocus />
                      </View>
                      {isRequestingMoney && <TextInput value={invoiceDesc} onChange={(e) => setInvoiceDesc(e.target.value)} placeholder="Note (Optional)" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" />}
                      <TouchableOpacity onPress={isSendingMoney ? confirmPayment : sendInvoice} disabled={!payAmount} className="w-full bg-primary py-3.5 rounded-xl items-center justify-center"><Text className="font-bold text-white">Confirm</Text></TouchableOpacity>
                  </View>
              </View>
          </View>
      )}

      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center justify-between border-b ${isEphemeral ? 'border-slate-700 bg-slate-800/50' : 'border-white/5 bg-background/90'} backdrop-blur-md z-10`}>
        <Row className="items-center gap-2">
          <TouchableOpacity onPress={onBack} className="p-1.5 -ml-2 rounded-full hover:bg-white/10"><ChevronLeft size={24} className="text-white" /></TouchableOpacity>
          <Row className="items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 items-center justify-center"><Text className="font-bold text-sm text-white">{isGroup ? targetInfo.icon : targetInfo.name[0]}</Text></View>
              <View>
                <Text className="font-bold text-sm leading-none mb-0.5">{targetInfo.name}</Text>
                <Row className="items-center gap-1">
                  {!isGroup && <ShieldCheck size={8} className="text-emerald-400" />} 
                  <Text className="text-[10px] text-slate-400">{targetInfo.subtext}</Text>
                </Row>
              </View>
            </Row>
        </Row>
        <Row className="items-center gap-3">
           <TouchableOpacity onPress={() => onStartCall && onStartCall(false)}><Phone size={20} className="text-slate-400" /></TouchableOpacity>
           <TouchableOpacity onPress={() => onStartCall && onStartCall(true)}><Video size={20} className="text-slate-400" /></TouchableOpacity>
           <TouchableOpacity onPress={() => setIsEphemeral(!isEphemeral)} className={`p-2 rounded-full ${isEphemeral ? 'bg-white' : 'bg-white/5'}`}><Ghost size={18} className={isEphemeral ? 'text-black' : 'text-slate-400'} /></TouchableOpacity>
        </Row>
      </View>

      {isEphemeral && <View className="bg-slate-800 py-1 items-center"><Text className="text-[10px] text-slate-400">Messages disappear after viewing</Text></View>}

      {/* Messages */}
      <ScrollView className="flex-1 p-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <View key={msg.id} className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
              <View className={`max-w-[85%] px-3 py-2 rounded-2xl ${isMe ? (isEphemeral ? 'bg-slate-200' : 'bg-primary') : (isEphemeral ? 'bg-slate-700' : 'bg-surface border border-white/5')}`}>
                 {msg.attachments?.map(att => <View key={att.id}>{renderAttachment(att, isMe)}</View>)}
                 {msg.text && <Text className={`text-sm leading-relaxed ${isMe && isEphemeral ? 'text-black' : 'text-white'}`}>{msg.text}</Text>}
                 <Text className={`text-[9px] text-right mt-1 ${isMe && isEphemeral ? 'text-slate-600' : 'text-slate-500'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              </View>
            </View>
          );
        })}
        <div ref={messagesEndRef} />
      </ScrollView>

      {/* Input */}
      <View className="px-4 pt-2 pb-2">
        {pendingAttachment && (
            <View className="mb-2 p-2 bg-surface border border-white/10 rounded-xl flex-row items-center justify-between">
               <Text className="text-xs font-bold truncate max-w-[150px]">{pendingAttachment.fileName}</Text>
               <TouchableOpacity onPress={() => setPendingAttachment(null)}><X size={14} className="text-white" /></TouchableOpacity>
            </View>
        )}
        <Row className={`items-center p-1 rounded-full border transition-all ${isRecording ? 'bg-red-900/30 border-red-500/50' : 'bg-surface border-white/10'}`}>
          {isRecording ? (
            <View className="flex-1 flex-row items-center justify-between px-2 py-1">
               <Row className="items-center gap-3"><View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><Text className="font-mono text-white font-bold">00:{recordDuration.toString().padStart(2, '0')}</Text></Row>
               <Row className="gap-2">
                   <TouchableOpacity onPress={cancelRecording} className="p-2"><Text className="text-xs font-bold text-slate-400">Cancel</Text></TouchableOpacity>
                   <TouchableOpacity onPress={sendVoiceNote} className="p-2 bg-red-500 rounded-full"><Send size={16} className="text-white" /></TouchableOpacity>
               </Row>
            </View>
          ) : (
            <>
              <View className="relative">
                  <TouchableOpacity onPress={() => setShowAttachMenu(!showAttachMenu)} className="p-2.5"><Plus size={20} className={`text-slate-400 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} /></TouchableOpacity>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                  {showAttachMenu && (
                     <View className="absolute bottom-12 left-0 bg-surface border border-white/10 rounded-xl p-2 shadow-2xl min-w-[200px] z-20">
                        <TouchableOpacity onPress={() => { setIsSendingMoney(true); setShowAttachMenu(false); }} className="w-full flex-row items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg"><DollarSign size={16} className="text-emerald-400" /><Text className="text-sm font-bold text-white">Send Crypto</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { setIsRequestingMoney(true); setShowAttachMenu(false); }} className="w-full flex-row items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg"><Receipt size={16} className="text-indigo-400" /><Text className="text-sm font-bold text-white">Request Crypto</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { setShowAttachMenu(false); fileInputRef.current?.click(); }} className="w-full flex-row items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg"><ImageIcon size={18} className="text-blue-400" /><Text className="text-sm text-slate-300">Photo & Video</Text></TouchableOpacity>
                     </View>
                  )}
              </View>
              <TextInput value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isEphemeral ? "Send disappearing message..." : "Type a message..."} className="flex-1 bg-transparent border-none px-2 py-2.5 text-sm text-white placeholder:text-slate-500" />
              {input.trim() || pendingAttachment ? <TouchableOpacity onPress={handleSend} className="p-2.5 rounded-full bg-primary"><Send size={16} className="text-white" /></TouchableOpacity> : <TouchableOpacity onPress={startRecording} className="p-2.5 rounded-full hover:bg-white/10"><Mic size={20} className="text-slate-400" /></TouchableOpacity>}
            </>
          )}
        </Row>
      </View>
    </View>
  );
};
