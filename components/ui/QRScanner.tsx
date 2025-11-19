
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from '../native';
import { X, Scan, Zap } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  label?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, label = "Align QR code within frame" }) => {
  const [progress, setProgress] = useState(0);
  const [hasPerm, setHasPerm] = useState(false);

  // Simulate camera loading
  useEffect(() => {
    const timer = setTimeout(() => setHasPerm(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Simulate scan success
  useEffect(() => {
    if (hasPerm) {
      const interval = setInterval(() => {
         setProgress(prev => {
             if (prev >= 100) {
                 clearInterval(interval);
                 // Simulate result
                 onScan("0x71C7656EC7ab88b098defB751B7401B5f6d89A23"); 
                 return 100;
             }
             return prev + 2; // 1.5 seconds to 100% approx
         });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [hasPerm]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-20 backdrop-blur-sm">
          <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-white/10">
             <X size={24} className="text-white" />
          </TouchableOpacity>
          <Text className="font-bold text-white">Scanner</Text>
          <TouchableOpacity className="p-2 rounded-full">
             <Zap size={24} className="text-white" />
          </TouchableOpacity>
       </div>

       {/* Camera View */}
       <div className="flex-1 relative bg-slate-900 overflow-hidden flex items-center justify-center">
          {!hasPerm ? (
             <Text className="text-slate-400">Initializing Camera...</Text>
          ) : (
             <>
               {/* Fake Camera Feed Background */}
               <div className="absolute inset-0 opacity-30 bg-[linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%,#111),linear-gradient(45deg,#111_25%,transparent_25%,transparent_75%,#111_75%,#111)] bg-[size:20px_20px]" />
               
               {/* Scanner Frame */}
               <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                   {/* Corner Accents */}
                   <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                   <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                   <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                   <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
                   
                   {/* Laser */}
                   <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent to-emerald-500/40 border-b-2 border-emerald-400 animate-[scan_2s_infinite_linear]" />
               </div>

               <Text className="absolute bottom-32 text-white font-medium bg-black/60 px-4 py-2 rounded-full backdrop-blur-md">
                  {label}
               </Text>
             </>
          )}
       </div>

       {/* Styles for scan animation */}
       <style>{`
         @keyframes scan {
           0% { transform: translateY(-100%); }
           100% { transform: translateY(200%); }
         }
       `}</style>
    </div>
  );
};
