
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, User, Message, Friend, Group, Attachment, AppPermissions } from '../types';
import { authService } from '../services/authService';
import { PermissionModal } from '../components/ui/PermissionModal';
import { ChevronLeft, Send, Lock, Ghost, MoreVertical, ShieldCheck, Users, Plus, Image as ImageIcon, Camera, X, Paperclip, Film, Play } from 'lucide-react';

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
  
  // Attachment States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
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
           // In a real web app, we'd open a camera modal here
           // For this mock, we'll just trigger the file input with 'capture' 
           // but since we can't dynamically change the input prop easily without re-render, 
           // we'll just open the file picker which allows camera on mobile.
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

  if (!targetInfo) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className={`h-full flex flex-col pb-4 ${isEphemeral ? 'bg-slate-900' : ''}`}>
      
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
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isEphemeral ? 'border-slate-700 bg-slate-800/50' : 'border-white/5 bg-background/90'} backdrop-blur-md z-10`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm">
              {isGroup ? targetInfo.icon : targetInfo.name[0]}
            </div>
            <div>
              <h2 className="font-bold text-sm leading-none mb-0.5">{targetInfo.name}</h2>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                 {isGroup ? <Users size={8} /> : <Lock size={8} className="text-emerald-400" />} 
                 {targetInfo.subtext}
              </span>
            </div>
          </div>
        </div>
        
        <button 
           onClick={() => setIsEphemeral(!isEphemeral)}
           className={`p-2 rounded-full transition-all ${isEphemeral ? 'bg-white text-black' : 'bg-white/5 text-slate-400'}`}
           title="Toggle Ephemeral Mode"
        >
           <Ghost size={18} />
        </button>
      </div>

      {/* Ephemeral Banner */}
      {isEphemeral && (
         <div className="bg-slate-800 py-1 text-center">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
               <Ghost size={10} /> Messages will disappear after viewing
            </p>
         </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              {isGroup && !isMe && (
                <div className="flex items-center gap-2 mb-1 ml-1">
                   <div className="w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-[8px] font-bold">
                      {getSenderInitial(msg.senderId)}
                   </div>
                   <span className="text-[10px] text-slate-400">{getSenderName(msg.senderId)}</span>
                </div>
              )}
              
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                isMe 
                  ? isEphemeral ? 'bg-slate-200 text-black rounded-tr-sm' : 'bg-primary text-white rounded-tr-sm'
                  : isEphemeral ? 'bg-slate-700 text-slate-200 rounded-tl-sm' : 'bg-surface border border-white/5 rounded-tl-sm'
              }`}>
                 {/* Attachments */}
                 {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mb-2 overflow-hidden rounded-lg">
                       {msg.attachments[0].type === 'image' ? (
                          <img src={msg.attachments[0].url} alt="attachment" className="w-full h-auto max-h-60 object-cover" />
                       ) : (
                          <div className="relative w-full h-40 bg-black flex items-center justify-center">
                              <video src={msg.attachments[0].url} controls className="w-full h-full object-contain" />
                          </div>
                       )}
                    </div>
                 )}

                 {msg.text && <span>{msg.text}</span>}
                 
                 <div className={`text-[9px] text-right mt-1 ${isMe ? 'opacity-70' : 'text-slate-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isEphemeral && <span className="ml-1">👻</span>}
                 </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pt-2 pb-2">
        {/* Pending Attachment Preview */}
        {pendingAttachment && (
            <div className="mb-2 p-2 bg-surface border border-white/10 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
               <div className="flex items-center gap-3">
                  {pendingAttachment.type === 'image' ? (
                      <img src={pendingAttachment.url} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Film size={16} />
                      </div>
                  )}
                  <div>
                      <p className="text-xs font-bold truncate max-w-[150px]">{pendingAttachment.fileName}</p>
                      <p className="text-[10px] text-slate-400">
                          {(pendingAttachment.fileSize! / (1024 * 1024)).toFixed(2)} MB
                      </p>
                  </div>
               </div>
               <button onClick={() => setPendingAttachment(null)} className="p-1.5 bg-slate-700 rounded-full hover:bg-slate-600">
                   <X size={14} />
               </button>
            </div>
        )}

        <div className={`relative flex items-center p-1 rounded-full border ${isEphemeral ? 'bg-slate-800 border-slate-600' : 'bg-surface border-white/10'}`}>
          {/* Attach Button */}
          <div className="relative">
              <button 
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2.5 text-slate-400 hover:text-white transition-colors"
              >
                <Plus size={20} className={`transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
              </button>
              
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
                 <div className="absolute bottom-12 left-0 bg-surface border border-white/10 rounded-xl p-2 shadow-2xl min-w-[160px] animate-in slide-in-from-bottom-2 z-20">
                    <button 
                      onClick={() => handleAttachClick('photos')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-left"
                    >
                       <ImageIcon size={18} className="text-indigo-400" /> Photo & Video
                    </button>
                    <button 
                      onClick={() => handleAttachClick('camera')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-left"
                    >
                       <Camera size={18} className="text-blue-400" /> Camera
                    </button>
                 </div>
              )}
          </div>

          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isEphemeral ? "Send disappearing message..." : isGroup ? "Message group..." : "Type a message..."}
            className="flex-1 bg-transparent border-none px-2 py-2.5 text-sm focus:outline-none text-white placeholder:text-slate-500"
          />
          
          <button 
             onClick={handleSend} 
             disabled={!input.trim() && !pendingAttachment}
             className={`p-2.5 rounded-full text-white transition-colors ${isEphemeral ? 'bg-slate-600 hover:bg-slate-500' : 'bg-primary hover:bg-indigo-500'}`}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center mt-2">
           <span className="text-[10px] text-slate-600 flex items-center justify-center gap-1">
              <ShieldCheck size={10} /> End-to-end encrypted
           </span>
        </div>
      </div>
    </div>
  );
};
