
import React, { useState, useEffect } from 'react';
import { ViewState, Asset, Transaction, User, ConnectedApp } from './types';
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
import { authService } from './services/authService';

// Mock Data
const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: 0.42,
    price: 64230.50,
    change24h: 2.4,
    color: 'bg-orange-500',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 60000 + Math.random() * 5000 + i * 100 }))
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    balance: 4.5,
    price: 3450.20,
    change24h: -1.2,
    color: 'bg-blue-600',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 3200 + Math.random() * 400 + i * 20 }))
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    balance: 145.0,
    price: 148.90,
    change24h: 5.7,
    color: 'bg-purple-600',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 130 + Math.random() * 30 + i * 5 }))
  },
  {
    id: '4',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: 5430.0,
    price: 1.00,
    change24h: 0.01,
    color: 'bg-blue-400',
    chartData: Array.from({ length: 20 }, () => ({ value: 1.00 + (Math.random() - 0.5) * 0.001 }))
  },
  {
    id: '5',
    symbol: 'DOGE',
    name: 'Dogecoin',
    balance: 0,
    price: 0.12,
    change24h: 8.4,
    color: 'bg-yellow-500',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 0.10 + Math.random() * 0.05 }))
  },
  {
    id: '6',
    symbol: 'DOT',
    name: 'Polkadot',
    balance: 0,
    price: 7.20,
    change24h: -3.5,
    color: 'bg-pink-600',
    chartData: Array.from({ length: 20 }, (_, i) => ({ value: 8 - i * 0.1 + Math.random() }))
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'receive', assetSymbol: 'BTC', amount: 0.0042, valueUsd: 269.76, date: 'Today, 10:23 AM', status: 'completed' },
  { id: 't2', type: 'send', assetSymbol: 'ETH', amount: 1.2, valueUsd: 4140.24, date: 'Yesterday, 4:15 PM', status: 'completed' },
  { id: 't3', type: 'swap', assetSymbol: 'SOL', amount: 45, valueUsd: 6700.50, date: 'Oct 24, 9:30 AM', status: 'completed' },
  { id: 't4', type: 'buy', assetSymbol: 'USDC', amount: 500, valueUsd: 500.00, date: 'Oct 22, 2:10 PM', status: 'completed' },
  { id: 't5', type: 'receive', assetSymbol: 'DOGE', amount: 1000, valueUsd: 120.00, date: 'Oct 20, 11:00 AM', status: 'completed' },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.WELCOME);
  const [assets] = useState<Asset[]>(INITIAL_ASSETS);
  const [totalBalance, setTotalBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatIsGroup, setActiveChatIsGroup] = useState(false);
  const [pendingAppRequest, setPendingAppRequest] = useState<Partial<ConnectedApp> | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentView(ViewState.HOME);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const total = assets.reduce((acc, asset) => acc + (asset.balance * asset.price), 0);
    setTotalBalance(total);
  }, [assets]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView(ViewState.HOME);
  };

  const handleLogout = () => {
    authService.logout();
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

  // Don't render until we check for session
  if (!isInitialized) return null;

  const renderContent = () => {
    switch (currentView) {
      // Auth Views
      case ViewState.WELCOME:
        return <Welcome onNavigate={setCurrentView} />;
      case ViewState.LOGIN:
        return <Login onNavigate={setCurrentView} onLoginSuccess={handleLoginSuccess} />;
      case ViewState.SIGNUP:
        return <Signup onNavigate={setCurrentView} onSignupSuccess={handleLoginSuccess} />;
      
      // App Views
      case ViewState.HOME:
        return <Home assets={assets.filter(a => a.balance > 0)} totalBalance={totalBalance} user={currentUser} onLogout={handleLogout} />;
      case ViewState.MARKET:
        return <Market assets={assets} />;
      case ViewState.ADVISOR:
        return <Advisor assets={assets} />;
      case ViewState.WALLET:
        return <Wallet transactions={INITIAL_TRANSACTIONS} assets={assets} />;
      case ViewState.DARK_BROWSER:
        return <DarkBrowser />;
      
      // Messaging
      case ViewState.MESSAGES:
        return currentUser ? <Messages user={currentUser} onNavigate={setCurrentView} onSelectChat={handleChatSelect} /> : null;
      case ViewState.CHAT:
        return currentUser && activeChatId ? (
          <Chat 
            currentUser={currentUser} 
            targetId={activeChatId}
            isGroup={activeChatIsGroup}
            onBack={() => setCurrentView(ViewState.MESSAGES)} 
          />
        ) : <Messages user={currentUser!} onNavigate={setCurrentView} onSelectChat={handleChatSelect} />;

      // Profile Ecosystem
      case ViewState.PROFILE:
        return currentUser ? <Profile user={currentUser} onNavigate={setCurrentView} onLogout={handleLogout} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.SETTINGS:
        return currentUser ? <Settings user={currentUser} onNavigate={setCurrentView} onUpdateUser={setCurrentUser} /> : null;
      case ViewState.AFFILIATE:
        return currentUser ? <Affiliate user={currentUser} onNavigate={setCurrentView} /> : null;
      case ViewState.NEWS:
        return <News onNavigate={setCurrentView} />;
      case ViewState.CONNECTED_APPS:
        return currentUser ? (
          <ConnectedApps 
            user={currentUser} 
            onNavigate={setCurrentView} 
            onUpdateUser={setCurrentUser} 
            onSimulateRequest={handleSimulateAppRequest}
          />
        ) : null;
      case ViewState.CONNECT_REQUEST:
        return currentUser && pendingAppRequest ? (
          <ConnectRequest 
            user={currentUser} 
            requestData={pendingAppRequest} 
            onNavigate={setCurrentView} 
            onUpdateUser={setCurrentUser}
          />
        ) : <Home assets={assets} totalBalance={totalBalance} user={currentUser} onLogout={handleLogout} />;

      default:
        return <Home assets={assets} totalBalance={totalBalance} user={currentUser} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="bg-background min-h-screen text-white font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md mx-auto min-h-screen bg-gradient-to-b from-slate-900 to-black relative shadow-2xl shadow-black">
        {/* Main Content Area */}
        <div className="h-screen overflow-y-auto overflow-x-hidden no-scrollbar">
          {renderContent()}
        </div>

        {/* Bottom Navigation - Only show when logged in and not in auth views */}
        {currentUser && 
         currentView !== ViewState.WELCOME && 
         currentView !== ViewState.LOGIN && 
         currentView !== ViewState.SIGNUP && (
           <Navigation currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    </div>
  );
}

export default App;
