
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Friend, Attachment, AppPermissions, CallState } from '../types';
import { authService } from '../services/authService';
import { PermissionModal } from '../components/ui/PermissionModal';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Row, Image } from '../components/native';
import { ChevronLeft, Send, Lock, Ghost, ShieldCheck, Users, Plus, Image as ImageIcon, Camera, X, Film, Phone, Video, Mic, MicOff, PhoneOff, MoreVertical, Info, UserMinus, UserPlus, Shield } from 'lucide-react';

interface ChatProps {
  currentUser: User;
  targetId: string;
  isGroup: boolean;
  onBack: () => void;
}

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

export const Chat: React.FC<ChatProps> = ({ currentUser, targetId, isGroup, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [targetInfo, setTargetInfo] = useState<{name: string, icon?: string, subtext: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // UI States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Permission States
  const [permissionRequest, setPermissionRequest] = useState<{type: keyof AppPermissions, title: string, desc: string, icon: React.ReactNode} | null>(null);

  // Store group member info for looking up names of senders
  const [groupMembers, setGroupMembers] = useState<Friend[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isGroup) {
        const group = authService.getGroupDetails(targetId);
        if (group) {
          setTargetInfo({
            name: group.name,
            icon: group.icon,
            subtext: `${group.members.length} members`
          });
          // Load info for all members so we can show names
          const members = authService.getFriends([...group.members]);
          setGroupMembers(members);
        }
      } else {
        const friend = authService.getFriends(currentUser.friends).find(f => f.id === targetId);
        if (friend) {
          setTargetInfo({
            name: friend.name,
            subtext: friend.status === 'online' ? 'Online' : 'Last seen recently'
          });
        }
      }

      const msgs = authService.getMessages(currentUser.id, targetId, isGroup);
      setMessages(msgs);
    };

    loadData();
    
    // Polling for new messages (simulated)
    const interval = setInterval(() => {
        const msgs = authService.getMessages(currentUser.id, targetId, isGroup);
        setMessages(msgs);
    }, 2000);

    return () => clearInterval(interval);
  }, [currentUser.id, targetId, isGroup, currentUser.friends]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Calling Logic ---
  const startCall = (video: boolean) => {
    setIsVideoCall(video);
    setCallState('calling');
    // Simulate connection
    setTimeout(() => {
      setCallState('connected');
    }, 2000);
  };

  const endCall = () => {
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 500);
  };

  const handleSend = async () => {
    if (!input.trim() && !pendingAttachment) return;
    
    const attachments = pendingAttachment ? [pendingAttachment] : undefined;
    
    const newMsg = await authService.sendMessage(
      currentUser.id, 
      targetId, 
      input, 
      isEphemeral, 
      isGroup,
      attachments
    );
    
    // Optimistic update
    const displayMsg = { ...newMsg, text: input }; 
    setMessages(prev => [...prev, displayMsg]);
    setInput('');
    setPendingAttachment(null);
    setShowAttachMenu(false);
  };

  // --- Permission Handling ---

  const checkPermission = (type: keyof AppPermissions): boolean => {
     const status = currentUser.permissions[type];
     return status === 'granted' || status === 'limited';
  };

  const requestPermission = (type: keyof AppPermissions) => {
      if (currentUser.permissions[type] === 'denied') {
         alert('You have previously denied access. Please enable it in your Profile Settings.');
         return;
      }

      let title = 'Permission Request';
      let desc = 'Nova needs access to function correctly.';
      let icon = <ShieldCheck size={32} className="text-slate-400" />;

      if (type === 'photos') {
         title = 'Access Photos';
         desc = 'Nova would like to access your photos to let you send images and videos to your friends.';
         icon = <ImageIcon size={32} className="text-primary" />;
      } else if (type === 'camera') {
         title = 'Access Camera';
         desc = 'Nova would like to access your camera to let you take photos and videos directly in the chat.';
         icon = <Camera size={32} className="text-primary" />;
      }

      setPermissionRequest({ type, title, desc, icon });
  };

  const handlePermissionResult = async (status: 'granted' | 'limited' | 'denied') => {
     if (!permissionRequest) return;
     
     await authService.updatePermission(currentUser.id, permissionRequest.type, status);
     
     // If granted, trigger the action that was requested
     if (status !== 'denied') {
        if (permissionRequest.type === 'photos') {
           fileInputRef.current?.click();
        } else if (permissionRequest.type === 'camera') {
           fileInputRef.current?.click();
        }
     }

     setPermissionRequest(null);
  };

  // --- Attachment Logic ---

  const handleAttachClick = (type: 'photos' | 'camera') => {
     if (checkPermission(type)) {
        fileInputRef.current?.click();
     } else {
        requestPermission(type);
     }
     setShowAttachMenu(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     if (file.size > MAX_FILE_SIZE) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
     }

     const reader = new FileReader();
     reader.onloadend = () => {
        const base64 = reader.result as string;
        const isVideo = file.type.startsWith('video/');
        
        setPendingAttachment({
           id: 'att_' + Date.now(),
           type: isVideo ? 'video' : 'image',
           url: base64,
           fileName: file.name,
           fileSize: file.size
        });
     };
     reader.readAsDataURL(file);
     // Reset input
     e.target.value = '';
  };

  const getSenderName = (senderId: string) => {
    if (senderId === currentUser.id) return 'You';
    const member = groupMembers.find(m => m.id === senderId);
    return member ? member.name.split(' ')[0] : 'Unknown';
  };
  
  const getSenderInitial = (senderId: string) => {
    const member = groupMembers.find(m => m.id === senderId);
    return member ? member.name[0] : '?';
  };

  if (!targetInfo) return <View className="p-10 items-center"><Text>Loading...</Text></View>;

  return (
    <View className={`flex-1 h-full flex-col pb-4 relative ${isEphemeral ? 'bg-slate-900' : ''}`}>
      
      {/* Permission Modal */}
      {permissionRequest && (
         <PermissionModal 
            title={permissionRequest.title}
            description={permissionRequest.desc}
            icon={permissionRequest.icon}
            onAllowFull={() => handlePermissionResult('granted')}
            onAllowLimited={permissionRequest.type === 'photos' ? () => handlePermissionResult('limited') : undefined}
            onDeny={() => handlePermissionResult('denied')}
         />
      )}

      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center justify-between border-b ${isEphemeral ? 'border-slate-700 bg-slate-800/50' : 'border-white/5 bg-background/90'} backdrop-blur-md z-10`}>
        <Row className="items-center gap-2">
          <TouchableOpacity onPress={onBack} className="p-1.5 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowDetails(true)}>
            <Row className="items-center gap-3">
              <View className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 items-center justify-center">
                <Text className="font-bold text-sm text-white">{isGroup ? targetInfo.icon : targetInfo.name[0]}</Text>
              </View>
              <View>
                <Text className="font-bold text-sm leading-none mb-0.5">{targetInfo.name}</Text>
                <Row className="items-center gap-1">
                  {isGroup ? <Users size={8} className="text-slate-400" /> : <Lock size={8} className="text-emerald-400" />} 
                  <Text className="text-[10px] text-slate-400">{targetInfo.subtext}</Text>
                </Row>
              </View>
            </Row>
          </TouchableOpacity>
        </Row>
        
        <Row className="items-center gap-3">
           <TouchableOpacity onPress={() => startCall(false)}>
              <Phone size={20} className="text-slate-400" />
           </TouchableOpacity>
           <TouchableOpacity onPress={() => startCall(true)}>
              <Video size={20} className="text-slate-400" />
           </TouchableOpacity>
           <TouchableOpacity 
              onPress={() => setIsEphemeral(!isEphemeral)}
              className={`p-2 rounded-full ${isEphemeral ? 'bg-white' : 'bg-white/5'}`}
           >
              <Ghost size={18} className={isEphemeral ? 'text-black' : 'text-slate-400'} />
           </TouchableOpacity>
        </Row>
      </View>

      {/* Ephemeral Banner */}
      {isEphemeral && (
         <View className="bg-slate-800 py-1 items-center">
            <Row className="items-center justify-center gap-1">
               <Ghost size={10} className="text-slate-400" />
               <Text className="text-[10px] text-slate-400">Messages will disappear after viewing</Text>
            </Row>
         </View>
      )}

      {/* Messages */}
      <ScrollView className="flex-1 p-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <View key={msg.id} className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
              {isGroup && !isMe && (
                <Row className="items-center gap-2 mb-1 ml-1">
                   <View className="w-4 h-4 rounded-full bg-slate-600 items-center justify-center">
                      <Text className="text-[8px] font-bold text-white">{getSenderInitial(msg.senderId)}</Text>
                   </View>
                   <Text className="text-[10px] text-slate-400">{getSenderName(msg.senderId)}</Text>
                </Row>
              )}
              
              <View className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                isMe 
                  ? isEphemeral ? 'bg-slate-200 rounded-tr-sm' : 'bg-primary rounded-tr-sm'
                  : isEphemeral ? 'bg-slate-700 rounded-tl-sm' : 'bg-surface border border-white/5 rounded-tl-sm'
              }`}>
                 {/* Attachments */}
                 {msg.attachments && msg.attachments.length > 0 && (
                    <View className="mb-2 overflow-hidden rounded-lg">
                       {msg.attachments[0].type === 'image' ? (
                          <Image source={msg.attachments[0].url} className="w-full h-40 object-cover" />
                       ) : (
                          <View className="relative w-full h-40 bg-black items-center justify-center">
                              <video src={msg.attachments[0].url} controls className="w-full h-full object-contain" />
                          </View>
                       )}
                    </View>
                 )}

                 {msg.text && <Text className={`text-sm leading-relaxed ${isMe && isEphemeral ? 'text-black' : 'text-white'}`}>{msg.text}</Text>}
                 
                 <Text className={`text-[9px] text-right mt-1 ${isMe && isEphemeral ? 'text-slate-600' : isMe ? 'text-white/70' : 'text-slate-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isEphemeral && <span className="ml-1">👻</span>}
                 </Text>
              </View>
            </View>
          );
        })}
        <div ref={messagesEndRef} />
      </ScrollView>

      {/* Input Area */}
      <View className="px-4 pt-2 pb-2">
        {/* Pending Attachment Preview */}
        {pendingAttachment && (
            <View className="mb-2 p-2 bg-surface border border-white/10 rounded-xl flex-row items-center justify-between">
               <Row className="items-center gap-3">
                  {pendingAttachment.type === 'image' ? (
                      <Image source={pendingAttachment.url} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                      <View className="w-10 h-10 rounded-lg bg-slate-800 items-center justify-center">
                          <Film size={16} className="text-white" />
                      </View>
                  )}
                  <View>
                      <Text className="text-xs font-bold truncate max-w-[150px]">{pendingAttachment.fileName}</Text>
                      <Text className="text-xs text-slate-400">
                          {(pendingAttachment.fileSize! / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                  </View>
               </Row>
               <TouchableOpacity onPress={() => setPendingAttachment(null)} className="p-1.5 bg-slate-700 rounded-full">
                   <X size={14} className="text-white" />
               </TouchableOpacity>
            </View>
        )}

        <Row className={`items-center p-1 rounded-full border ${isEphemeral ? 'bg-slate-800 border-slate-600' : 'bg-surface border-white/10'}`}>
          {/* Attach Button */}
          <View className="relative">
              <TouchableOpacity 
                onPress={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2.5"
              >
                <Plus size={20} className={`text-slate-400 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
              </TouchableOpacity>
              
              {/* Hidden File Input */}
              <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept="image/*,video/*" 
                 onChange={handleFileSelect} 
              />

              {/* Attachment Menu */}
              {showAttachMenu && (
                 <View className="absolute bottom-12 left-0 bg-surface border border-white/10 rounded-xl p-2 shadow-2xl min-w-[160px] z-20">
                    <TouchableOpacity 
                      onPress={() => handleAttachClick('photos')}
                      className="w-full flex-row items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg"
                    >
                       <ImageIcon size={18} className="text-indigo-400" /> 
                       <Text className="text-sm">Photo & Video</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleAttachClick('camera')}
                      className="w-full flex-row items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg"
                    >
                       <Camera size={18} className="text-blue-400" /> 
                       <Text className="text-sm">Camera</Text>
                    </TouchableOpacity>
                 </View>
              )}
          </View>

          <TextInput 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEphemeral ? "Send disappearing message..." : isGroup ? "Message group..." : "Type a message..."}
            className="flex-1 bg-transparent border-none px-2 py-2.5 text-sm text-white placeholder:text-slate-500"
          />
          
          <TouchableOpacity 
             onPress={handleSend} 
             disabled={!input.trim() && !pendingAttachment}
             className={`p-2.5 rounded-full items-center justify-center ${isEphemeral ? 'bg-slate-600' : 'bg-primary'}`}
          >
            <Send size={16} className="text-white" />
          </TouchableOpacity>
        </Row>
        <View className="items-center mt-2">
           <Row className="items-center justify-center gap-1">
              <ShieldCheck size={10} className="text-slate-600" /> 
              <Text className="text-[10px] text-slate-600">End-to-end encrypted</Text>
           </Row>
        </View>
      </View>

      {/* --- Overlays --- */}

      {/* Chat Details / Group Info */}
      {showDetails && (
         <div className="absolute inset-0 z-50 bg-background flex flex-col animate-in slide-in-from-right duration-200">
            <View className="px-4 py-3 border-b border-white/5 flex-row items-center gap-3">
               <TouchableOpacity onPress={() => setShowDetails(false)} className="p-1.5 -ml-2 rounded-full hover:bg-white/10">
                  <ChevronLeft size={24} className="text-white" />
               </TouchableOpacity>
               <Text className="font-bold text-lg">{isGroup ? 'Group Info' : 'Contact Info'}</Text>
            </View>
            
            <ScrollView className="flex-1 p-5">
               <View className="items-center mb-6">
                  <View className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center mb-3 shadow-lg">
                     <Text className="text-4xl font-bold text-white">{isGroup ? targetInfo.icon : targetInfo.name[0]}</Text>
                  </View>
                  <Text className="text-2xl font-bold mb-1">{targetInfo.name}</Text>
                  <Text className="text-slate-400">{targetInfo.subtext}</Text>
               </View>

               <View className="space-y-2">
                  <Text className="text-xs font-bold text-slate-500 uppercase ml-1">Actions</Text>
                  <View className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                     {!isGroup && (
                        <TouchableOpacity className="flex-row items-center gap-3 p-4 border-b border-white/5">
                           <Shield size={20} className="text-emerald-400" />
                           <View>
                              <Text className="font-medium text-sm">Verify Security Number</Text>
                              <Text className="text-xs text-slate-500">Ensure end-to-end encryption</Text>
                           </View>
                        </TouchableOpacity>
                     )}
                     <TouchableOpacity className="flex-row items-center gap-3 p-4 border-b border-white/5">
                        <Ghost size={20} className="text-slate-400" />
                        <View className="flex-1">
                           <Text className="font-medium text-sm">Disappearing Messages</Text>
                           <Text className="text-xs text-slate-500">{isEphemeral ? 'On' : 'Off'}</Text>
                        </View>
                     </TouchableOpacity>
                     <TouchableOpacity className="flex-row items-center gap-3 p-4 hover:bg-red-500/10">
                         <UserMinus size={20} className="text-red-400" />
                         <Text className="font-medium text-sm text-red-400">{isGroup ? 'Leave Group' : 'Block User'}</Text>
                     </TouchableOpacity>
                  </View>
               </View>

               {isGroup && (
                  <View className="space-y-2 mt-6">
                     <Row className="justify-between items-center px-1">
                        <Text className="text-xs font-bold text-slate-500 uppercase">Members</Text>
                        <TouchableOpacity className="flex-row items-center gap-1">
                           <UserPlus size={12} className="text-primary" />
                           <Text className="text-xs font-bold text-primary">Add</Text>
                        </TouchableOpacity>
                     </Row>
                     <View className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                        {groupMembers.map((member, idx) => (
                           <View key={member.id} className={`flex-row items-center justify-between p-3 ${idx !== groupMembers.length - 1 ? 'border-b border-white/5' : ''}`}>
                              <Row className="items-center gap-3">
                                 <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center">
                                    <Text className="font-bold text-xs">{member.name[0]}</Text>
                                 </View>
                                 <Text className="font-medium text-sm">{member.name} {member.id === currentUser.id && '(You)'}</Text>
                              </Row>
                              <Text className="text-xs text-slate-500">{member.id === currentUser.id ? 'Admin' : ''}</Text>
                           </View>
                        ))}
                     </View>
                  </View>
               )}
            </ScrollView>
         </div>
      )}

      {/* Call Overlay */}
      {callState !== 'idle' && (
         <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center pt-20 pb-10">
             {/* Background Blur Effect */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
             
             <View className="items-center flex-1 justify-center z-10">
                 <View className="w-32 h-32 rounded-full border-4 border-white/10 items-center justify-center mb-6 relative">
                     {/* Pulse Animation */}
                     {callState === 'calling' && (
                         <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping" />
                     )}
                     <View className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center overflow-hidden">
                         {targetInfo.icon ? (
                             <Text className="text-4xl">{targetInfo.icon}</Text>
                         ) : (
                             <Text className="text-4xl font-bold text-white">{targetInfo.name[0]}</Text>
                         )}
                     </View>
                 </View>
                 
                 <Text className="text-3xl font-bold text-white mb-2">{targetInfo.name}</Text>
                 <Text className="text-slate-400 animate-pulse">
                     {callState === 'calling' ? 'Calling...' : callState === 'connected' ? (isVideoCall ? 'Video Connected' : 'Audio Connected') : 'Ending...'}
                 </Text>
                 
                 {callState === 'connected' && (
                     <Text className="text-slate-500 mt-2 font-mono">00:24</Text>
                 )}
             </View>

             {/* Controls */}
             <Row className="gap-6 z-10 items-center">
                 <TouchableOpacity 
                   onPress={() => setIsMuted(!isMuted)}
                   className={`p-4 rounded-full ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                 >
                     {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   onPress={endCall}
                   className="p-6 rounded-full bg-red-500 shadow-lg shadow-red-500/30 transform transition-transform active:scale-90"
                 >
                     <PhoneOff size={32} className="text-white" />
                 </TouchableOpacity>

                 {isVideoCall && (
                     <TouchableOpacity className="p-4 rounded-full bg-white/10 text-white">
                         <Video size={24} />
                     </TouchableOpacity>
                 )}
             </Row>

             <View className="mt-8 z-10">
                 <Row className="items-center gap-2 px-4 py-2 bg-emerald-900/30 rounded-full border border-emerald-500/20">
                     <Lock size={12} className="text-emerald-400" />
                     <Text className="text-emerald-400 text-xs font-bold">End-to-End Encrypted</Text>
                 </Row>
             </View>
         </div>
      )}
    </View>
  );
};
