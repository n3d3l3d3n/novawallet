
import React, { useState, useEffect } from 'react';
import { ViewState, Asset, Transaction, User, NFT, BankingCard, CallSession, P2POffer } from './types';
import { SafeAreaView, StatusBar, View } from './components/native';
import { Navigation } from './components/Navigation';
import { Home } from './views/Home';
import { Market } from './views/Market';
import { Advisor } from './views/Advisor';
import { Wallet } from './views/Wallet';
import { Welcome } from './views/Welcome';
import { Login } from './views/Login';
import { Signup } from './views/Signup';
import { Profile } from './views/Profile';
import { Settings } from './views/Settings';
import { Affiliate } from './views/Affiliate';
import { News } from './views/News';
import { Messages } from './views/Messages';
import { Chat } from './views/Chat';
import { Security } from './views/Security';
import { Devices } from './views/Devices';
import { Backup } from './views/Backup';
import { Legal } from './views/Legal';
import { Notifications } from './views/Notifications';
import { Support } from './views/Support';
import { AssetDetails } from './views/AssetDetails';
import { NFTDetails } from './views/NFTDetails';
import { Transfer } from './views/Transfer';
import { CardDetails } from './views/CardDetails';
import { P2P } from './views/P2P';
import { P2POrder } from './views/P2POrder';
import { BuyCrypto } from './views/BuyCrypto';
import { PinLock } from './components/ui/PinLock';
import { GlobalSearch } from './components/ui/GlobalSearch';
import { CallInterface } from './components/ui/CallInterface';
import { authService } from './services/authService';
import { cryptoService } from './services/cryptoService';
import { chainService } from './services/chainService';
import { supabase } from './services/supabaseClient';

