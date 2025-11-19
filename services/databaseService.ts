
import { supabase, isMockMode } from './supabaseClient';
import { User, UserSettings, Message, Friend, Group, ConnectedApp, ActivityLog, Product, Order } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Mock DB Helpers
const MOCK_DELAY = 300;
const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const databaseService = {
  
  // --- Profiles ---
  
  async getProfile(userId: string): Promise<User | null> {
    if (isMockMode) {
        await delay(MOCK_DELAY);
        const profiles = getLocal('nova_db_profiles');
        const profile = profiles.find((p: any) => p.id === userId);
        return profile || null;
    }

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) return null;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      return {
        ...this._mapProfileToUser(profile),
        settings: settings ? this._mapSettings(settings) : this._defaultSettings()
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async createProfile(user: User) {
      if (isMockMode) {
          await delay(MOCK_DELAY);
          const profiles = getLocal('nova_db_profiles');
          // Upsert
          const existingIndex = profiles.findIndex((p: any) => p.id === user.id);
          if (existingIndex >= 0) {
              profiles[existingIndex] = user;
          } else {
              profiles.push(user);
          }
          setLocal('nova_db_profiles', profiles);
          return;
      }

      const { error } = await supabase.from('profiles').insert({
          id: user.id,
          username: user.username,
          full_name: user.name,
          avatar_url: user.profileImage,
          kyc_level: user.kyc.level,
          is_verified: user.kyc.status === 'verified'
      });
      
      if (error) throw error;

      await supabase.from('user_settings').insert({
          user_id: user.id,
          currency: user.settings.currency,
          biometrics_enabled: user.settings.biometricsEnabled,
          hide_balances: user.settings.hideBalances
      });
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    if (isMockMode) {
        await delay(MOCK_DELAY);
        const profiles = getLocal('nova_db_profiles');
        const idx = profiles.findIndex((p: any) => p.id === userId);
        if (idx >= 0) {
            // Deep merge for settings/kyc
            const current = profiles[idx];
            profiles[idx] = {
                ...current,
                ...updates,
                settings: { ...current.settings, ...(updates.settings || {}) },
                kyc: { ...current.kyc, ...(updates.kyc || {}) },
                permissions: { ...current.permissions, ...(updates.permissions || {}) }
            };
            setLocal('nova_db_profiles', profiles);
        }
        return;
    }

    const profileUpdates: any = {};
    const settingUpdates: any = {};

    if (updates.name) profileUpdates.full_name = updates.name;
    if (updates.profileImage) profileUpdates.avatar_url = updates.profileImage;
    if (updates.username) profileUpdates.username = updates.username;
    if (updates.kyc) {
        profileUpdates.kyc_level = updates.kyc.level;
        profileUpdates.is_verified = updates.kyc.status === 'verified';
    }
    
    if (updates.settings) {
        if (updates.settings.currency) settingUpdates.currency = updates.settings.currency;
        if (updates.settings.biometricsEnabled !== undefined) settingUpdates.biometrics_enabled = updates.settings.biometricsEnabled;
        if (updates.settings.hideBalances !== undefined) settingUpdates.hide_balances = updates.settings.hideBalances;
        if (updates.settings.antiPhishingCode !== undefined) settingUpdates.anti_phishing_code = updates.settings.antiPhishingCode;
    }

    if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('profiles').update(profileUpdates).eq('id', userId);
    }
    if (Object.keys(settingUpdates).length > 0) {
        await supabase.from('user_settings').update(settingUpdates).eq('user_id', userId);
    }
  },

  async checkUsernameTaken(username: string): Promise<boolean> {
      if (isMockMode) {
          const profiles = getLocal('nova_db_profiles');
          return profiles.some((p: any) => p.username === username);
      }
      const { data } = await supabase.from('profiles').select('id').eq('username', username).single();
      return !!data;
  },

  // --- Messages ---

  async getMessages(userId: string, otherId: string, isGroup: boolean): Promise<Message[]> {
    if (isMockMode) {
        const msgs = getLocal('nova_db_messages');
        return msgs.filter((m: Message) => {
            if (isGroup) return m.receiverId === otherId;
            return (m.senderId === userId && m.receiverId === otherId) || (m.senderId === otherId && m.receiverId === userId);
        }).sort((a: Message, b: Message) => a.timestamp - b.timestamp);
    }

    let query = supabase.from('messages').select('*');
    
    if (isGroup) {
        query = query.eq('receiver_id', otherId);
    } else {
        query = query.or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) return [];

    return data.map((m: any) => ({
        id: m.id.toString(),
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        text: m.content_encrypted, 
        timestamp: new Date(m.created_at).getTime(),
        isRead: m.is_read,
        isEphemeral: m.is_ephemeral,
        attachments: m.attachments || undefined,
        isGroup: isGroup
    }));
  },

  async sendMessage(message: Partial<Message>): Promise<Message> {
     const newMsg = {
         ...message,
         id: 'msg_' + Date.now(),
         timestamp: Date.now(),
         isRead: false
     } as Message;

     if (isMockMode) {
         const msgs = getLocal('nova_db_messages');
         msgs.push(newMsg);
         setLocal('nova_db_messages', msgs);
         return newMsg;
     }

     const { data, error } = await supabase.from('messages').insert({
         sender_id: message.senderId,
         receiver_id: message.receiverId,
         content_encrypted: message.text,
         attachments: message.attachments,
         is_ephemeral: message.isEphemeral
     }).select().single();
     
     if (error) throw error;
     
     return { ...newMsg, id: data.id.toString(), timestamp: new Date(data.created_at).getTime() };
  },

  // Realtime Subscription
  subscribeToMessages(callback: (payload: any) => void): RealtimeChannel | null {
      if (isMockMode) {
          // Polling simulation for mock mode
          const interval = setInterval(() => {
              const msgs = getLocal('nova_db_messages');
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg && lastMsg.timestamp > Date.now() - 2000) {
                  callback(lastMsg);
              }
          }, 2000);
          return { unsubscribe: () => clearInterval(interval) } as any;
      }

      return supabase
        .channel('public:messages')
        .on(
            'postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'messages' }, 
            (payload) => {
                const msg: Message = {
                    id: payload.new.id.toString(),
                    senderId: payload.new.sender_id,
                    receiverId: payload.new.receiver_id,
                    text: payload.new.content_encrypted,
                    timestamp: new Date(payload.new.created_at).getTime(),
                    isRead: payload.new.is_read,
                    isEphemeral: payload.new.is_ephemeral,
                    attachments: payload.new.attachments
                };
                callback(msg);
            }
        )
        .subscribe();
  },

  // --- Contacts ---

  async getFriends(userId: string): Promise<Friend[]> {
     if (isMockMode) {
         const contacts = getLocal('nova_db_contacts').filter((c: any) => c.userId === userId);
         const profiles = getLocal('nova_db_profiles');
         return contacts.map((c: any) => {
             const p = profiles.find((prof: any) => prof.id === c.contactId);
             if (!p) return null;
             return {
                 id: p.id,
                 name: p.name,
                 username: p.username,
                 profileImage: p.profileImage,
                 status: 'online',
                 lastSeen: 'Just now'
             };
         }).filter(Boolean);
     }

     const { data, error } = await supabase
        .from('contacts')
        .select(`contact_id, profiles:contact_id (username, full_name, avatar_url)`)
        .eq('user_id', userId);

     if (error) return [];

     return data.map((row: any) => ({
         id: row.contact_id,
         name: row.profiles.full_name,
         username: row.profiles.username,
         profileImage: row.profiles.avatar_url,
         status: 'offline', 
         lastSeen: 'Recently'
     }));
  },

  async addFriend(userId: string, friendUsername: string): Promise<void> {
      if (isMockMode) {
          const profiles = getLocal('nova_db_profiles');
          const friend = profiles.find((p: any) => p.username === friendUsername || p.username === '@'+friendUsername);
          if (!friend) throw new Error('User not found');
          if (friend.id === userId) throw new Error('Cannot add self');
          
          const contacts = getLocal('nova_db_contacts');
          if (!contacts.some((c: any) => c.userId === userId && c.contactId === friend.id)) {
              contacts.push({ userId, contactId: friend.id });
              // Bi-directional for mock simplicity
              contacts.push({ userId: friend.id, contactId: userId });
              setLocal('nova_db_contacts', contacts);
          }
          return;
      }

      const { data: friend, error: findError } = await supabase
         .from('profiles')
         .select('id')
         .eq('username', friendUsername)
         .single();
      
      if (findError || !friend) throw new Error('User not found');
      if (friend.id === userId) throw new Error('Cannot add self');

      const { data: existing } = await supabase.from('contacts').select('id').match({user_id: userId, contact_id: friend.id});
      if (existing && existing.length > 0) return;

      const { error: insertError } = await supabase
         .from('contacts')
         .insert({ user_id: userId, contact_id: friend.id });
      
      if (insertError) throw insertError;
  },

  // --- Groups ---
  
  async createGroup(creatorId: string, name: string, type: string, memberIds: string[]): Promise<Group> {
      const newGroup: Group = {
          id: 'grp_' + Date.now(),
          name,
          type: type as any,
          members: [creatorId, ...memberIds],
          admins: [creatorId],
          icon: '👥',
          lastMessage: 'Group Created',
          lastMessageTime: Date.now()
      };

      if (isMockMode) {
          const groups = getLocal('nova_db_groups');
          groups.push(newGroup);
          setLocal('nova_db_groups', groups);
          return newGroup;
      }

      const { data: group, error: groupError } = await supabase.from('groups').insert({
          name, type, created_by: creatorId, icon: '👥'
      }).select().single();
      
      if (groupError) throw groupError;

      const allMembers = [creatorId, ...memberIds].map(uid => ({
          group_id: group.id,
          user_id: uid,
          role: uid === creatorId ? 'admin' : 'member'
      }));
      
      await supabase.from('group_members').insert(allMembers);

      return newGroup;
  },

  async getGroups(userId: string): Promise<Group[]> {
      if (isMockMode) {
          const groups = getLocal('nova_db_groups');
          return groups.filter((g: Group) => g.members.includes(userId));
      }

      const { data, error } = await supabase
          .from('group_members')
          .select('group_id, groups(*)')
          .eq('user_id', userId);
          
      if (error) return [];

      return data.map((row: any) => ({
          id: row.groups.id,
          name: row.groups.name,
          type: row.groups.type,
          members: [], 
          admins: [],
          icon: row.groups.icon,
          lastMessage: 'Active',
          lastMessageTime: new Date(row.groups.created_at).getTime()
      }));
  },
  
  async getPublicGroups(): Promise<Group[]> {
      if (isMockMode) {
          const groups = getLocal('nova_db_groups');
          return groups.filter((g: Group) => g.type === 'public');
      }
      const { data } = await supabase.from('groups').select('*').eq('type', 'public').limit(10);
      if (!data) return [];
      return data.map((g: any) => ({
          id: g.id, name: g.name, type: 'public', members: [], admins: [], icon: g.icon
      }));
  },

  async joinGroup(userId: string, groupId: string) {
      if (isMockMode) {
          const groups = getLocal('nova_db_groups');
          const idx = groups.findIndex((g: Group) => g.id === groupId);
          if (idx >= 0 && !groups[idx].members.includes(userId)) {
              groups[idx].members.push(userId);
              setLocal('nova_db_groups', groups);
          }
          return;
      }
      await supabase.from('group_members').insert({ group_id: groupId, user_id: userId });
  },

  async getGroupDetails(groupId: string): Promise<Group | null> {
      if (isMockMode) {
          const groups = getLocal('nova_db_groups');
          return groups.find((g: Group) => g.id === groupId) || null;
      }

      const { data } = await supabase.from('groups').select('*').eq('id', groupId).single();
      if (!data) return null;
      
      const { data: members } = await supabase.from('group_members').select('user_id').eq('group_id', groupId);
      
      return {
          id: data.id,
          name: data.name,
          type: data.type,
          members: members?.map((m: any) => m.user_id) || [],
          admins: [data.created_by],
          icon: data.icon
      };
  },

  // --- Connected Apps ---

  async getConnectedApps(userId: string): Promise<ConnectedApp[]> {
      if (isMockMode) {
          return getLocal('nova_db_apps').filter((a: any) => a.userId === userId);
      }
      const { data } = await supabase.from('connected_apps').select('*').eq('user_id', userId);
      if (!data) return [];
      return data.map((app: any) => ({
          id: app.id,
          name: app.name,
          domain: app.domain,
          icon: app.icon,
          permissions: app.permissions || [],
          connectedAt: new Date(app.created_at).getTime()
      }));
  },

  async authorizeApp(userId: string, app: Partial<ConnectedApp>): Promise<void> {
      if (isMockMode) {
          const apps = getLocal('nova_db_apps');
          apps.push({ ...app, userId });
          setLocal('nova_db_apps', apps);
          return;
      }
      await supabase.from('connected_apps').insert({
          user_id: userId,
          name: app.name,
          domain: app.domain,
          icon: app.icon,
          permissions: app.permissions
      });
  },

  async revokeApp(userId: string, appId: string): Promise<void> {
      if (isMockMode) {
          const apps = getLocal('nova_db_apps').filter((a: any) => !(a.id === appId && a.userId === userId));
          setLocal('nova_db_apps', apps);
          return;
      }
      await supabase.from('connected_apps').delete().match({ id: appId, user_id: userId });
  },

  // --- Marketplace ---

  async fetchProducts(filters: { category?: string, sellerId?: string, search?: string }): Promise<Product[]> {
     if (isMockMode) {
         let products = getLocal('nova_db_products');
         if (filters.category && filters.category !== 'All') products = products.filter((p: Product) => p.category === filters.category);
         if (filters.sellerId) products = products.filter((p: Product) => p.sellerId === filters.sellerId);
         if (filters.search) products = products.filter((p: Product) => p.title.toLowerCase().includes(filters.search!.toLowerCase()));
         return products;
     }

     let query = supabase.from('market_products').select('*').order('created_at', { ascending: false });

     if (filters.category && filters.category !== 'All') {
         query = query.eq('category', filters.category);
     }
     if (filters.sellerId) {
         query = query.eq('seller_id', filters.sellerId);
     }
     if (filters.search) {
         query = query.ilike('title', `%${filters.search}%`);
     }

     const { data, error } = await query;
     if (error) return [];

     return data.map((p: any) => ({
         id: p.id,
         sellerId: p.seller_id,
         title: p.title,
         description: p.description,
         price: p.price,
         currency: p.currency,
         images: p.images,
         category: p.category,
         subcategory: p.subcategory,
         condition: p.condition,
         shippingOptions: p.shipping_options,
         location: p.location,
         reviews: [], 
         createdAt: new Date(p.created_at).getTime()
     }));
  },

  async createProduct(product: Product): Promise<void> {
     if (isMockMode) {
         const products = getLocal('nova_db_products');
         products.push(product);
         setLocal('nova_db_products', products);
         return;
     }

     const { error } = await supabase.from('market_products').insert({
         seller_id: product.sellerId,
         title: product.title,
         description: product.description,
         price: product.price,
         currency: product.currency,
         images: product.images,
         category: product.category,
         subcategory: product.subcategory,
         condition: product.condition,
         location: product.location,
         shipping_options: product.shippingOptions
     });
     if (error) throw error;
  },

  async createOrder(order: Order): Promise<void> {
     if (isMockMode) {
         const orders = getLocal('nova_db_orders');
         orders.push(order);
         setLocal('nova_db_orders', orders);
         return;
     }

     const { error } = await supabase.from('market_orders').insert({
         product_id: order.productId,
         buyer_id: order.buyerId,
         seller_id: order.sellerId,
         status: order.status,
         price: order.price,
         currency: order.currency,
         shipping_method: order.shippingMethod
     });
     if (error) throw error;
  },

  async fetchOrders(userId: string, role: 'buyer' | 'seller'): Promise<Order[]> {
      if (isMockMode) {
          const orders = getLocal('nova_db_orders');
          return orders.filter((o: Order) => role === 'buyer' ? o.buyerId === userId : o.sellerId === userId);
      }

      const column = role === 'buyer' ? 'buyer_id' : 'seller_id';
      const { data, error } = await supabase
          .from('market_orders')
          .select('*, market_products(title, images)')
          .eq(column, userId)
          .order('created_at', { ascending: false });
      
      if (error) return [];

      return data.map((o: any) => ({
          id: o.id,
          productId: o.product_id,
          productTitle: o.market_products?.title || 'Unknown Item',
          productImage: o.market_products?.images?.[0] || '',
          price: o.price,
          currency: o.currency,
          buyerId: o.buyer_id,
          sellerId: o.seller_id,
          date: new Date(o.created_at).getTime(),
          status: o.status,
          shippingMethod: o.shipping_method,
          trackingNumber: o.tracking_number
      }));
  },

  async updateOrderTracking(orderId: string, tracking: string): Promise<void> {
      if (isMockMode) {
          const orders = getLocal('nova_db_orders');
          const idx = orders.findIndex((o: Order) => o.id === orderId);
          if (idx >= 0) {
              orders[idx].status = 'shipped';
              orders[idx].trackingNumber = tracking;
              setLocal('nova_db_orders', orders);
          }
          return;
      }
      await supabase.from('market_orders').update({ 
          status: 'shipped', 
          tracking_number: tracking 
      }).eq('id', orderId);
  },

  async getNotifications(): Promise<any[]> { return []; },
  async logActivity(log: ActivityLog): Promise<void> { },

  // Helpers for mapping
  _mapProfileToUser(profile: any): Partial<User> {
      return {
        id: profile.id,
        name: profile.full_name || 'User',
        username: profile.username || `@user`,
        walletAddress: profile.wallet_address || '',
        profileImage: profile.avatar_url,
        kyc: { level: profile.kyc_level || 0, status: profile.is_verified ? 'verified' : 'unverified', documents: [] },
        joinedDate: profile.created_at
      };
  },
  _mapSettings(settings: any): UserSettings {
      return {
          currency: settings?.currency || 'USD',
          biometricsEnabled: settings?.biometrics_enabled || false,
          hideBalances: settings?.hide_balances || false,
          autoLockTimer: settings?.auto_lock_timer || 5,
          antiPhishingCode: settings?.anti_phishing_code,
          notifications: {
            priceAlerts: true,
            news: true,
            security: true,
            marketing: false
          },
          backup: { cloudEnabled: false }
      };
  },
  _defaultSettings(): UserSettings {
      return {
          currency: 'USD',
          biometricsEnabled: false,
          hideBalances: false,
          autoLockTimer: 5,
          notifications: { priceAlerts: true, news: true, security: true, marketing: false },
          backup: { cloudEnabled: false }
      };
  }
};
