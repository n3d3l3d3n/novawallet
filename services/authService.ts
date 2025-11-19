
import { User, Message, Friend, ConnectedApp, Group, Attachment, AppPermissions, ComplianceSettings, BankingCard } from '../types';

// Mock Database Keys
const USERS_KEY = 'nova_users_db';
const SESSION_KEY = 'nova_session_token';
const MESSAGES_KEY = 'nova_messages_db';
const GROUPS_KEY = 'nova_groups_db';

// Mock BIP-39 Wordlist (subset)
const WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger'
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple Mock Encryption (Base64 for demo purposes, representing E2EE)
const mockEncrypt = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const mockDecrypt = (cipher: string): string => {
  try {
    return decodeURIComponent(atob(cipher));
  } catch {
    return '*** Decryption Error ***';
  }
};

export const authService = {
  // Initialize DB if empty
  init: () => {
    if (!localStorage.getItem(USERS_KEY)) {
      const demoUser: User = {
        id: 'user_123',
        name: 'Demo User',
        username: '@demo',
        email: 'demo@nova.com',
        phoneNumber: '+15550199',
        isEmailVerified: true,
        isPhoneVerified: true,
        // @ts-ignore - storing password in mock db object but not in interface
        password: 'password', 
        recoveryPhrase: 'abandon ability able about above absent absorb abstract absurd abuse access accident',
        joinedDate: new Date().toISOString(),
        friends: [],
        groups: [],
        connectedApps: [],
        profileImage: undefined,
        settings: {
          currency: 'USD',
          biometricsEnabled: false,
          hideBalances: false,
          notifications: { priceAlerts: true, news: true, security: true }
        },
        permissions: {
          camera: 'prompt',
          photos: 'prompt',
          microphone: 'prompt',
          contacts: 'prompt',
          location: 'prompt',
          nfc: 'prompt',
          notifications: 'prompt'
        },
        compliance: {
            termsAccepted: true,
            privacyPolicyAccepted: true,
            dataProcessingConsent: true,
            marketingConsent: true,
            agreedToDate: Date.now()
        },
        cards: [
            { id: 'c1', last4: '4242', expiry: '12/28', holderName: 'DEMO USER', network: 'Visa', type: 'Debit', color: 'black', isFrozen: false }
        ],
        affiliateStats: { earnings: 1250.50, referrals: 12, rank: 'Silver' },
        vendorStats: {
            rating: 4.8,
            reviewCount: 42,
            totalSales: 150,
            joinedDate: '2022-05-10',
            badges: ['Top Rated', 'Verified']
        }
      };

      // Add some other mock vendors
      const vendor2: User = {
        ...demoUser,
        id: 'user_vendor_2',
        name: 'RolexKing',
        username: '@rolexking',
        vendorStats: { rating: 4.9, reviewCount: 305, totalSales: 1200, joinedDate: '2021-01-15', badges: ['Top Rated', 'Fast Shipper', 'Verified'] }
      };

      const vendor3: User = {
        ...demoUser,
        id: 'user_vendor_3',
        name: 'GamerZone',
        username: '@gamerzone',
        vendorStats: { rating: 4.5, reviewCount: 89, totalSales: 450, joinedDate: '2023-08-20', badges: ['Verified'] }
      };

      localStorage.setItem(USERS_KEY, JSON.stringify([demoUser, vendor2, vendor3]));
    }
    if (!localStorage.getItem(MESSAGES_KEY)) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(GROUPS_KEY)) {
      // Create some mock public groups
      const publicGroups: Group[] = [
        {
          id: 'group_btc_whales',
          name: 'BTC Whales 🐳',
          type: 'public',
          members: ['user_123'],
          admins: [],
          icon: '🐳',
          description: 'Discussion for high volume Bitcoin traders.',
          lastMessage: 'Bitcoin to the moon! 🚀',
          lastMessageTime: Date.now() - 100000
        },
        {
          id: 'group_nft_collectors',
          name: 'NFT Collectors',
          type: 'public',
          members: [],
          admins: [],
          icon: '🎨',
          description: 'Show off your latest JPEGs.',
          lastMessage: 'Just minted a new one.',
          lastMessageTime: Date.now() - 500000
        }
      ];
      localStorage.setItem(GROUPS_KEY, JSON.stringify(publicGroups));
    }
  },

  generateMnemonic: (): string => {
    const phrase = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * WORDLIST.length);
      phrase.push(WORDLIST[randomIndex]);
    }
    return phrase.join(' ');
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Check if any user has this username (case insensitive)
    const exists = users.some((u: any) => u.username?.toLowerCase() === username.toLowerCase());
    return !exists;
  },

  // --- Verification Logic ---

  sendEmailVerification: async (email: string): Promise<void> => {
    await delay(1000);
    console.log(`[Mock Email Service] Sending code 123456 to ${email}`);
    // In a real app, this triggers backend to send email
  },

  verifyEmailCode: async (userId: string, code: string): Promise<boolean> => {
    await delay(800);
    if (code === '123456') {
      await authService.updateProfile(userId, { isEmailVerified: true });
      return true;
    }
    throw new Error('Invalid verification code');
  },

  sendSmsVerification: async (phoneNumber: string): Promise<void> => {
    await delay(1000);
    console.log(`[Mock SMS Service] Sending code 987654 to ${phoneNumber}`);
  },

  verifySmsCode: async (userId: string, code: string): Promise<boolean> => {
    await delay(800);
    if (code === '987654') {
      await authService.updateProfile(userId, { isPhoneVerified: true });
      return true;
    }
    throw new Error('Invalid SMS code');
  },

  // --- Auth Logic ---

  login: async (email: string, password: string): Promise<User> => {
    await delay(800); // Fake network loading
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create session - remove sensitive data usually, but here we keep what we need
    const sessionUser: User = { ...user };
    // @ts-ignore
    delete sessionUser.password;
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    
    return sessionUser;
  },

  loginWithPhrase: async (phrase: string): Promise<User> => {
    await delay(1000);

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Normalize spaces
    const cleanPhrase = phrase.trim().replace(/\s+/g, ' ');
    
    const user = users.find((u: any) => u.recoveryPhrase === cleanPhrase);

    if (!user) {
      throw new Error('Invalid recovery phrase. Wallet not found.');
    }

    const sessionUser: User = { ...user };
    // @ts-ignore
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  },

  signup: async (
      name: string, 
      email: string, 
      password: string, 
      username: string,
      permissions: AppPermissions,
      compliance: ComplianceSettings
    ): Promise<{user: User, phrase: string}> => {
    await delay(1000);
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already exists');
    }

    // Double check username in case
    if (users.find((u: any) => u.username?.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username taken');
    }

    const recoveryPhrase = authService.generateMnemonic();

    const newUser: any = {
      id: 'user_' + Date.now(),
      name,
      email,
      username,
      password,
      phoneNumber: undefined,
      isEmailVerified: false,
      isPhoneVerified: false,
      recoveryPhrase,
      friends: [],
      groups: [],
      connectedApps: [],
      cards: [],
      joinedDate: new Date().toISOString(),
      settings: {
        currency: 'USD',
        biometricsEnabled: false,
        hideBalances: false,
        notifications: { priceAlerts: true, news: true, security: true }
      },
      permissions: permissions,
      compliance: compliance,
      affiliateStats: { earnings: 0, referrals: 0, rank: 'Bronze' },
      vendorStats: { rating: 0, reviewCount: 0, totalSales: 0, joinedDate: new Date().toISOString(), badges: [] }
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto login
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return { user: sessionUser, phrase: recoveryPhrase };
  },

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay(600);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) throw new Error('User not found');

    // If updating username, check uniqueness again excluding self
    if (updates.username) {
       const usernameTaken = users.some((u: any) => u.id !== userId && u.username.toLowerCase() === updates.username!.toLowerCase());
       if (usernameTaken) throw new Error('Username is already taken');
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update session if it's the current user
    const currentSession = authService.getCurrentUser();
    if (currentSession && currentSession.id === userId) {
        const sessionUser = { ...updatedUser };
        delete sessionUser.password;
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    }

    const result = { ...updatedUser };
    delete result.password;
    return result;
  },

  // --- Permissions Logic ---

  updatePermission: async (userId: string, permission: keyof AppPermissions, status: 'granted' | 'denied' | 'limited'): Promise<User> => {
     const currentUser = authService.getCurrentUser();
     if (!currentUser) throw new Error('No user');
     
     const newPermissions = { ...currentUser.permissions, [permission]: status };
     return authService.updateProfile(userId, { permissions: newPermissions });
  },

  logout: async () => {
    await delay(200);
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  getUserById: (userId: string): User | null => {
     const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
     return users.find((u: any) => u.id === userId) || null;
  },

  // --- Social & Messaging Logic ---

  addFriend: async (userId: string, identifier: string): Promise<User> => {
    // identifier can be @username or phone number
    await delay(800);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    // Find target friend
    const friend = users.find((u: any) => 
      u.username.toLowerCase() === identifier.toLowerCase() || 
      u.phoneNumber === identifier
    );

    if (!friend) throw new Error('User not found');
    if (friend.id === userId) throw new Error('Cannot add yourself');
    
    const currentUser = users[userIndex];
    if (currentUser.friends.includes(friend.id)) throw new Error('User is already your friend');

    // Update User
    currentUser.friends.push(friend.id);
    users[userIndex] = currentUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update Session
    const sessionUser = { ...currentUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  },

  getFriends: (friendIds: string[]): Friend[] => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users
      .filter((u: any) => friendIds.includes(u.id))
      .map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        profileImage: u.profileImage,
        // Mock status
        status: Math.random() > 0.7 ? 'offline' : Math.random() > 0.5 ? 'away' : 'online',
        lastSeen: '10m ago'
      }));
  },

  sendMessage: async (
    senderId: string, 
    receiverId: string, 
    text: string, 
    isEphemeral: boolean, 
    isGroup: boolean = false,
    attachments?: Attachment[]
  ): Promise<Message> => {
    // Mock E2EE by encrypting before storage
    const encryptedText = mockEncrypt(text);
    
    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      senderId,
      receiverId,
      isGroup,
      text: encryptedText,
      attachments,
      timestamp: Date.now(),
      isEphemeral,
      isRead: false
    };

    const messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    messages.push(newMessage);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Update group last message if it's a group
    if (isGroup) {
      const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
      const groupIndex = groups.findIndex((g: Group) => g.id === receiverId);
      if (groupIndex > -1) {
        const lastMsgText = attachments && attachments.length > 0 
          ? (attachments[0].type === 'image' ? '📷 Image' : '🎥 Video') 
          : text;
        
        groups[groupIndex].lastMessage = lastMsgText; 
        groups[groupIndex].lastMessageTime = Date.now();
        localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
      }
    }

    return newMessage;
  },

  getMessages: (userId: string, targetId: string, isGroup: boolean = false): Message[] => {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    
    let conversation;
    if (isGroup) {
      conversation = allMessages.filter((m: Message) => m.receiverId === targetId && m.isGroup);
    } else {
      conversation = allMessages.filter((m: Message) => 
        !m.isGroup &&
        ((m.senderId === userId && m.receiverId === targetId) ||
         (m.senderId === targetId && m.receiverId === userId))
      );
    }

    // Decrypt for display
    return conversation.map((m: Message) => ({
       ...m,
       text: mockDecrypt(m.text)
    }));
  },

  // --- Group Logic ---

  createGroup: async (creatorId: string, name: string, type: 'private' | 'public', memberIds: string[], icon: string): Promise<Group> => {
    await delay(1000);
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    
    const newGroup: Group = {
      id: 'group_' + Date.now(),
      name,
      type,
      members: [...memberIds, creatorId], // Add creator to members
      admins: [creatorId],
      icon,
      lastMessage: 'Group created',
      lastMessageTime: Date.now()
    };

    groups.push(newGroup);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));

    // Update creator's group list
    const user = await authService.updateProfile(creatorId, { 
      // This is a bit hacky for the mock, normally backend handles this relation
    }); 
    
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
    await delay(800);
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    const groupIndex = groups.findIndex((g: Group) => g.id === groupId);
    
    if (groupIndex === -1) throw new Error('Group not found');
    
    if (!groups[groupIndex].members.includes(userId)) {
      groups[groupIndex].members.push(userId);
      localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
    }
  },

  getGroupDetails: (groupId: string): Group | null => {
    const groups = JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]');
    return groups.find((g: Group) => g.id === groupId) || null;
  },

  // --- Connected Apps Logic ---

  authorizeApp: async (userId: string, app: ConnectedApp): Promise<User> => {
    await delay(1000);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');
    const currentUser = users[userIndex];

    // Check if already connected, if so update
    const existingAppIndex = (currentUser.connectedApps || []).findIndex((a: ConnectedApp) => a.id === app.id);
    
    if (!currentUser.connectedApps) currentUser.connectedApps = [];

    if (existingAppIndex > -1) {
      currentUser.connectedApps[existingAppIndex] = app;
    } else {
      currentUser.connectedApps.push(app);
    }

    users[userIndex] = currentUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update Session
    const sessionUser = { ...currentUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  },

  revokeApp: async (userId: string, appId: string): Promise<User> => {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');
    const currentUser = users[userIndex];

    if (currentUser.connectedApps) {
      currentUser.connectedApps = currentUser.connectedApps.filter((a: ConnectedApp) => a.id !== appId);
    }

    users[userIndex] = currentUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Update Session
    const sessionUser = { ...currentUser };
    delete sessionUser.password;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  },

  // --- Card Logic (Mock) ---
  addCard: async (userId: string, card: BankingCard): Promise<User> => {
      await delay(1500);
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const userIndex = users.findIndex((u: any) => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      const currentUser = users[userIndex];
      if (!currentUser.cards) currentUser.cards = [];
      currentUser.cards.push(card);
      
      users[userIndex] = currentUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      const sessionUser = { ...currentUser };
      delete sessionUser.password;
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return sessionUser;
  }
};

// Initialize on load
authService.init();
