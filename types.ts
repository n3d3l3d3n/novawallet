export enum ViewState {
  HOME = 'HOME',
  MARKET = 'MARKET',
  ADVISOR = 'ADVISOR',
  WALLET = 'WALLET'
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  color: string;
  chartData: { value: number }[];
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'buy';
  assetSymbol: string;
  amount: number;
  valueUsd: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
}
