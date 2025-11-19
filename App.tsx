
import React, { useState, useEffect } from 'react';
import { ViewState, Asset, Transaction, User, ConnectedApp, NFT } from './types';
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
import { DarkBrowser } from './views/DarkBrowser';
import { ConnectedApps } from './views/ConnectedApps';
import { ConnectRequest } from './views/ConnectRequest';
import { Security } from './views/Security';
import { Legal } from './views/Legal';
import { Notifications } from './views/Notifications';
import { Support } from './views/Support';
import { AssetDetails } from './views/AssetDetails';
import { NFTDetails } from './views/NFTDetails';
import { Transfer } from './views/Transfer';
import { Swap } from './views/Swap';
import { authService } from './services/authService';
import { cryptoService } from './services/cryptoService';
import { supabase } from './services/supabaseClient';

// Initial state for user portfolio (would be fetched from DB in real app)
const INITIAL_HOLDINGS: Record<string, number> = {
    'BTC': 0.42,
    'ETH': 4.5,
    'SOL': 145.0,
    'USDC': 5430.0,
    'DOGE': 10000,
    'LINK': 50
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'receive', assetSymbol: 'BTC', amount: 0.0042, valueUsd: 269.76, date: 'Today, 10:23 AM', status: 'completed' },
  { id: 't2', type: 'send', assetSymbol: 'ETH', amount: 1.2, valueUsd: 4140.24, date: 'Yesterday, 4:15 PM', status: 'completed' },
  { id: 't3', type: 'swap', assetSymbol: 'SOL', amount: 45, valueUsd: 6700.50, date: 'Oct 24, 9:30 AM', status: 'completed' },
  { id: 't4', type: 'buy', assetSymbol: 'USDC', amount: 500, valueUsd: 500.00, date: 'Oct 22, 2:10 PM', status: 'completed' },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WELCOME);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rawMarketData, setRawMarketData] = useState<Asset[]>([]);
  const [userHoldings, setUserHoldings] = useState<Record<string, number>>(INITIAL_HOLDINGS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  const [totalBalance, setTotalBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatIsGroup, setActiveChatIsGroup] = useState(false);
  const [pendingAppRequest, setPendingAppRequest] = useState<Partial<ConnectedApp> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  
  // AI Context State
  const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

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

  // Load Live Crypto Data
  const loadMarketData = async () => {
      setIsRefreshing(true);
      const liveAssets = await cryptoService.getMarketData();
      setRawMarketData(liveAssets);
      updateAssets(liveAssets, userHoldings);
      setIsRefreshing(false);
  };

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 60000);

    // Auth Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const profile = await authService._ensureUserProfile(session.user.id, session.user.email || '');
            setCurrentUser(profile);
            if ([ViewState.WELCOME, ViewState.LOGIN, ViewState.SIGNUP].includes(currentView)) {
                setCurrentView(ViewState.HOME);
            }
        } else {
            setCurrentUser(null);
            setCurrentView(ViewState.WELCOME);
        }
        setIsInitialized(true);
    });

    authService.getCurrentUser().then(user => {
        if (user) {
            setCurrentUser(user);
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

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView(ViewState.HOME);
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

  const handleSimulateAppRequest = (request: Partial<ConnectedApp>) => {
    setPendingAppRequest(request);
    setCurrentView(ViewState.CONNECT_REQUEST);
  };

  const handleAssetSelect = (assetId: string) => {
      setSelectedAssetId(assetId);
      setCurrentView(ViewState.ASSET_DETAILS);
  };
  
  // Unified navigation handler to catch params
  const handleNavigate = (view: ViewState, params?: any) => {
      if (view === ViewState.NFT_DETAILS && params?.nft) {
          setSelectedNFT(params.nft);
      }
      setCurrentView(view);
  };

  const handleAskAI = (prompt: string) => {
      setAiPrompt(prompt);
      setCurrentView(ViewState.ADVISOR);
  };

  const handleTransaction = (type: 'send' | 'receive', amount: number, symbol: string) => {
      const newHoldings = { ...userHoldings };
      const currentBalance = newHoldings[symbol] || 0;

      if (type === 'send') {
          if (currentBalance < amount) {
             alert('Insufficient Funds');
             return;
          }
          newHoldings[symbol] = currentBalance - amount;
      } else {
          newHoldings[symbol] = currentBalance + amount;
      }

      setUserHoldings(newHoldings);
      updateAssets(rawMarketData, newHoldings);

      const assetPrice = rawMarketData.find(a => a.symbol === symbol)?.price || 0;

      const newTx: Transaction = {
          id: 'tx_' + Date.now(),
          type: type,
          assetSymbol: symbol,
          amount: amount,
          valueUsd: amount * assetPrice,
          date: 'Just now',
          status: 'completed'
      };

      setTransactions(prev => [newTx, ...prev]);
      setCurrentView(ViewState.WALLET);
  };

  const handleSwap = (fromSymbol: string, fromAmount: number, toSymbol: string, toAmount: number) => {
      const newHoldings = { ...userHoldings };
      
      // Deduct From
      if ((newHoldings[fromSymbol] || 0) < fromAmount) {
         alert('Insufficient Balance');
         return;
      }
      newHoldings[fromSymbol] = (newHoldings[fromSymbol] || 0) - fromAmount;
      
      // Add To
      newHoldings[toSymbol] = (newHoldings[toSymbol] || 0) + toAmount;
      
      setUserHoldings(newHoldings);
      updateAssets(rawMarketData, newHoldings);
      
      const fromAssetPrice = rawMarketData.find(a => a.symbol === fromSymbol)?.price || 0;

      const newTx: Transaction = {
          id: 'tx_swap_' + Date.now(),
          type: 'swap',
          assetSymbol: fromSymbol, // Primary asset listed
          amount: fromAmount,
          valueUsd: fromAmount * fromAssetPrice,
          date: 'Just now',
          status: 'completed'
      };
      
      setTransactions(prev => [newTx, ...prev]);
      setCurrentView(ViewState.WALLET);
  };

  if (!isInitialized) return <div className="flex-1 bg-black flex items-center justify-center text-white">Loading...</div>;

  const renderContent = () => {
    switch (currentView) {
      case ViewState.WELCOME: return <Welcome onNavigate={setCurrentView} />;
      case ViewState.LOGIN: return <Login onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;
      case ViewState.SIGNUP: return <Signup onNavigate={setCurrentView} onSignupSuccess={handleLoginSuccess} />;
      
      case ViewState.HOME: 
         return <Home 
            assets={assets.filter(a => a.balance > 0)} 
            totalBalance={totalBalance} 
            user={currentUser} 
            onLogout={handleLogout} 
            isRefreshing={isRefreshing} 
            onRefresh={loadMarketData}
            onAssetClick={handleAssetSelect}
            onNavigate={handleNavigate}
         />;
      
      case ViewState.MARKET: return <Market assets={assets} />;
      
      case ViewState.ADVISOR: 
          return <Advisor 
              assets={assets.filter(a => a.balance > 0)} 
              user={currentUser}
              initialPrompt={aiPrompt}
              onNavigate={setCurrentView}
          />;
      
      case ViewState.WALLET: return <Wallet transactions={transactions} assets={assets} />;
      
      case ViewState.ASSET_DETAILS: 
         return selectedAssetId 
            ? <AssetDetails 
                asset={assets.find(a => a.id === selectedAssetId) || assets[0]} 
                onBack={() => setCurrentView(ViewState.HOME)}
                onSend={() => setCurrentView(ViewState.SEND)}
                onReceive={() => setCurrentView(ViewState.RECEIVE)}
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

      case ViewState.SWAP:
         return <Swap 
            assets={assets} 
            onBack={() => setCurrentView(ViewState.HOME)}
            onSwap={handleSwap}
         />;

      case ViewState.DARK_BROWSER: return <DarkBrowser />;
      case ViewState.MESSAGES: return currentUser ? <Messages user={currentUser} onNavigate={setCurrentView} onSelectChat={handleChatSelect} /> : null;
      case ViewState.CHAT: return currentUser && activeChatId ? <Chat currentUser={currentUser} targetId={activeChatId} isGroup={activeChatIsGroup} onBack={() => setCurrentView(ViewState.MESSAGES)} /> : null;
      case ViewState.PROFILE: return currentUser ? <Profile user={currentUser} onNavigate={setCurrentView} onLogout={handleLogout} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.SETTINGS: return currentUser ? <Settings user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.AFFILIATE: return currentUser ? <Affiliate user={currentUser} onNavigate={setCurrentView} /> : null;
      case ViewState.NEWS: return <News onNavigate={setCurrentView} />;
      case ViewState.CONNECTED_APPS: return currentUser ? <ConnectedApps user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} onSimulateRequest={handleSimulateAppRequest} /> : null;
      case ViewState.CONNECT_REQUEST: return currentUser && pendingAppRequest ? <ConnectRequest user={currentUser} requestData={pendingAppRequest} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.SECURITY: return currentUser ? <Security user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.LEGAL: return currentUser ? <Legal user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.NOTIFICATIONS: return <Notifications onNavigate={setCurrentView} />;
      case ViewState.SUPPORT: return <Support onNavigate={setCurrentView} />;
      default: return <Home assets={assets} totalBalance={totalBalance} user={currentUser} onLogout={handleLogout} />;
    }
  };

  return (
    <SafeAreaView className="bg-black">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 relative max-w-md mx-auto w-full h-full bg-background overflow-hidden shadow-2xl shadow-black">
        <View className="flex-1 h-full">
          {renderContent()}
        </View>
        {currentUser && 
         ![ViewState.WELCOME, ViewState.LOGIN, ViewState.SIGNUP, ViewState.ASSET_DETAILS, ViewState.NFT_DETAILS, ViewState.SEND, ViewState.RECEIVE, ViewState.SWAP, ViewState.CHAT].includes(currentView) && (
           <Navigation currentView={currentView} onNavigate={setCurrentView} />
        )}
      </View>
    </SafeAreaView>
  );
}

export default App;
