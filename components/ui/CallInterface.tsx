
import React, { useState, useEffect } from 'react';
import { CallSession } from '../../types';
import { View, Text, TouchableOpacity, Row, Image } from '../native';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Monitor, MessageSquare } from 'lucide-react';

interface CallInterfaceProps {
  session: CallSession;
  onAccept: () => void;
  onDecline: () => void;
  onEnd: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMuteToggle: (muted: boolean) => void;
  onVideoToggle: (video: boolean) => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({ 
  session, 
  onAccept, 
  onDecline, 
  onEnd, 
  onMinimize, 
  onMaximize,
  onMuteToggle,
  onVideoToggle
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(session.isVideo);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session.status === 'active' || session.status === 'minimized') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMute = () => {
     setIsMuted(!isMuted);
     onMuteToggle(!isMuted);
  };

  const handleVideo = () => {
     setIsVideoEnabled(!isVideoEnabled);
     onVideoToggle(!isVideoEnabled);
  };

  // Minimized View (Floating Bubble)
  if (session.status === 'minimized') {
    return (
       <TouchableOpacity 
         onPress={onMaximize}
         className="fixed bottom-24 right-4 z-[100] shadow-2xl animate-in zoom-in duration-300"
       >
          <div className="w-20 h-28 rounded-2xl overflow-hidden relative bg-slate-800 border-2 border-emerald-500/50">
             {/* Video/Avatar Preview */}
             {session.isVideo ? (
                 <div className="absolute inset-0 bg-slate-700">
                     <div className="w-full h-full opacity-60 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                     {/* Mock Video Movement */}
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-8 h-8 bg-indigo-500/30 rounded-full animate-pulse" />
                     </div>
                 </div>
             ) : (
                 <Image source={session.partnerImage || ''} className="w-full h-full object-cover" />
             )}
             
             {/* Overlay Info */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2 items-center">
                 <Text className="text-[10px] font-bold text-emerald-400">{formatTime(duration)}</Text>
                 <Text className="text-[8px] text-white truncate w-full text-center">{session.partnerName}</Text>
             </div>
          </div>
       </TouchableOpacity>
    );
  }

  // Incoming Call View
  if (session.status === 'incoming') {
     return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center pt-20 pb-12">
            {/* Background Pulse */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            
            <View className="items-center z-10 flex-1">
               <View className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/40 mb-6">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 relative">
                      {session.partnerImage ? (
                          <Image source={session.partnerImage} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center">
                              <Text className="text-4xl font-bold">{session.partnerName[0]}</Text>
                          </div>
                      )}
                  </div>
               </View>
               <Text className="text-3xl font-bold text-white mb-2">{session.partnerName}</Text>
               <Text className="text-indigo-300 animate-pulse">Incoming {session.isVideo ? 'Video ' : ''}Call...</Text>
            </View>

            <Row className="w-full px-12 justify-between items-center z-10">
               <TouchableOpacity onPress={onDecline} className="flex-col items-center gap-2">
                   <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center hover:bg-red-500 transition-colors">
                       <PhoneOff size={28} className="text-white" />
                   </div>
                   <Text className="text-sm text-slate-400">Decline</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={onAccept} className="flex-col items-center gap-2">
                   <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-bounce">
                       <Phone size={32} className="text-white fill-white" />
                   </div>
                   <Text className="text-sm text-white font-bold">Accept</Text>
               </TouchableOpacity>
            </Row>
        </div>
     );
  }

  // Active Call View
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
       {/* Main Video Feed */}
       <div className="flex-1 relative bg-black overflow-hidden">
           {/* Fake Partner Video */}
           <div className="absolute inset-0">
               {isVideoEnabled ? (
                   <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                    <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
                    
                    {/* Simulating partner video stream */}
                    {!session.isVideo ? (
                         <div className="absolute inset-0 flex items-center justify-center">
                             <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10">
                                 <Image source={session.partnerImage || ''} className="w-full h-full object-cover" />
                             </View>
                         </div>
                    ) : (
                        /* Simulated Abstract Video Content */
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-xl animate-[spin_10s_linear_infinite]" />
                         </div>
                    )}
                   </>
               ) : (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                       <View className="items-center">
                           <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 mb-4">
                               <Image source={session.partnerImage || ''} className="w-full h-full object-cover" />
                           </div>
                           <Text className="text-xl font-bold">{session.partnerName}</Text>
                           <Text className="text-slate-400">Camera Off</Text>
                       </View>
                   </div>
               )}
           </div>

           {/* Header */}
           <div className="absolute top-0 left-0 right-0 p-4 pt-12 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
               <TouchableOpacity onPress={onMinimize} className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                   <Maximize2 size={20} className="text-white rotate-180" />
               </TouchableOpacity>
               <View className="items-center">
                   <Text className="text-lg font-bold text-white shadow-md">{session.partnerName}</Text>
                   <Text className="text-xs text-emerald-400 font-mono bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                       {formatTime(duration)}
                   </Text>
               </View>
               <TouchableOpacity className="p-3 bg-white/10 rounded-full backdrop-blur-md">
                   <MessageSquare size={20} className="text-white" />
               </TouchableOpacity>
           </div>

           {/* Self View (PiP) */}
           {isVideoEnabled && (
               <div className="absolute right-4 bottom-32 w-28 h-40 bg-black rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                    <div className="w-full h-full bg-slate-800 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Text className="text-[10px] text-slate-500">You</Text>
                        </div>
                    </div>
               </div>
           )}
       </div>

       {/* Controls */}
       <div className="bg-black pb-8 pt-6 px-8 rounded-t-3xl -mt-6 relative z-10">
           <Row className="justify-between items-center max-w-xs mx-auto">
               <TouchableOpacity 
                  onPress={handleVideo} 
                  className={`p-4 rounded-full transition-colors ${isVideoEnabled ? 'bg-white/10' : 'bg-white text-black'}`}
               >
                  {isVideoEnabled ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-black" />}
               </TouchableOpacity>

               <TouchableOpacity 
                  onPress={handleMute} 
                  className={`p-4 rounded-full transition-colors ${!isMuted ? 'bg-white/10' : 'bg-white text-black'}`}
               >
                  {isMuted ? <MicOff size={24} className="text-black" /> : <Mic size={24} className="text-white" />}
               </TouchableOpacity>

               <TouchableOpacity 
                   onPress={onEnd}
                   className="p-5 rounded-full bg-red-500 shadow-lg shadow-red-500/30 transform active:scale-95 transition-transform"
               >
                   <PhoneOff size={32} className="text-white fill-white" />
               </TouchableOpacity>
           </Row>
       </div>
    </div>
  );
};
