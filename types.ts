

export enum ViewState {
  // Auth Views
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  
  // App Views
  HOME = 'HOME',
  MARKET = 'MARKET',
  ADVISOR = 'ADVISOR',
  WALLET = 'WALLET',
  MESSAGES = 'MESSAGES',
  CHAT = 'CHAT',
  
  // Transaction Views
  ASSET_DETAILS = 'ASSET_DETAILS',
  NFT_DETAILS = 'NFT_DETAILS',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  CARD_DETAILS = 'CARD_DETAILS',
  BUY = 'BUY',
  
  // Web3 Advanced (Paused Modules)
  SWAP = 'SWAP',
  EARN = 'EARN',
  GOVERNANCE = 'GOVERNANCE',
  DARK_BROWSER = 'DARK_BROWSER',
  CREATOR_STUDIO = 'CREATOR_STUDIO',
  CONNECTED_APPS = 'CONNECTED_APPS',
  CONNECT_REQUEST = 'CONNECT_REQUEST',
  SIGN_REQUEST = 'SIGN_REQUEST',

  // P2P
  P2P_MARKET = 'P2P_MARKET',
  P2P_ORDER = 'P2P_ORDER',
  
  // Profile Ecosystem
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  AFFILIATE = 'AFFILIATE',
  NEWS = 'NEWS',
  
  // Security Suite
  SECURITY = 'SECURITY',
  DEVICES = 'DEVICES',
  BACKUP = 'BACKUP',
  
  // New Sections
  LEGAL = 'LEGAL',
  NOTIFICATIONS = 'NOTIFICATIONS',
  SUPPORT = 'SUPPORT'
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  ipAddress: string;
  location: string;
  lastActive: number;
  isCurrent: boolean;
}

export interface UserSettings {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  biometricsEnabled: boolean;
  hideBalances: boolean;
  autoLockTimer: number;
  antiPhishingCode?: string;
  notifications: {
    priceAlerts: boolean;
    news: boolean;
    security: boolean;
    marketing: boolean;
  };
  backup?: {
    cloudEnabled: boolean;
    lastBackup?: number;
    guardians?: string[];
  };
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  profileImage?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'private' | 'public';
  members: string[];
  admins: string[];
  icon: string;
  description?: string;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'transfer' | 'invoice';
  url?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  metadata?: {
    amount: number;
    symbol: string;
    valueUsd: number;
    status: 'pending' | 'completed' | 'cancelled';
    description?: string;
  }
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  isGroup?: boolean;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isEphemeral: boolean;
  isRead: boolean;
}

export interface ConnectedApp {
  id: string;
  name: string;
  domain: string;
  icon: string;
  permissions: string[];
  connectedAt: number;
}

export interface VendorStats {
  rating: number;
  reviewCount: number;
  totalSales: number;
  joinedDate: string;
  badges: ('Top Rated' | 'Fast Shipper' | 'Verified')[];
}

export type PermissionStatus = 'granted' | 'denied' | 'limited' | 'prompt';

export interface AppPermissions {
  camera: PermissionStatus;
  photos: PermissionStatus;
  microphone: PermissionStatus;
  contacts: PermissionStatus;
  location: PermissionStatus;
  nfc: PermissionStatus;
  notifications: PermissionStatus;
}

export interface ComplianceSettings {
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  agreedToDate: number;
}

export interface CardTransaction {
   id: string;
   merchant: string;
   amount: number;
   currency: string;
   category: 'shopping' | 'food' | 'travel' | 'services' | 'topup';
   date: number;
   type: 'purchase' | 'refund' | 'topup';
   status: 'pending' | 'completed' | 'declined';
   icon?: string;
}

export interface BankingCard {
  id: string;
  last4: string;
  expiry: string;
  cvv: string;
  holderName: string;
  network: 'Visa' | 'Mastercard';
  type: 'Debit' | 'Credit';
  color: 'blue' | 'black' | 'gold';
  balance: number;
  currency: string;
  isFrozen: boolean;
  settings: {
     onlinePayments: boolean;
     international: boolean;
     monthlyLimit: number;
     roundUpToSavings: boolean;
  };
  transactions?: CardTransaction[];
}

export interface ActivityLog {
  id: string;
  action: string;
  ipAddress: string;
  device: string;
  location: string;
  timestamp: number;
  status: 'success' | 'failed';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'transaction' | 'system' | 'price';
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  lastUpdate: number;
}

