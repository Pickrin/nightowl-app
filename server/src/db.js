import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'nightowl_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function formatIndianTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  }).format(date);
}

export function isNocturnalHappyHour(now = new Date()) {
  const istTimeStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  }).format(now);
  const istHour = parseInt(istTimeStr, 10);
  return istHour >= 0 && istHour < 4;
}

export function getCurrentChatCost() {
  return isNocturnalHappyHour() ? 10 : 20;
}

const SEED_PROFILES = [
  {
    id: 'seed-user-1',
    nickname: 'VelvetVixen',
    age: 24,
    gender: 'Female',
    seeking: 'Male',
    desireTags: ['Late-Night Chat', 'Secret Romance', 'Flirt & Fun'],
    midnightVibe: 'Late-Night Chai & Long Drives',
    datingIntention: 'Seeking a Secret Late-Night Romance',
    avatarMask: 'mask_fox_neon',
    avatarColor: '#ec4899',
    bio: 'Software engineer by day, night owl seeking witty banter and midnight chai runs.',
    lat: 12.9716,
    lng: 77.5946,
    coinsBalance: 500,
    isVip: true,
    isIncognito: false,
    referralCode: 'GHOST-VIXEN',
    lastActive: 'Just now',
    verified: true
  },
  {
    id: 'seed-user-2',
    nickname: 'ShadowWhisky',
    age: 27,
    gender: 'Male',
    seeking: 'Female',
    desireTags: ['Casual Dating', 'Discreet Meetups', 'No Strings Attached'],
    midnightVibe: 'Spontaneous Secret Meetups',
    datingIntention: 'Discreet & No Commitments (NSA)',
    avatarMask: 'mask_phantom_black',
    avatarColor: '#8b5cf6',
    bio: 'Fitness, fast cars, and zero drama. Looking for someone genuine and fun without commitments.',
    lat: 12.9780,
    lng: 77.6400,
    coinsBalance: 250,
    isVip: false,
    isIncognito: false,
    referralCode: 'GHOST-SHADOW',
    lastActive: '3m ago',
    verified: true
  },
  {
    id: 'seed-user-3',
    nickname: 'SpicyChaiLatte',
    age: 23,
    gender: 'Female',
    seeking: 'Anyone',
    desireTags: ['Flirt & Fun', 'Fantasy & Roleplay', 'Late-Night Chat'],
    midnightVibe: 'Flirty Banter & Rooftop Drinks',
    datingIntention: 'Single & Ready to Explore',
    avatarMask: 'mask_cat_gold',
    avatarColor: '#f59e0b',
    bio: 'Looking for a mysterious connection. If you have witty banter, we will get along great.',
    lat: 12.9650,
    lng: 77.6000,
    coinsBalance: 120,
    isVip: true,
    isIncognito: false,
    referralCode: 'GHOST-CHAI',
    lastActive: 'Online',
    verified: true
  },
  {
    id: 'seed-user-4',
    nickname: 'NeonGoddess',
    age: 26,
    gender: 'Female',
    seeking: 'Male',
    desireTags: ['Casual Dating', 'Secret Romance', 'Discreet Meetups'],
    midnightVibe: 'Spontaneous Secret Meetups',
    datingIntention: 'Discreet & No Commitments (NSA)',
    avatarMask: 'mask_cyber_magenta',
    avatarColor: '#d946ef',
    bio: 'Always traveling. In town for the weekend. Show me your secret rooftop spots.',
    lat: 12.9850,
    lng: 77.6100,
    coinsBalance: 300,
    isVip: false,
    isIncognito: false,
    referralCode: 'GHOST-NEON',
    lastActive: '12m ago',
    verified: false
  },
  {
    id: 'seed-user-5',
    nickname: 'CaffeineNomad',
    age: 29,
    gender: 'Male',
    seeking: 'Female',
    desireTags: ['Deep Anonymous Talk', 'Secret Romance', 'Late-Night Chat'],
    midnightVibe: 'Deep Conversations (Zero Judgement)',
    datingIntention: 'Just Here for Good Vibes & Chat',
    avatarMask: 'mask_owl_purple',
    avatarColor: '#6366f1',
    bio: 'Looking for deep nocturnal conversations. Let us talk about everything you would never tell your friends.',
    lat: 12.9550,
    lng: 77.5800,
    coinsBalance: 400,
    isVip: true,
    isIncognito: false,
    referralCode: 'GHOST-NOMAD',
    lastActive: 'Online',
    verified: true
  }
];

