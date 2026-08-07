import express from 'express';
import { db, getCurrentChatCost, isNocturnalHappyHour } from '../db.js';

const router = express.Router();

const COIN_PACKAGES = [
  { id: 'pack_100', coins: 100, priceInr: 49, label: 'Starter Nocturnal Pack', bonus: '' },
  { id: 'pack_500', coins: 550, priceInr: 199, label: 'Midnight Romance Vault', bonus: '+50 Extra Coins' },
  { id: 'pack_1500', coins: 1800, priceInr: 499, label: 'Unlimited AfterHours VIP', bonus: '+300 Extra Coins' }
];

const VIP_SUBSCRIPTIONS = [
  { id: 'sub_vip_week', name: '7-Day Midnight Pass', priceInr: 149, duration: '1 Week', perks: ['Unlimited Chat Unlocks', 'Incognito Radar Mode', 'VIP Golden Glow'] },
  { id: 'sub_vip_month', name: 'Monthly Nocturnal Elite', priceInr: 499, duration: '1 Month', perks: ['Unlimited Secret Chats', 'All Desire Filters', 'Priority Match Queue', 'VIP Golden Mask'] }
];

// Get User Inbox Capacity Status (Max 5 Chats / Max 10 Requests)
router.get('/inbox-status', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const status = db.getInboxStatus(userId);
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unlock Chat with Capacity Enforcement (Max 5 Active Chats, Max 10 Requests)
router.post('/unlock-chat', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { targetUserId } = req.body;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: 'Missing userId or targetUserId.' });
    }

    const user = db.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const targetUser = db.getUser(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'Target user not found.' });

    // 1. Check Initiator Active Chats Limit (Max 5)
    const initiatorActive = db.getUserActiveChats(userId);
    if (initiatorActive.length >= 5) {
      return res.status(403).json({
        error: 'Active chat limit reached (5/5). You must unmatch or burn an existing chat to connect with new owls.',
        capacityExceeded: true,
        limitType: 'active_chats_limit'
      });
    }

    // 2. Check Target Pending Requests Limit (Max 10)
    const targetPending = db.getUserPendingRequests(targetUserId);
    if (targetPending.length >= 10) {
      return res.status(403).json({
        error: `This owl's request queue is at full capacity (10/10). They must respond or unmatch before accepting new chats.`,
        capacityExceeded: true,
        limitType: 'request_queue_full'
      });
    }

    const cost = user.isVip ? 0 : getCurrentChatCost();

    if (user.coinsBalance < cost) {
      return res.status(402).json({
        error: `Insufficient coins. Unlocking requires ${cost} coins.`,
        insufficientCoins: true,
        requiredCoins: cost,
        currentCoins: user.coinsBalance
      });
    }

    const remainingCoins = db.deductCoins(userId, cost, `unlock_chat_${targetUserId}`);
    const chat = db.getOrCreateChat(userId, targetUserId);

    return res.json({
      success: true,
      message: `Secret chat unlocked for ${cost} coins!`,
      chatId: chat.id,
      coinsBalance: remainingCoins,
      costPaid: cost,
      isHappyHour: isNocturnalHappyHour(),
      inboxStatus: db.getInboxStatus(userId),
      chat
    });
  } catch (err) {
    console.error('Chat unlock error:', err);
    return res.status(500).json({ error: err.message || 'Failed to unlock chat.' });
  }
});

// Unmatch Chat to Free Active Slot
router.post('/unmatch', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { chatId } = req.body;

    if (!userId || !chatId) return res.status(400).json({ error: 'Missing chatId' });

    db.unmatchChat(chatId, userId);
    res.json({
      success: true,
      message: 'Chat unmatched. Active slot freed.',
      inboxStatus: db.getInboxStatus(userId)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Priority Whisper (50 Coins)
router.post('/priority-whisper', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { targetUserId, text } = req.body;

    if (!userId || !targetUserId || !text) {
      return res.status(400).json({ error: 'Missing parameters.' });
    }

    const WHISPER_COST = 50;
    const user = db.getUser(userId);
    if (!user || user.coinsBalance < WHISPER_COST) {
      return res.status(402).json({ error: 'Priority Whisper requires 50 coins.', insufficientCoins: true });
    }

    const remaining = db.deductCoins(userId, WHISPER_COST, 'priority_whisper');
    const chat = db.getOrCreateChat(userId, targetUserId);
    const msg = db.saveMessage(chat.id, {
      senderId: userId,
      recipientId: targetUserId,
      text: text.trim(),
      isPriorityWhisper: true
    });

    res.json({
      success: true,
      message: 'Priority Whisper delivered to top of inbox!',
      coinsBalance: remaining,
      messageData: msg
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate 24-Hour Disposable Burner Code (₹49 or Free for VIP)
router.post('/generate-burner-code', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const burner = db.createBurnerCode(userId);
    res.json({
      success: true,
      burnerCode: burner.code,
      expiresAt: burner.expiresAt,
      qrPayload: `nightowl://burner/${burner.code}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claim / Scan 24-Hour Burner Code
router.post('/claim-burner-code', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { code } = req.body;

    if (!userId || !code) return res.status(400).json({ error: 'Missing code' });

    const result = db.claimBurnerCode(userId, code.trim().toUpperCase());
    res.json({
      success: true,
      message: `Connected anonymously with ${result.creator.nickname}!`,
      chat: result.chat,
      partner: result.creator
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Google Play In-App Purchase Verification
router.post('/verify-play-purchase', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { packageId, googlePlayOrderId } = req.body;

    const coinPack = COIN_PACKAGES.find(p => p.id === packageId);
    const vipSub = VIP_SUBSCRIPTIONS.find(s => s.id === packageId);

    if (coinPack) {
      const { user, transaction } = db.addCoins(userId, coinPack.coins, coinPack.priceInr, coinPack.label, googlePlayOrderId);
      return res.json({
        success: true,
        message: `Successfully credited ${coinPack.coins} coins to your vault!`,
        coinsBalance: user.coinsBalance,
        isVip: user.isVip,
        transaction
      });
    }

    if (vipSub) {
      const { user, transaction } = db.addCoins(userId, 500, vipSub.priceInr, vipSub.name, googlePlayOrderId);
      return res.json({
        success: true,
        message: `🎉 VIP Nocturnal Elite Activated! Enjoy unlimited unlocks for ${vipSub.duration}.`,
        coinsBalance: user.coinsBalance,
        isVip: true,
        vipExpiresAt: user.vipExpiresAt,
        transaction
      });
    }

    return res.status(400).json({ error: 'Invalid product or package ID.' });
  } catch (err) {
    console.error('Purchase error:', err);
    return res.status(500).json({ error: 'Failed to credit coins.' });
  }
});

// Daily Reward Claim (+20 Coins Every 24h)
router.post('/claim-daily', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = db.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const now = new Date();
    if (user.lastDailyReward) {
      const last = new Date(user.lastDailyReward);
      const hoursSince = (now - last) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSince);
        return res.status(400).json({
          error: `Daily gift already claimed. Next reward in ${hoursRemaining}h.`
        });
      }
    }

    const { user: updated } = db.addCoins(userId, 20, 0, 'Daily Free Nocturnal Reward');
    db.updateUser(userId, { lastDailyReward: now.toISOString() });

    return res.json({
      success: true,
      message: '🎁 +20 Daily Free Coins credited!',
      coinsBalance: updated.coinsBalance
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to claim daily reward.' });
  }
});

export default router;
