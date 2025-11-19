
import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, Lock, Globe, RefreshCw, ChevronLeft, ChevronRight, EyeOff, Radio, ExternalLink } from 'lucide-react';

export const DarkBrowser: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [url, setUrl] = useState('https://duckduckgo.com');
  const [isLoading, setIsLoading] = useState(false);
  const [showOnionInfo, setShowOnionInfo] = useState(false);

  // Simulated connection sequence
  useEffect(() => {
    if (!isConnected) {
      const sequence = [
        { msg: 'Establishing encrypted tunnel...', delay: 500 },
        { msg: 'Loading relay descriptors...', delay: 1200 },
        { msg: 'Connecting to Guard Node (France)...', delay: 2000 },
        { msg: 'Routing via Middle Node (Germany)...', delay: 2800 },
        { msg: 'Exiting via Exit Node (Switzerland)...', delay: 3500 },
        { msg: 'Circuit established.', delay: 4000 },
      ];

      let timeouts: NodeJS.Timeout[] = [];

      sequence.forEach(({ msg, delay }) => {
        const timeout = setTimeout(() => {
          setBootLogs(prev => [...prev, msg]);
        }, delay);
        timeouts.push(timeout);
      });

      const finalTimeout = setTimeout(() => {
        setIsConnected(true);
      }, 4500);
      timeouts.push(finalTimeout);

      return () => timeouts.forEach(clearTimeout);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  if (!isConnected) {
    return (
      <div className="h-full p-6 flex flex-col items-center justify-center bg-black font-mono animate-in fade-in duration-700">
        <div className="mb-8 relative">
          <div className="w-24 h-24 border-4 border-emerald-500/30 rounded-full animate-ping absolute top-0 left-0" />
          <div className="w-24 h-24 border-4 border-emerald-500/50 rounded-full flex items-center justify-center bg-black z-10 relative">
             <Globe size={48} className="text-emerald-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-emerald-500 mb-6 tracking-wider">NOVA ONION ROUTING</h2>
        
        <div className="w-full max-w-xs bg-slate-900 border border-emerald-500/20 rounded-lg p-4 font-mono text-xs h-48 overflow-y-auto space-y-2 shadow-lg shadow-emerald-500/10">
          {bootLogs.map((log, i) => (
            <div key={i} className="flex gap-2 text-emerald-400/80">
              <span className="opacity-50">{`>`}</span>
              <span>{log}</span>
            </div>
          ))}
          <div className="w-2 h-4 bg-emerald-500 animate-pulse" />
        </div>
        
        <p className="mt-8 text-slate-500 text-xs text-center max-w-xs">
          Connecting to the decentralized network. Your IP address is being masked.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 pb-20">
      {/* Address Bar */}
      <div className="p-3 bg-slate-800 border-b border-white/5 shadow-xl z-10">
        <form onSubmit={handleSearch} className="flex gap-2 items-center">
           <div className="flex items-center gap-2 text-slate-400">
             <button type="button"><ChevronLeft size={20} /></button>
             <button type="button"><ChevronRight size={20} /></button>
           </div>
           
           <div className="flex-1 relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <Lock size={12} className="text-emerald-500" />
             </div>
             <input 
               type="text" 
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               className="w-full bg-black/40 border border-emerald-500/20 rounded-lg py-2 pl-8 pr-8 text-sm text-emerald-100 font-mono focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-600"
             />
             {url.includes('.onion') && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             )}
           </div>

           <button type="button" onClick={() => setIsLoading(true)} className="p-2 text-slate-400 hover:text-white">
             <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
           </button>
        </form>
      </div>

      {/* Browser Content Area (Mocked) */}
      <div className="flex-1 bg-white overflow-hidden relative">
        {/* Tor Circuit Visualizer Overlay */}
        <div className="absolute top-0 left-0 w-full bg-slate-800 text-white text-[10px] py-1 px-3 flex justify-between items-center z-10 border-b border-white/10">
           <div className="flex items-center gap-2">
             <span className="flex items-center gap-1 text-emerald-400"><Radio size={10} /> Circuit #8492</span>
             <span className="text-slate-500">|</span>
             <span className="text-slate-400">Guard (FR) → Middle (DE) → Exit (CH)</span>
           </div>
           <button onClick={() => setShowOnionInfo(!showOnionInfo)} className="bg-emerald-500/10 text-emerald-400 px-2 rounded hover:bg-emerald-500/20">
             New Identity
           </button>
        </div>

        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-emerald-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-mono text-sm">Relaying request...</p>
          </div>
        ) : (
          <div className="w-full h-full pt-8 overflow-y-auto">
            {/* Mock Content - DuckDuckGo Style */}
            {url.includes('duckduckgo') ? (
               <div className="flex flex-col items-center pt-20 px-6">
                  <img src="https://duckduckgo.com/assets/logo_header.v109.svg" alt="Logo" className="h-12 mb-6 opacity-80" />
                  <div className="w-full max-w-md space-y-4">
                     <div className="flex gap-2 items-center border rounded-lg px-4 py-3 shadow-sm">
                        <Search className="text-slate-400" size={18} />
                        <input type="text" placeholder="Search without being tracked" className="w-full outline-none text-sm" />
                     </div>
                     <p className="text-center text-xs text-slate-500">
                       Your traffic is routed through the Tor network.
                       <br />IP Address: <span className="text-emerald-600 font-mono">192.168.X.X (Hidden)</span>
                     </p>
                  </div>
                  
                  <div className="mt-12 grid grid-cols-1 gap-4 w-full max-w-md">
                     <div className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer group">
                        <h3 className="text-blue-700 font-medium text-sm group-hover:underline">Hidden Wiki - The Onion Router</h3>
                        <p className="text-green-700 text-xs truncate">http://zqktlwi4fecvo6ri.onion/wiki/index.php/Main_Page</p>
                        <p className="text-slate-500 text-xs mt-1">Directory of .onion sites.</p>
                     </div>
                     <div className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer group">
                        <h3 className="text-blue-700 font-medium text-sm group-hover:underline">Nova Secure Swap</h3>
                        <p className="text-green-700 text-xs truncate">http://novaswap72498.onion</p>
                        <p className="text-slate-500 text-xs mt-1">Anonymous crypto swapping protocol.</p>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="p-8 text-center">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeOff size={32} className="text-slate-400" />
                 </div>
                 <h2 className="text-lg font-bold text-slate-800">Simulated View</h2>
                 <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                    This is a UI demonstration of a Tor-enabled browser integration. 
                    Real Tor routing requires native modules not available in this web preview.
                 </p>
                 <button 
                   onClick={() => setUrl('https://duckduckgo.com')}
                   className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/30"
                 >
                   Return to Safety
                 </button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Security Banner */}
      <div className="bg-emerald-900/20 border-t border-emerald-500/20 p-2 flex justify-center gap-4 text-[10px] font-medium text-emerald-500/80 uppercase tracking-widest">
         <span className="flex items-center gap-1"><Shield size={10} /> JavaScript Disabled</span>
         <span className="flex items-center gap-1"><Globe size={10} /> No Tracking</span>
      </div>
    </div>
  );
};
