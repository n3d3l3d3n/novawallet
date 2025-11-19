
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Row } from '../native';
import { VirtualNumPad } from './VirtualNumPad';
import { ShieldCheck, Lock, Unlock, ScanFace, Fingerprint } from 'lucide-react';

interface PinLockProps {
  isLocked: boolean;
  onUnlock: () => void;
  biometricType?: 'face' | 'touch';
}

export const PinLock: React.FC<PinLockProps> = ({ isLocked, onUnlock, biometricType = 'face' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Simulate Biometric Scan on Mount
  useEffect(() => {
    if (isLocked) {
      setIsScanning(true);
      const timer = setTimeout(() => {
        // Auto-unlock simulation (Success)
        setIsScanning(false);
        onUnlock(); 
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setPin('');
    }
  }, [isLocked]);

  const handlePress = (key: string) => {
    if (pin.length < 4) {
      const newPin = pin + key;
      setPin(newPin);
      if (newPin.length === 4) {
         // Check PIN (Mock: 1234)
         if (newPin === '1234') {
            setTimeout(() => {
                setPin('');
                onUnlock();
            }, 200);
         } else {
            setError(true);
            setTimeout(() => {
                setPin('');
                setError(false);
            }, 500);
         }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-300">
       <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-900/20 to-transparent" />
       
       <View className="items-center mb-8 relative z-10">
           {isScanning ? (
             <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent animate-[scan_1.5s_infinite]" />
                <ScanFace size={48} className="text-white opacity-80" />
             </div>
           ) : (
             <div className="w-24 h-24 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                <Lock size={36} className="text-indigo-400" />
             </div>
           )}
           
           <Text className="text-2xl font-bold mt-6 text-white tracking-wide">
              {isScanning ? 'Verifying Identity...' : 'Enter PIN'}
           </Text>
           <Text className="text-slate-400 text-sm mt-1">
              {isScanning ? 'FaceID is scanning...' : 'Secured by Nova Enclave'}
           </Text>
       </View>

       {/* PIN Dots */}
       {!isScanning && (
         <>
            <Row className="gap-6 mb-12">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full border border-white/30 transition-all duration-300 ${
                        pin.length > i ? (error ? 'bg-red-500 border-red-500 scale-110' : 'bg-white border-white scale-110') : 'bg-transparent'
                    }`} 
                  />
                ))}
            </Row>

            <div className="w-full max-w-xs">
                <VirtualNumPad 
                   onPress={handlePress} 
                   onDelete={handleDelete} 
                   className="gap-4"
                />
            </div>
            
            <TouchableOpacity 
               onPress={() => setIsScanning(true)}
               className="mt-8 flex-row items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
            >
               <Fingerprint size={20} className="text-primary" />
               <Text className="text-primary text-sm font-bold">Use Biometrics</Text>
            </TouchableOpacity>
         </>
       )}
       
       {/* Animation Keyframes */}
       <style>{`
         @keyframes scan {
           0% { transform: translateY(-100%); }
           100% { transform: translateY(100%); }
         }
       `}</style>
    </div>
  );
};
