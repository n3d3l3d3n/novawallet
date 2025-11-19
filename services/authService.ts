
import { supabase, isMockMode } from './supabaseClient';
import { databaseService } from './databaseService';
import { chainService } from './chainService';
import { User, Message, Friend, ConnectedApp, Group, Attachment, AppPermissions, ComplianceSettings, ActivityLog, NotificationItem, SupportTicket } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  
  init: () => {
    console.log("Auth Service Initialized. Mock Mode:", isMockMode);
  },

  // --- Supabase Auth Methods ---

  // Helper to fetch full profile after auth
  _ensureUserProfile: async (authId: string, email: string, meta: any = {}): Promise<User> => {
    let profile = await databaseService.getProfile(authId);

    if (!profile) {
      const wallets = chainService.getWallets();
      const newProfile: User = {
        id: authId,
        name: meta.name || email.split('@')[0],
        username: meta.username || `@${email.split('@')[0]}`,
        email: email,
        walletAddress: wallets.evmAddress || '',
        phoneNumber: meta.phone || undefined,
        isEmailVerified: true, 
        isPhoneVerified: false,
        kyc: { level: 0, status: 'unverified', documents: [] },
        recoveryPhrase: undefined, 
        joinedDate: new Date().toISOString(),
        friends: [],
        groups: [],
        connectedApps: [],
        settings: {
          currency: 'USD',
          biometricsEnabled: false,
          hideBalances: false,
          autoLockTimer: 5,
          notifications: { priceAlerts: true, news: true, security: true, marketing: false },
          backup: { cloudEnabled: false }
        },
        permissions: meta.permissions || { camera: 'prompt', photos: 'prompt', microphone: 'prompt', contacts: 'prompt', location: 'prompt', nfc: 'prompt', notifications: 'prompt' },
        compliance: meta.compliance || { termsAccepted: true, privacyPolicyAccepted: true, dataProcessingConsent: true, marketingConsent: true, agreedToDate: Date.now() },
        cards: [],
        affiliateStats: { earnings: 0, referrals: 0, rank: 'Bronze' },
      };

      await databaseService.createProfile(newProfile);
      profile = newProfile;
    } else {
        // Hydrate relations
        profile.email = email;
        profile.friends = (await databaseService.getFriends(authId)).map(f => f.id);
        profile.connectedApps = await databaseService.getConnectedApps(authId);
        profile.groups = (await databaseService.getGroups(authId)).map(g => g.id);
    }
    return profile;
  },

  login: async (email: string, password: string): Promise<User> => {
    if (isMockMode) {
        await delay(500);
        // Check mock DB for matching email
        const profiles = JSON.parse(localStorage.getItem('nova_db_profiles') || '[]');
        const user = profiles.find((p: any) => p.email === email);
        
        if (!user) throw new Error('User not found (Mock DB). Try signing up.');
        
        // Set mock session
        localStorage.setItem('nova_mock_session', JSON.stringify({ user_id: user.id, email }));
        
        return await authService._ensureUserProfile(user.id, email);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    return await authService._ensureUserProfile(data.user.id, data.user.email || '');
  },

  signup: async (name: string, email: string, password: string, username: string, permissions: AppPermissions, compliance: ComplianceSettings): Promise<{user: User, phrase: string}> => {
    // Check username uniqueness via DB
    const isTaken = await databaseService.checkUsernameTaken(username);
    if (isTaken) throw new Error('Username is already taken');

    // 1. Generate Real Wallet FIRST
    const walletKeys = await chainService.createWallet();
    
    let userId = '';

    if (isMockMode) {
        await delay(500);
        userId = 'user_' + Date.now();
        // Store basic auth data in mock profile since we don't have an auth table
        const mockSession = { user_id: userId, email };
        localStorage.setItem('nova_mock_session', JSON.stringify(mockSession));
    } else {
        // 2. Register in Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, username }
          }
        });

        if (error) throw error;
        if (!data.user) throw new Error('Signup failed');
        userId = data.user.id;
    }

    // 3. Create Profile with Wallet Address
    const userProfile = await authService._ensureUserProfile(userId, email, { name, username, permissions, compliance });
    
    // Return user and the sensitive phrase (to display ONCE)
    return { user: userProfile, phrase: walletKeys.mnemonic || '' };
  },

  logout: async () => {
    if (isMockMode) {
        localStorage.removeItem('nova_mock_session');
    } else {
        await supabase.auth.signOut();
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (isMockMode) {
        const session = JSON.parse(localStorage.getItem('nova_mock_session') || 'null');
        if (!session) return null;
        return await authService._ensureUserProfile(session.user_id, session.email);
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return await authService._ensureUserProfile(session.user.id, session.user.email || '');
  },

  getCurrentUserSync: (): User | null => {
     return null;
  },

  // Import Wallet via Phrase
  loginWithPhrase: async (phrase: string): Promise<User> => {
    // 1. Restore Keypair
    try {
       await chainService.restoreWallet(phrase);
    } catch (e) {
       throw new Error("Invalid Recovery Phrase");
    }

    // For mock mode, we can try to find a user associated with this wallet, or just create a temp one
    const keys = chainService.getWallets();
    
    // Mock User
    return {
        id: 'local_user',
        name: 'Imported Wallet',
        username: '@wallet',
        email: '',
        walletAddress: keys.evmAddress,
        isEmailVerified: true,
        isPhoneVerified: false,
        kyc: { level: 0, status: 'unverified', documents: [] },
        joinedDate: new Date().toISOString(),
        friends: [],
        groups: [],
        connectedApps: [],
        settings: { currency: 'USD', biometricsEnabled: false, hideBalances: false, autoLockTimer: 5, notifications: { priceAlerts: false, news: false, security: false, marketing: false }, backup: { cloudEnabled: false } },
        permissions: { camera: 'denied', photos: 'denied', microphone: 'denied', contacts: 'denied', location: 'denied', nfc: 'denied', notifications: 'denied' },
        compliance: { termsAccepted: true, privacyPolicyAccepted: true, dataProcessingConsent: true, marketingConsent: false, agreedToDate: Date.now() },
        cards: [],
        affiliateStats: { earnings: 0, referrals: 0, rank: 'Bronze' }
    };
  },

  // --- Profile Management ---

  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await databaseService.updateProfile(userId, updates);
    // Return fresh object
    const user = await authService._ensureUserProfile(userId, 'current@email.com'); 
    return user;
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    const taken = await databaseService.checkUsernameTaken(username);
    return !taken;
  },

  // --- Verification ---
  sendEmailVerification: async (email: string) => { },
  verifyEmailCode: async (uid: string, code: string) => { return true; }, 
  sendSmsVerification: async (phone: string) => { console.log('Sending SMS', phone); },
  verifySmsCode: async (uid: string, code: string) => { return true; },

  // --- Social & App Logic (Delegated to DB Service) ---
  
  getUserById: (id: string): User | null => {
     return null; // Impl requires fetch, simplified for now
  },

  addFriend: async (userId: string, identifier: string): Promise<User> => {
    await databaseService.addFriend(userId, identifier);
    return await authService._ensureUserProfile(userId, '');
  },

  getFriends: (ids: string[]): Friend[] => {
    return []; 
  },
  
  fetchFriends: async (userId: string): Promise<Friend[]> => {
      return await databaseService.getFriends(userId);
  },

  sendMessage: async (senderId: string, receiverId: string, text: string, isEphemeral: boolean, isGroup: boolean = false, attachments?: Attachment[]): Promise<Message> => {
    return await databaseService.sendMessage({
        senderId,
        receiverId,
        text, 
        isEphemeral,
        attachments
    });
  },

  getMessages: (userId: string, targetId: string, isGroup: boolean = false): Message[] => {
    return []; 
  },
  
  fetchMessages: async (userId: string, targetId: string, isGroup: boolean): Promise<Message[]> => {
      return await databaseService.getMessages(userId, targetId, isGroup);
  },

  createGroup: async (creatorId: string, name: string, type: 'private' | 'public', memberIds: string[], icon: string): Promise<Group> => {
    return await databaseService.createGroup(creatorId, name, type, memberIds);
  },

  getGroups: (userId: string): Group[] => { return []; },
  asyncFetchGroups: async (userId: string) => await databaseService.getGroups(userId),

  getPublicGroups: (): Group[] => { return []; },
  asyncFetchPublicGroups: async () => await databaseService.getPublicGroups(),

  joinGroup: async (userId: string, groupId: string): Promise<void> => {
    await databaseService.joinGroup(userId, groupId);
  },
  
  getGroupDetails: (id: string): Group | null => { return null; }, 
  asyncFetchGroupDetails: async (id: string) => await databaseService.getGroupDetails(id),

  // Apps
  authorizeApp: async (userId: string, app: ConnectedApp): Promise<User> => {
     await databaseService.authorizeApp(userId, app);
     return await authService._ensureUserProfile(userId, '');
  },

  revokeApp: async (userId: string, appId: string): Promise<User> => {
     await databaseService.revokeApp(userId, appId);
     return await authService._ensureUserProfile(userId, '');
  },

  updatePermission: async (userId: string, permission: keyof AppPermissions, status: string): Promise<User> => {
     // Map to DB update
     return await authService.updateProfile(userId, { permissions: { [permission]: status } as any });
  },

  getActivityLogs: (): ActivityLog[] => [],
  addActivityLog: (log: ActivityLog) => { console.log('Log:', log); },
  getNotifications: (): NotificationItem[] => [],
  markNotificationRead: (id: string) => { },
  
  submitKYCDocument: async (userId: string, type: string): Promise<User> => {
     return await authService.updateProfile(userId, { kyc: { level: 2, status: 'verified', documents: [] } });
  },

  exportUserData: async () => { },
  deleteAccount: async (userId: string) => { },

  createSupportTicket: async (subject: string) => { },
  getSupportTickets: (): SupportTicket[] => []
};

authService.init();