// Advanced modules paused: Swap, Earn, Governance, DarkBrowser, CreatorStudio, ConnectedApps

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WELCOME);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rawMarketData, setRawMarketData] = useState<Asset[]>([]);
  const [userHoldings, setUserHoldings] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [totalBalance, setTotalBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatIsGroup, setActiveChatIsGroup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [selectedCard, setSelectedCard] = useState<BankingCard | null>(null);
  const [selectedP2POffer, setSelectedP2POffer] = useState<P2POffer | null>(null);
  
  // Security State
  const [isLocked, setIsLocked] = useState(false);
  
  // AI Context State
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

  // Global Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Call State
  const [callSession, setCallSession] = useState<CallSession | null>(null);

  // Merge Market Data with User Holdings
  const updateAssets = (marketData: Asset[], holdings: Record<string, number>) => {
      const mergedAssets = marketData.map(asset => ({
          ...asset,
          balance: holdings[asset.symbol] || 0
      }));

      // Sort: User assets first, then by market cap
      mergedAssets.sort((a, b) => {
          const balanceA = a.balance * a.price;
          const balanceB = b.balance * b.price;
          return balanceB - balanceA;
      });

      setAssets(mergedAssets);
  };

  // Load Live Crypto Data AND Real On-Chain Balances
  const loadData = async () => {
      setIsRefreshing(true);
      
      // 1. Fetch Market Data (Prices)
      const liveAssets = await cryptoService.getMarketData();
      setRawMarketData(liveAssets);

      // 2. Fetch On-Chain Balances
      try {
         const realBalances = await chainService.fetchAllBalances();
         // Merge local persisted holdings with chain data (for demo consistency)
         const mergedBalances = { ...realBalances, ...userHoldings };
         setUserHoldings(mergedBalances);
         updateAssets(liveAssets, mergedBalances);
      } catch (e) {
         console.error("Failed to fetch chain balances", e);
         // Fallback to what we have
         updateAssets(liveAssets, userHoldings);
      }
      
      // 3. Fetch Transactions
      const txs = await chainService.getTransactions();
      setTransactions(txs);

      setIsRefreshing(false);
  };

  useEffect(() => {
    // Initialize Chain Service (Load from LocalStorage if present)
    chainService.init();
    
    loadData();
    const interval = setInterval(loadData, 60000);

    // Auth Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const profile = await authService._ensureUserProfile(session.user.id, session.user.email || '');
            setCurrentUser(profile);
            // Lock app if settings enabled
            if (profile.settings.biometricsEnabled) setIsLocked(true);
            
            if ([ViewState.WELCOME, ViewState.LOGIN, ViewState.SIGNUP].includes(currentView)) {
                setCurrentView(ViewState.HOME);
            }
        } else {
            setCurrentUser(null);
            setIsLocked(false);
            setCurrentView(ViewState.WELCOME);
        }
        setIsInitialized(true);
    });

    authService.getCurrentUser().then(user => {
        if (user) {
            setCurrentUser(user);
            if (user.settings.biometricsEnabled) setIsLocked(true);
            setCurrentView(ViewState.HOME);
        }
        setIsInitialized(true);
    });

    return () => {
        clearInterval(interval);
        subscription.unsubscribe();
    };
  }, []);

  // Recalculate total when assets change
  useEffect(() => {
    const total = assets.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
    setTotalBalance(total);
  }, [assets]);

  // Simulate Incoming Call Trigger from Advisor
  useEffect(() => {
      if (currentView === ViewState.ADVISOR && aiPrompt && aiPrompt.toLowerCase().includes('call me')) {
          // Trigger fake incoming call
          setTimeout(() => {
              setCallSession({
                  id: 'call_' + Date.now(),
                  partnerId: 'advisor_ai',
                  partnerName: 'Nova Advisor',
                  isVideo: true,
                  status: 'incoming'
              });
          }, 3000);
      }
  }, [currentView, aiPrompt]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView(ViewState.HOME);
    if (user.settings.biometricsEnabled) setIsLocked(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setCurrentView(ViewState.WELCOME);
  };

  const handleChatSelect = (id: string, isGroup: boolean) => {
    setActiveChatId(id);
    setActiveChatIsGroup(isGroup);
    setCurrentView(ViewState.CHAT);
  };

  const handleAssetSelect = (assetId: string) => {
      setSelectedAssetId(assetId);
      setCurrentView(ViewState.ASSET_DETAILS);
  };
  
  const handleNavigate = (view: ViewState, params?: any) => {
      if (view === ViewState.NFT_DETAILS && params?.nft) {
          setSelectedNFT(params.nft);
      }
      if (view === ViewState.CARD_DETAILS && params?.card) {
          setSelectedCard(params.card);
      }
      if (view === ViewState.P2P_ORDER && params?.offer) {
          setSelectedP2POffer(params.offer);
      }
      setCurrentView(view);
  };

  const handleAskAI = (prompt: string) => {
      setAiPrompt(prompt);
      setCurrentView(ViewState.ADVISOR);
  };

  const handleTransaction = (type: 'send' | 'receive' | 'buy', amount: number, symbol: string) => {
      // 1. Optimistic Asset Update
      const newHoldings = { ...userHoldings };
      const currentBalance = newHoldings[symbol] || 0;

      if (type === 'send') {
          if (currentBalance < amount) {
             alert('Insufficient Funds');
             return;
          }
          newHoldings[symbol] = currentBalance - amount;
      } else { // Receive or Buy
          newHoldings[symbol] = currentBalance + amount;
      }

      setUserHoldings(newHoldings);
      updateAssets(rawMarketData, newHoldings);

      // 2. Create & Persist Transaction
      const assetPrice = rawMarketData.find(a => a.symbol === symbol)?.price || 0;
      const newTx: Transaction = {
          id: 'tx_' + Date.now(),
          type: type as any,
          assetSymbol: symbol,
          amount: amount,
          valueUsd: amount * assetPrice,
          date: new Date().toLocaleString(),
          status: 'completed'
      };

      chainService.saveTransaction(newTx); // Persist to local storage
      setTransactions(prev => [newTx, ...prev]); // Update UI state

      if (type !== 'receive' && type !== 'buy') setCurrentView(ViewState.WALLET);
  };

  // Dedicated handler for Marketplace Purchases (Simulated)
  const handleMarketPurchase = (amount: number, symbol: string, sellerId: string) => {
     handleTransaction('send', amount, symbol);
  };
  
  const handleFaucet = () => {
      // Inject 5 ETH
      handleTransaction('receive', 5.0, 'ETH');
      alert('Received 5.0 ETH from Testnet Faucet!');
  };

  // Call Handlers
  const startCall = (video: boolean) => {
     if (activeChatId) {
         // Find partner name
         let partnerName = 'Contact';
         if (activeChatIsGroup) {
             const grp = authService.getGroupDetails(activeChatId);
             partnerName = grp?.name || 'Group';
         } else {
             const friend = authService.getFriends(currentUser?.friends || []).find(f => f.id === activeChatId);
             partnerName = friend?.name || 'Friend';
         }

         setCallSession({
             id: 'call_' + Date.now(),
             partnerId: activeChatId,
             partnerName: partnerName,
             isVideo: video,
             status: 'active', // Start directly as active for outgoing
             startTime: Date.now()
         });
     }
  };

  if (!isInitialized) return <div className="flex-1 bg-black flex items-center justify-center text-white">Loading...</div>;

  const renderContent = () => {
    switch (currentView) {
      // --- Auth ---
      case ViewState.WELCOME: return <Welcome onNavigate={setCurrentView} />;
      case ViewState.LOGIN: return <Login onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;
      case ViewState.SIGNUP: return <Signup onNavigate={setCurrentView} onSignupSuccess={handleLoginSuccess} />;
      
      // --- Core Features ---
      case ViewState.HOME: 
         return <Home 
            assets={assets.filter(a => a.balance > 0)} 
            totalBalance={totalBalance} 
            user={currentUser} 
            onLogout={handleLogout} 
            isRefreshing={isRefreshing} 
            onRefresh={loadData}
            onAssetClick={handleAssetSelect}
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
            onFaucet={handleFaucet}
         />;
      
      case ViewState.MARKET: return <Market assets={assets} />;
      
      case ViewState.ADVISOR: 
          return <Advisor 
              assets={assets.filter(a => a.balance > 0)} 
              user={currentUser}
              initialPrompt={aiPrompt}
              onNavigate={setCurrentView}
          />;
      
      case ViewState.WALLET: return <Wallet transactions={transactions} assets={assets} onNavigate={handleNavigate} />;
      
      // --- Details & Actions ---
      case ViewState.ASSET_DETAILS: 
         return selectedAssetId 
            ? <AssetDetails 
                asset={assets.find(a => a.id === selectedAssetId) || assets[0]} 
                onBack={() => setCurrentView(ViewState.HOME)}
                onSend={() => setCurrentView(ViewState.SEND)}
                onReceive={() => setCurrentView(ViewState.RECEIVE)}
                onBuy={() => setCurrentView(ViewState.BUY)} 
                onAskAI={handleAskAI}
                transactions={transactions.filter(t => t.assetSymbol === (assets.find(a => a.id === selectedAssetId)?.symbol))}
              /> 
            : null;

      case ViewState.NFT_DETAILS:
          return selectedNFT 
            ? <NFTDetails 
                nft={selectedNFT}
                onBack={() => setCurrentView(ViewState.HOME)}
                onSend={() => alert('Send NFT Feature (Coming Soon)')}
              />
            : null;

      case ViewState.SEND:
         return <Transfer 
             type="send" 
             assets={assets.filter(a => a.balance > 0)} 
             onBack={() => setCurrentView(ViewState.HOME)}
             onSuccess={handleTransaction}
             preSelectedAssetId={selectedAssetId}
         />;

      case ViewState.RECEIVE:
         return <Transfer 
             type="receive" 
             assets={assets} 
             onBack={() => setCurrentView(ViewState.HOME)}
             onSuccess={handleTransaction}
             preSelectedAssetId={selectedAssetId}
         />;
      
      case ViewState.BUY:
         return <BuyCrypto 
             assets={assets}
             preSelectedAssetId={selectedAssetId}
             onBack={() => setCurrentView(ViewState.HOME)}
             onSuccess={handleTransaction}
         />;

      case ViewState.CARD_DETAILS:
          return selectedCard ? (
              <CardDetails 
                  card={selectedCard} 
                  assets={assets.filter(a => a.balance > 0)}
                  onBack={() => setCurrentView(ViewState.WALLET)}
                  onUpdateCard={(updated) => {
                      setSelectedCard(updated);
                  }}
              />
          ) : null;
      
      // --- Social & Marketplace ---
      case ViewState.MESSAGES: 
        return currentUser 
          ? <Messages 
              user={currentUser} 
              onNavigate={setCurrentView} 
              onSelectChat={handleChatSelect} 
              assets={assets.filter(a => a.balance > 0)} 
              onTransaction={handleTransaction} 
              onMarketPurchase={handleMarketPurchase}
            /> 
          : null;
          
      case ViewState.CHAT: 
        return currentUser && activeChatId 
          ? <Chat 
              currentUser={currentUser} 
              targetId={activeChatId} 
              isGroup={activeChatIsGroup} 
              onBack={() => setCurrentView(ViewState.MESSAGES)}
              assets={assets.filter(a => a.balance > 0)}
              onSendTransaction={(amount, symbol) => handleTransaction('send', amount, symbol)}
              onStartCall={startCall}
            /> 
          : null;
      
      case ViewState.P2P_MARKET:
          return <P2P onNavigate={handleNavigate} />;
      
      case ViewState.P2P_ORDER:
          return selectedP2POffer ? (
              <P2POrder offer={selectedP2POffer} onNavigate={setCurrentView} />
          ) : null;

      // --- Profile & Settings ---
      case ViewState.PROFILE: return currentUser ? <Profile user={currentUser} onNavigate={setCurrentView} onLogout={handleLogout} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.SETTINGS: return currentUser ? <Settings user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.AFFILIATE: return currentUser ? <Affiliate user={currentUser} onNavigate={setCurrentView} /> : null;
      case ViewState.NEWS: return <News onNavigate={setCurrentView} />;
      case ViewState.SECURITY: return currentUser ? <Security user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.DEVICES: return <Devices onNavigate={setCurrentView} />;
      case ViewState.BACKUP: return currentUser ? <Backup user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.LEGAL: return currentUser ? <Legal user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.NOTIFICATIONS: return <Notifications onNavigate={setCurrentView} />;
      case ViewState.SUPPORT: return <Support onNavigate={setCurrentView} />;
      
      // Default Fallback
      default: return <Home assets={assets} totalBalance={totalBalance} user={currentUser} onLogout={handleLogout} />;
    }
  };

  return (
    <SafeAreaView className="bg-slate-950 flex items-center justify-center h-full w-full">
      <StatusBar barStyle="light-content" />
      
      {/* Overlays */}
      <PinLock isLocked={isLocked} onUnlock={() => setIsLocked(false)} />
      
      <GlobalSearch 
         isOpen={isSearchOpen} 
         onClose={() => setIsSearchOpen(false)} 
         onNavigate={handleNavigate} 
      />
      
      {callSession && callSession.status !== 'ended' && (
         <CallInterface 
             session={callSession} 
             onAccept={() => setCallSession({...callSession, status: 'active', startTime: Date.now()})}
             onDecline={() => setCallSession(null)}
             onEnd={() => setCallSession(null)}
             onMinimize={() => setCallSession({...callSession, status: 'minimized'})}
             onMaximize={() => setCallSession({...callSession, status: 'active'})}
             onMuteToggle={() => {}}
             onVideoToggle={(v) => setCallSession({...callSession, isVideo: v})}
         />
      )}

      {/* 
        RESPONSIVE APP CONTAINER 
        - Mobile: Full width/height
        - Tablet/Desktop: Centered card with shadow and border
      */}
      <View className="flex-1 relative w-full h-full md:h-[90vh] md:max-w-md lg:max-w-5xl md:rounded-[40px] md:border-[8px] md:border-slate-800 bg-background overflow-hidden shadow-2xl shadow-black mx-auto transition-all duration-300">
        
        {/* Tablet Notch Simulation (Visual flair for desktop) */}
        <View className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-[60] pointer-events-none" />

        {/* Main Content Area with Global Transition */}
        <View className="flex-1 h-full relative bg-black" key={currentView}>
             <View className="flex-1 h-full animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-forwards">
                 {renderContent()}
             </View>
        </View>

        {currentUser && 
         ![
            ViewState.WELCOME, 
            ViewState.LOGIN, 
            ViewState.SIGNUP, 
            ViewState.ASSET_DETAILS, 
            ViewState.NFT_DETAILS, 
            ViewState.SEND, 
            ViewState.RECEIVE, 
            ViewState.BUY, 
            ViewState.CHAT, 
            ViewState.CARD_DETAILS, 
            ViewState.P2P_ORDER
          ].includes(currentView) && (
           <Navigation currentView={currentView} onNavigate={setCurrentView} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default App;
