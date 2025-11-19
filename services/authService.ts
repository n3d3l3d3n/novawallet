
import { supabase } from './supabaseClient';
import { User, Message, Friend, ConnectedApp, Group, Attachment, AppPermissions, ComplianceSettings, BankingCard, ActivityLog, NotificationItem, SupportTicket } from '../types';

// We still use localStorage to "Mock" the SQL database table structure for Profile Data
// since we can't create real SQL tables in this environment.
// The Auth ID from Supabase will be the Key to find this data.
const PROFILES_KEY = 'nova_profiles_db';
const SESSION_KEY = 'nova_session_token'; // Legacy support
const MESSAGES_KEY = 'nova_messages_db';
const GROUPS_KEY = 'nova_groups_db';
const LOGS_KEY = 'nova_activity_logs';
const NOTIFICATIONS_KEY = 'nova_notifications';
const TICKETS_KEY = 'nova_support_tickets';

const WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger'
];

// Simple Mock Encryption (Base64 for demo purposes)
const mockEncrypt = (text: string): string => btoa(encodeURIComponent(text));
const mockDecrypt = (cipher: string): string => {
  try { return decodeURIComponent(atob(cipher)); } catch { return '*** Decryption Error ***'; }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  
  init: () => {
    // Initialize Mock DB containers if missing
    if (!localStorage.getItem(PROFILES_KEY)) localStorage.setItem(PROFILES_KEY, JSON.stringify([]));
    if (!localStorage.getItem(MESSAGES_KEY)) localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    if (!localStorage.getItem(GROUPS_KEY)) localStorage.setItem(GROUPS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(LOGS_KEY)) localStorage.setItem(LOGS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  },

  // --- Supabase Auth Methods ---

  // Helper to create a default profile for a new Supabase User
  _ensureUserProfile: async (authId: string, email: string, meta: any = {}): Promise<User> => {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    let profile = profiles.find((p: User) => p.id === authId);

    if (!profile) {
      // Create new profile
      profile = {
        id: authId,
        name: meta.name || email.split('@')[0],
        username: meta.username || `@${email.split('@')[0]}`,
        email: email,
        phoneNumber: meta.phone || undefined,
        isEmailVerified: true, // Assume true if Supabase login worked
        isPhoneVerified: false,
        kyc: { level: 0, status: 'unverified', documents: [] },
        recoveryPhrase: authService.generateMnemonic(),
        joinedDate: new Date().toISOString(),
        friends: [],
        groups: [],
        connectedApps: [],
        profileImage: undefined,
        settings: {
          currency: 'USD',
          biometricsEnabled: false,
          hideBalances: false,
          autoLockTimer: 5,
          notifications: { priceAlerts: true, news: true, security: true, marketing: false }
        },
        permissions: meta.permissions || {
          camera: 'prompt',
          photos: 'prompt',
          microphone: 'prompt',
          contacts: 'prompt',
          location: 'prompt',
          nfc: 'prompt',
          notifications: 'prompt'
        },
        compliance: meta.compliance || {
            termsAccepted: true,
            privacyPolicyAccepted: true,
            dataProcessingConsent: true,
            marketingConsent: true,
            agreedToDate: Date.now()
        },
        cards: [],
        affiliateStats: { earnings: 0, referrals: 0, rank: 'Bronze' },
        vendorStats: { rating: 0, reviewCount: 0, totalSales: 0, joinedDate: new Date().toISOString(), badges: [] }
      };
      profiles.push(profile);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
    return profile;
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    // Log Activity
    authService.addActivityLog({ 
        id: 'log_'+Date.now(), action: 'Login', ipAddress: '192.168.1.1', device: 'Mobile', location: 'Supabase Auth', timestamp: Date.now(), status: 'success' 
    });

    return await authService._ensureUserProfile(data.user.id, data.user.email || '');
  },

  signup: async (name: string, email: string, password: string, username: string, permissions: AppPermissions, compliance: ComplianceSettings): Promise<{user: User, phrase: string}> => {
    
    // Check local username uniqueness mock
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    if (profiles.find((p: any) => p.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username is already taken');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          permissions,
          compliance
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    const userProfile = await authService._ensureUserProfile(data.user.id, email, { name, username, permissions, compliance });
    
    return { user: userProfile, phrase: userProfile.recoveryPhrase || '' };
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(SESSION_KEY); // clear legacy
  },

  // Get current authenticated user with Profile Data
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return await authService._ensureUserProfile(session.user.id, session.user.email || '');
  },

  // Legacy/Mock method for direct UI access (synchronous fallback)
  // In a real app, this would be fully async or via Context/Hook
  getCurrentUserSync: (): User | null => {
     // We try to look up the session from local storage that Supabase sets, 
     // but since we need the Full Profile, we might have to rely on a cached version 
     // or the fact that we sync the profiles to localStorage.
     // For this specific React setup, we'll grab the last known user ID from Supabase storage key
     // or return null and let the async App.tsx effect handle it.
     const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
     if(key) {
         const token = JSON.parse(localStorage.getItem(key) || '{}');
         if(token.user?.id) {
             const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
             return profiles.find((p: User) => p.id === token.user.id) || null;
         }
     }
     return null;
  },

  // Legacy login via Phrase (This keeps the "Import Wallet" feature alive using mock logic)
  loginWithPhrase: async (phrase: string): Promise<User> => {
    await delay(1000);
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    const cleanPhrase = phrase.trim().replace(/\s+/g, ' ');
    const user = profiles.find((u: any) => u.recoveryPhrase === cleanPhrase);

    if (!user) throw new Error('Invalid recovery phrase. Wallet not found.');
    
    // Note: We can't easily "Log in to Supabase" with just a phrase unless we stored the phrase there.
    // For this demo, we will return the user, but Supabase session won't be active.
    // This is a hybrid state for the demo.
    return user;
  },

  // --- Mock Data Utils (Synced with Profile Key) ---

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay(300);
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    const idx = profiles.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    if (updates.username) {
       const taken = profiles.some((u: any) => u.id !== userId && u.username.toLowerCase() === updates.username!.toLowerCase());
       if (taken) throw new Error('Username taken');
    }

    const updated = { ...profiles[idx], ...updates };
    profiles[idx] = updated;
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    return updated;
  },

  generateMnemonic: (): string => {
    const phrase = [];
    for (let i = 0; i < 12; i++) {
      phrase.push(WORDLIST[Math.floor(Math.random() * WORDLIST.length)]);
    }
    return phrase.join(' ');
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    await delay(300);
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    return !profiles.some((u: any) => u.username?.toLowerCase() === username.toLowerCase());
  },

  // --- Verification Placeholders ---
  sendEmailVerification: async (email: string) => { console.log('Supabase handles this, or mock:', email); },
  verifyEmailCode: async (uid: string, code: string) => { return true; },
  sendSmsVerification: async (phone: string) => { console.log('Sending SMS', phone); },
  verifySmsCode: async (uid: string, code: string) => { return true; },

  // --- Social & App Logic (Mocked but keyed to UserID) ---
  
  getUserById: (id: string): User | null => {
     const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
     return profiles.find((u: any) => u.id === id) || null;
  },

  addFriend: async (userId: string, identifier: string): Promise<User> => {
    await delay(500);
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    const idx = profiles.findIndex((u: any) => u.id === userId);
    const friend = profiles.find((u: any) => u.username.toLowerCase() === identifier.toLowerCase() || u.email === identifier);
    
    if (!friend) throw new Error('User not found');
    if (friend.id === userId) throw new Error('Cannot add self');
    
    if (!profiles[idx].friends.includes(friend.id)) {
        profiles[idx].friends.push(friend.id);
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
    return profiles[idx];
  },

  getFriends: (ids: string[]): Friend[] => {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
    return profiles.filter((u: any) => ids.includes(u.id)).map((u: any) => ({
        id: u.id, name: u.name, username: u.username, profileImage: u.profileImage,
        status: 'online', lastSeen: 'Now'
    }));
  },

  sendMessage: async (senderId: string, receiverId: string, text: string, isEphemeral: boolean, isGroup: boolean = false, attachments?: Attachment[]): Promise<Message> => {
    const encryptedText = mockEncrypt(text);
    const newMessage: Message = {
      id: 'msg_' + Date.now(), senderId, receiverId, isGroup, text: encryptedText, attachments, timestamp: Date.now(), isEphemeral, isRead: false
    };
    const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    return newMessage;
  },

  getMessages: (userId: string, targetId: string, isGroup: boolean = false): Message[] => {
    const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    let conversation;
    if (isGroup) {
      conversation = all.filter((m: Message) => m.receiverId === targetId && m.isGroup);
    } else {
      conversation = all.filter((m: Message) => !m.isGroup && ((m.senderId === userId && m.receiverId === targetId) || (m.senderId === targetId && m.receiverId === userId)));
    }
    return conversation.map((m: Message) => ({ ...m, text: mockDecrypt(m.text) }));
  },

  createGroup: async (creatorId: string, name: string, type: 'private' | 'public', memberIds: string[], icon: string): Promise<Group> => {
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    const newGroup: Group = {
      id: 'group_' + Date.now(), name, type, members: [...memberIds, creatorId], admins: [creatorId], icon, lastMessage: 'Created', lastMessageTime: Date.now()
    };
    groups.push(newGroup);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    return newGroup;
  },

  getGroups: (userId: string): Group[] => {
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    return groups.filter((g: Group) => g.members.includes(userId));
  },

  getPublicGroups: (): Group[] => {
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    return groups.filter((g: Group) => g.type === 'public');
  },

  joinGroup: async (userId: string, groupId: string): Promise<void> => {
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    const idx = groups.findIndex((g: Group) => g.id === groupId);
    if (idx > -1 && !groups[idx].members.includes(userId)) {
        groups[idx].members.push(userId);
        localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    }
  },
  
  getGroupDetails: (id: string): Group | null => {
     const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
     return groups.find((g: Group) => g.id === id) || null;
  },

  // Apps
  authorizeApp: async (userId: string, app: ConnectedApp): Promise<User> => {
     const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
     const idx = profiles.findIndex((u: any) => u.id === userId);
     if (idx > -1) {
         if (!profiles[idx].connectedApps) profiles[idx].connectedApps = [];
         profiles[idx].connectedApps.push(app);
         localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
         return profiles[idx];
     }
     throw new Error('User not found');
  },

  revokeApp: async (userId: string, appId: string): Promise<User> => {
     const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
     const idx = profiles.findIndex((u: any) => u.id === userId);
     if (idx > -1) {
         profiles[idx].connectedApps = profiles[idx].connectedApps.filter((a: ConnectedApp) => a.id !== appId);
         localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
         return profiles[idx];
     }
     throw new Error('User not found');
  },

  updatePermission: async (userId: string, permission: keyof AppPermissions, status: string): Promise<User> => {
     const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
     const idx = profiles.findIndex((u: any) => u.id === userId);
     if (idx > -1) {
         profiles[idx].permissions[permission] = status;
         localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
         return profiles[idx];
     }
     throw new Error('User not found');
  },

  getActivityLogs: (): ActivityLog[] => JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'),
  addActivityLog: (log: ActivityLog) => {
      const logs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
      logs.unshift(log);
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },
  getNotifications: (): NotificationItem[] => JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]'),
  markNotificationRead: (id: string) => {
      const ns = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      const idx = ns.findIndex((n: any) => n.id === id);
      if(idx>-1) { ns[idx].isRead = true; localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(ns)); }
  },
  
  submitKYCDocument: async (userId: string, type: string): Promise<User> => {
     await delay(1000);
     const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
     const idx = profiles.findIndex((u: any) => u.id === userId);
     if(idx>-1){
         profiles[idx].kyc.level = 2;
         profiles[idx].kyc.status = 'verified';
         localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
         return profiles[idx];
     }
     throw new Error('User not found');
  },

  exportUserData: async () => { await delay(1000); },
  deleteAccount: async (userId: string) => {
     await delay(1000);
     let profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]');
     profiles = profiles.filter((u: any) => u.id !== userId);
     localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
     await authService.logout();
  },

  createSupportTicket: async (subject: string) => {
     const tickets = JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]');
     tickets.push({ id: 't_'+Date.now(), subject, status: 'open', lastUpdate: Date.now() });
     localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  },
  getSupportTickets: (): SupportTicket[] => JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]')
};

authService.init();