class NightOwlDB {
  constructor() {
    this.data = {
      users: {},
      chats: {},
      messages: {},
      requests: {}, // { requestId: { id, senderId, recipientId, status: 'pending'|'accepted'|'declined', createdAt } }
      transactions: [],
      reports: [],
      mediaVault: [],
      burnerCodes: {}
    };
    this.load();
    setInterval(() => this.purgeExpiredAdminData(), 60 * 60 * 1000);
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        if (!this.data.requests) this.data.requests = {};
        SEED_PROFILES.forEach(p => {
          if (!this.data.users[p.id]) {
            this.data.users[p.id] = { ...p, createdAt: new Date().toISOString() };
          }
        });
      } else {
        SEED_PROFILES.forEach(p => {
          this.data.users[p.id] = { ...p, createdAt: new Date().toISOString() };
        });
        this.save();
      }
    } catch (e) {
      console.error('Error loading DB:', e.message);
      this.data = { users: {}, chats: {}, messages: {}, requests: {}, transactions: [], reports: [], mediaVault: [], burnerCodes: {} };
      SEED_PROFILES.forEach(p => {
        this.data.users[p.id] = { ...p, createdAt: new Date().toISOString() };
      });
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving DB:', e.message);
    }
  }

  // 7-Day Purge
  purgeExpiredAdminData() {
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    let purgedChatsCount = 0;
    let purgedMediaCount = 0;

    Object.keys(this.data.chats).forEach(chatId => {
      const chat = this.data.chats[chatId];
      const chatAge = now - new Date(chat.createdAt).getTime();
      if (chatAge > SEVEN_DAYS_MS) {
        delete this.data.chats[chatId];
        delete this.data.messages[chatId];
        purgedChatsCount++;
      }
    });

    if (this.data.mediaVault) {
      const initialLength = this.data.mediaVault.length;
      this.data.mediaVault = this.data.mediaVault.filter(media => {
        const mediaAge = now - new Date(media.createdAt).getTime();
        return mediaAge <= SEVEN_DAYS_MS;
      });
      purgedMediaCount = initialLength - this.data.mediaVault.length;
    }

    if (this.data.burnerCodes) {
      Object.keys(this.data.burnerCodes).forEach(code => {
        const b = this.data.burnerCodes[code];
        if (now > new Date(b.expiresAt).getTime()) {
          delete this.data.burnerCodes[code];
        }
      });
    }

    this.save();
    return { purgedChatsCount, purgedMediaCount };
  }

  getUser(id) {
    return this.data.users[id] || null;
  }

  getUserByReferralCode(code) {
    if (!code) return null;
    return Object.values(this.data.users).find(u => u.referralCode === code.trim().toUpperCase()) || null;
  }

  createUser(user) {
    const refCode = 'GHOST-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    this.data.users[user.id] = {
      ...user,
      referralCode: refCode,
      coinsBalance: user.coinsBalance ?? 100,
      isVip: user.isVip ?? false,
      isIncognito: user.isIncognito ?? false,
      isBanned: false,
      createdAt: new Date().toISOString(),
      lastActive: 'Just now'
    };
    this.save();
    return this.data.users[user.id];
  }

  updateUser(id, updates) {
    if (!this.data.users[id]) return null;
    this.data.users[id] = { ...this.data.users[id], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[id];
  }

  // ==========================================
  // INBOX & CHAT LIMIT ENGINE: MAX 5 CHATS & MAX 10 REQUESTS
  // ==========================================
  getUserActiveChats(userId) {
    return Object.values(this.data.chats).filter(
      c => (c.user1Id === userId || c.user2Id === userId) && c.status === 'active'
    );
  }

  getUserPendingRequests(userId) {
    if (!this.data.requests) return [];
    return Object.values(this.data.requests).filter(
      r => r.recipientId === userId && r.status === 'pending'
    );
  }

  getInboxStatus(userId) {
    const activeChats = this.getUserActiveChats(userId);
    const pendingRequests = this.getUserPendingRequests(userId);
    return {
      activeChatsCount: activeChats.length,
      maxChats: 5,
      pendingRequestsCount: pendingRequests.length,
      maxRequests: 10,
      isChatLimitReached: activeChats.length >= 5,
      isRequestLimitReached: pendingRequests.length >= 10,
      mustRespondOrUnmatch: pendingRequests.length >= 10 || activeChats.length >= 5
    };
  }

  unmatchChat(chatId, userId) {
    if (this.data.chats[chatId]) {
      this.data.chats[chatId].status = 'unmatched';
      this.data.chats[chatId].unmatchedBy = userId;
      this.data.chats[chatId].unmatchedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  declineRequest(requestId) {
    if (this.data.requests && this.data.requests[requestId]) {
      this.data.requests[requestId].status = 'declined';
      this.save();
      return true;
    }
    return false;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  getNearbyUsers(currentUserId, userLat = 12.9716, userLng = 77.5946, filterTag = null) {
    const list = Object.values(this.data.users)
      .filter(u => u.id !== currentUserId && !u.isIncognito && !u.isBanned)
      .map(u => {
        const distanceKm = this.calculateDistance(userLat, userLng, u.lat, u.lng);
        return {
          id: u.id,
          nickname: u.nickname,
          age: u.age,
          gender: u.gender,
          seeking: u.seeking,
          desireTags: u.desireTags || [],
          midnightVibe: u.midnightVibe,
          datingIntention: u.datingIntention,
          avatarMask: u.avatarMask,
          avatarColor: u.avatarColor || '#a855f7',
          bio: u.bio,
          distanceKm: distanceKm < 0.3 ? 0.3 : distanceKm,
          isVip: u.isVip,
          lastActive: u.lastActive || 'Recently active',
          verified: u.verified || false
        };
      });

    let filtered = list;
    if (filterTag && filterTag !== 'All') {
      filtered = filtered.filter(u => u.desireTags.includes(filterTag));
    }

    return filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  deductCoins(userId, amount = 20, reason = 'unlock_chat') {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');
    if (user.coinsBalance < amount) {
      throw new Error(`Insufficient coins. You have ${user.coinsBalance} coins, but ${amount} are required.`);
    }
    user.coinsBalance -= amount;
    this.updateUser(userId, { coinsBalance: user.coinsBalance });
    
    this.data.transactions.push({
      id: 'tx-' + Date.now(),
      userId,
      type: 'debit',
      amountCoins: amount,
      reason,
      createdAt: new Date().toISOString()
    });
    this.save();
    return user.coinsBalance;
  }

  addCoins(userId, amount, priceInr = 0, packageName = 'Bonus Reward', orderId = null) {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');
    user.coinsBalance = (user.coinsBalance || 0) + amount;
    
    if (packageName?.toLowerCase().includes('vip')) {
      user.isVip = true;
      user.vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    this.updateUser(userId, { 
      coinsBalance: user.coinsBalance,
      isVip: user.isVip,
      vipExpiresAt: user.vipExpiresAt
    });

    const tx = {
      id: 'tx-pay-' + Date.now(),
      userId,
      type: 'credit',
      amountCoins: amount,
      priceInr,
      packageName,
      orderId: orderId || 'BONUS-' + Math.floor(Math.random() * 100000),
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    this.data.transactions.push(tx);
    this.save();
    return { user, transaction: tx };
  }

  createBurnerCode(userId) {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');

    const code = 'OWL-' + Math.floor(100 + Math.random() * 900);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    if (!this.data.burnerCodes) this.data.burnerCodes = {};
    this.data.burnerCodes[code] = {
      code,
      creatorId: userId,
      creatorName: user.nickname,
      createdAt: new Date().toISOString(),
      expiresAt,
      claimedBy: null
    };
    this.save();
    return this.data.burnerCodes[code];
  }

  claimBurnerCode(claimingUserId, code) {
    if (!this.data.burnerCodes || !this.data.burnerCodes[code]) {
      throw new Error('Invalid or expired Burner Code.');
    }

    const burner = this.data.burnerCodes[code];
    if (new Date() > new Date(burner.expiresAt)) {
      delete this.data.burnerCodes[code];
      this.save();
      throw new Error('This Burner Code has expired.');
    }

    if (burner.creatorId === claimingUserId) {
      throw new Error('You cannot scan your own Burner Code.');
    }

    burner.claimedBy = claimingUserId;
    const chat = this.getOrCreateChat(burner.creatorId, claimingUserId);
    this.save();
    return { chat, creator: this.getUser(burner.creatorId) };
  }

  getOrCreateChat(user1Id, user2Id) {
    const chatId = [user1Id, user2Id].sort().join('__');
    const user1 = this.getUser(user1Id);
    const user2 = this.getUser(user2Id);
    const now = new Date();

    if (!this.data.chats[chatId]) {
      this.data.chats[chatId] = {
        id: chatId,
        user1Id,
        user2Id,
        user1Name: user1?.nickname || 'Owl_1',
        user2Name: user2?.nickname || 'Owl_2',
        status: 'active',
        startedAt: formatIndianTime(now),
        startedIso: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        adminExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      this.data.messages[chatId] = [];
      this.save();
    }
    return this.data.chats[chatId];
  }

  saveMessage(chatId, message) {
    if (!this.data.messages[chatId]) {
      this.data.messages[chatId] = [];
    }

    const now = new Date();
    const sender = this.getUser(message.senderId);
    const recipient = this.getUser(message.recipientId);

    const msg = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      chatId,
      ...message,
      senderName: sender?.nickname || 'Anonymous',
      recipientName: recipient?.nickname || 'Anonymous',
      isPriorityWhisper: message.isPriorityWhisper || false,
      isMedia: !!message.mediaUrl,
      mediaUrl: message.mediaUrl || null,
      userExpiresInSeconds: message.mediaUrl ? 30 : 0,
      adminExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: now.toISOString(),
      formattedTime: formatIndianTime(now)
    };

    this.data.messages[chatId].push(msg);

    if (message.mediaUrl) {
      if (!this.data.mediaVault) this.data.mediaVault = [];
      this.data.mediaVault.unshift({
        id: 'vault-' + Date.now(),
        messageId: msg.id,
        chatId,
        senderId: message.senderId,
        senderName: sender?.nickname || 'Anonymous',
        recipientId: message.recipientId,
        recipientName: recipient?.nickname || 'Anonymous',
        mediaUrl: message.mediaUrl,
        startedAt: this.data.chats[chatId]?.startedAt || formatIndianTime(now),
        createdAt: now.toISOString(),
        adminExpiresAt: msg.adminExpiresAt
      });
    }

    if (this.data.chats[chatId]) {
      this.data.chats[chatId].updatedAt = now.toISOString();
      this.data.chats[chatId].lastMessage = message.isPriorityWhisper 
        ? `🔥 PRIORITY WHISPER: ${message.text}` 
        : (message.mediaUrl ? '📷 Photo (Vanishes in 30s)' : (message.text || 'Message'));
    }
    this.save();
    return msg;
  }

  burnChat(chatId, userId) {
    if (this.data.chats[chatId]) {
      this.data.chats[chatId].status = 'burned';
      this.data.chats[chatId].burnedBy = userId;
      this.data.chats[chatId].burnedAt = new Date().toISOString();
      this.save();
      return true;
    }
    return false;
  }

  getChatMessages(chatId) {
    return this.data.messages[chatId] || [];
  }

  getAllChats() {
    return Object.values(this.data.chats).map(c => {
      const messages = this.data.messages[c.id] || [];
      return {
        ...c,
        messageCount: messages.length,
        hasMedia: messages.some(m => m.mediaUrl)
      };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getAdminMediaVault() {
    return this.data.mediaVault || [];
  }

  deleteVaultMedia(mediaId) {
    if (!this.data.mediaVault) return false;
    this.data.mediaVault = this.data.mediaVault.filter(m => m.id !== mediaId);
    this.save();
    return true;
  }

  createReport(reporterId, reportedId, reason, details) {
    const reporter = this.getUser(reporterId);
    const reported = this.getUser(reportedId);
    const report = {
      id: 'rep-' + Date.now(),
      reporterId,
      reporterName: reporter?.nickname || 'Anonymous',
      reportedId,
      reportedName: reported?.nickname || 'Anonymous',
      reason,
      details,
      status: 'pending_review',
      createdAt: new Date().toISOString(),
      formattedTime: formatIndianTime(new Date())
    };
    this.data.reports.push(report);
    this.save();
    return report;
  }

  getAdminStats() {
    const usersList = Object.values(this.data.users);
    const chatsList = Object.values(this.data.chats);
    const totalTransactionsInr = this.data.transactions.reduce((acc, t) => acc + (t.priceInr || 0), 0);
    const mediaCount = (this.data.mediaVault || []).length;

    return {
      totalUsers: usersList.length,
      activeChats: chatsList.length,
      imagesInVault: mediaCount,
      totalRevenueInr: totalTransactionsInr,
      isHappyHour: isNocturnalHappyHour(),
      chatUnlockCost: getCurrentChatCost(),
      pendingReports: this.data.reports.filter(r => r.status === 'pending_review').length,
      serverTime: formatIndianTime(new Date())
    };
  }
}

export const db = new NightOwlDB();