export interface KYCState {
  level: 0 | 1 | 2 | 3;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  documents: {
    type: 'passport' | 'license' | 'id_card';
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: number;
  }[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  walletAddress: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kyc: KYCState;
  profileImage?: string;
  recoveryPhrase?: string;
  joinedDate: string;
  friends: string[];
  groups?: string[];
  connectedApps: ConnectedApp[];
  settings: UserSettings;
  permissions: AppPermissions;
  compliance: ComplianceSettings;
  cards: BankingCard[];
  affiliateStats: {
    earnings: number;
    referrals: number;
    rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  };
  vendorStats?: VendorStats;
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
  network: string;
  tokenType?: string;
  availableNetworks?: string[];
}

export interface NFTTrait {
  type: string;
  value: string;
  rarity?: number;
}

export interface NFT {
  id: string;
  collectionName: string;
  tokenId: string;
  name: string;
  imageUrl: string;
  floorPrice: number;
  currency: string;
  traits: NFTTrait[];
  description: string;
  chain: 'ETH' | 'SOL' | 'POLY';
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

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  imageUrl?: string;
  category: 'Market' | 'Tech' | 'Regulation';
  sentiment: 'Positive' | 'Negative' | 'Neutral';
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
  isLocalPickupAvailable: boolean;
}

export interface ShippingOption {
  id: string;
  name: string;
  priceUsd: number;
  estimatedDays: string;
}

export interface ProductReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  subcategory: string;
  condition: 'New' | 'Open Box' | 'Used' | 'Refurbished';
  shippingOptions: ShippingOption[];
  location?: GeoLocation;
  reviews: ProductReview[];
  createdAt: number;
}

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'disputed';

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  currency: string;
  buyerId: string;
  sellerId: string;
  date: number;
  status: OrderStatus;
  shippingMethod: string;
  trackingNumber?: string;
}

export type CallStatus = 'incoming' | 'outgoing' | 'active' | 'minimized' | 'ended';

export interface CallSession {
    id: string;
    partnerId: string;
    partnerName: string;
    partnerImage?: string;
    isVideo: boolean;
    status: CallStatus;
    startTime?: number;
}

export interface P2POffer {
  id: string;
  traderName: string;
  traderRating: number;
  tradesCount: number;
  type: 'buy' | 'sell';
  asset: string;
  currency: string;
  price: number;
  minLimit: number;
  maxLimit: number;
  paymentMethods: string[];
  isOnline: boolean;
}

export interface P2PTrade {
  id: string;
  offerId: string;
  type: 'buy' | 'sell';
  asset: string;
  currency: string;
  fiatAmount: number;
  cryptoAmount: number;
  price: number;
  status: 'created' | 'paid' | 'released' | 'disputed' | 'cancelled';
  traderName: string;
  paymentDetails?: {
    method: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
  };
  chatId: string;
  createdAt: number;
}

export interface FiatQuote {
    providerId: string;
    providerName: string;
    providerLogo: string;
    cryptoAmount: number;
    fiatAmount: number;
    fiatCurrency: string;
    fee: number;
    rate: number;
    deliveryTime: string;
    paymentMethods: string[];
    isBestRate: boolean;
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
  isLoading: boolean;
}

export type Chain = 'Ethereum' | 'Solana' | 'Bitcoin' | 'Polygon' | 'BSC' | 'Optimism' | 'Arbitrum';

export interface DAppTransaction {
  dAppName: string;
  dAppUrl: string;
  dAppIcon?: string;
  action: 'swap' | 'approve' | 'sign';
  network: string;
  details: {
    fromAmount?: number;
    fromSymbol?: string;
    toAmount?: number;
    toSymbol?: string;
    gasFee?: number;
  };
}

export interface StakingOption {
  id: string;
  assetSymbol: string;
  name: string;
  apy: number;
  minStake: number;
  lockPeriodDays: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface StakingPosition {
  id: string;
  optionId: string;
  amount: number;
  rewardsEarned: number;
  startDate: number;
}

export interface SwapRoute {
  id: string;
  providerName: string;
  providerIcon: string;
  type: 'DEX' | 'BRIDGE';
  inputAmount: number;
  outputAmount: number;
  gasFeeUsd: number;
  estimatedTimeSeconds: number;
  steps: string[];
  tags?: string[];
}

export interface LimitOrder {
  id: string;
  fromSymbol: string;
  toSymbol: string;
  amount: number;
  targetPrice: number;
  expiry: number;
  status: 'open' | 'filled' | 'cancelled';
  createdAt: number;
}

export interface Proposal {
  id: string;
  daoName: string;
  daoIcon: string;
  assetSymbol: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  status: 'Active' | 'Pending' | 'Closed' | 'Passed' | 'Rejected';
  totalVotes: number;
  userVotingPower: number;
  userVotedOptionId?: string;
  options: {
    id: string;
    label: string;
    votes: number;
  }[];
}
