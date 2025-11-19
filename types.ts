
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
  DARK_BROWSER = 'DARK_BROWSER',
  
  // Profile Ecosystem
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  AFFILIATE = 'AFFILIATE',
  NEWS = 'NEWS',
  CONNECTED_APPS = 'CONNECTED_APPS',
  CONNECT_REQUEST = 'CONNECT_REQUEST'
}

export interface UserSettings {
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY';
  biometricsEnabled: boolean;
  hideBalances: boolean;
  notifications: {
    priceAlerts: boolean;
    news: boolean;
    security: boolean;
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
  members: string[]; // User IDs
  admins: string[]; // User IDs
  icon: string; // Emoji or URL
  description?: string;
  lastMessage?: string;
  lastMessageTime?: number;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video';
  url: string; // Base64 or URL
  fileName?: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // User ID or Group ID
  isGroup?: boolean;
  text: string; // Encrypted string
  attachments?: Attachment[];
  timestamp: number;
  isEphemeral: boolean;
  isRead: boolean;
}

export interface ConnectedApp {
  id: string;
  name: string;
  domain: string;
  icon: string; // Emoji or URL
  permissions: string[]; // e.g. ['view_profile', 'view_balance']
  connectedAt: number;
}

export interface VendorStats {
  rating: number; // 0-5
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

export interface BankingCard {
  id: string;
  last4: string;
  expiry: string;
  holderName: string;
  network: 'Visa' | 'Mastercard';
  type: 'Debit' | 'Credit';
  color: 'blue' | 'black' | 'gold';
  isFrozen: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string; // Unique handle e.g. @nedeleden
  email: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profileImage?: string; // Base64 or URL
  recoveryPhrase?: string;
  joinedDate: string;
  friends: string[]; // Array of User IDs
  groups?: string[]; // Array of Group IDs
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

// Market Interfaces

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string; // e.g. "New York, NY" or "Berlin, Germany"
  isLocalPickupAvailable: boolean;
}

export interface ShippingOption {
  id: string;
  name: string; // e.g. "Standard Shipping", "Express"
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
  currency: string; // e.g., 'USDC', 'ETH'
  images: string[];
  category: string;
  subcategory: string;
  condition: 'New' | 'Open Box' | 'Used' | 'Refurbished';
  shippingOptions: ShippingOption[];
  location?: GeoLocation;
  reviews: ProductReview[];
  createdAt: number;
}
