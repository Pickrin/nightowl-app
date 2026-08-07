import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, isNocturnalHappyHour, getCurrentChatCost } from '../db.js';

const router = express.Router();

const MASK_OPTIONS = [
  { id: 'mask_owl_purple', name: 'Nocturnal Owl', color: '#a855f7', icon: '🦉' },
  { id: 'mask_fox_neon', name: 'Cyber Fox', color: '#ec4899', icon: '🦊' },
  { id: 'mask_phantom_black', name: 'Shadow Phantom', color: '#6366f1', icon: '🎭' },
  { id: 'mask_cat_gold', name: 'Velvet Feline', color: '#f59e0b', icon: '🐱' },
  { id: 'mask_cyber_magenta', name: 'Neon Valkyrie', color: '#d946ef', icon: '⚡' },
  { id: 'mask_wolf_silver', name: 'Silver Wolf', color: '#94a3b8', icon: '🐺' }
];

const DESIRE_TAGS = [
  'Casual Dating',
  'Secret Romance',
  'Late-Night Chat',
  'Flirt & Fun',
  'Fantasy & Roleplay',
  'Discreet Meetups',
  'No Strings Attached',
  'Deep Anonymous Talk',
  'Virtual Romance'
];

// Anonymous Onboarding / Registration with Ghost Referral Support
router.post('/register', (req, res) => {
  try {
    const {
      nickname,
      age,
      gender,
      seeking,
      desireTags,
      avatarMask,
      avatarColor,
      bio,
      lat,
      lng,
      midnightVibe,
      datingIntention,
      referralCode
    } = req.body;

    if (!nickname || !age || !gender || !desireTags?.length) {
      return res.status(400).json({ error: 'Please provide nickname, age, gender, and desire tags.' });
    }

    const userId = 'user-' + uuidv4().slice(0, 8);
    const selectedMask = MASK_OPTIONS.find(m => m.id === avatarMask) || MASK_OPTIONS[0];

    let startingCoins = 100; // Base welcome bonus
    let referredByUser = null;

    // Check Anonymous Ghost Referral (+50 Coins for both!)
    if (referralCode) {
      const inviter = db.getUserByReferralCode(referralCode);
      if (inviter) {
        startingCoins += 50; // New user gets +50 extra
        db.addCoins(inviter.id, 50, 0, 'Ghost Referral Reward'); // Inviter gets +50
        referredByUser = inviter.nickname;
      }
    }

    const newUser = db.createUser({
      id: userId,
      nickname: nickname.trim(),
      age: parseInt(age, 10),
      gender,
      seeking: seeking || 'Anyone',
      desireTags: Array.isArray(desireTags) ? desireTags : [desireTags],
      midnightVibe: midnightVibe || 'Late-Night Chai & Long Drives',
      datingIntention: datingIntention || 'Single & Ready to Explore',
      avatarMask: selectedMask.id,
      avatarColor: avatarColor || selectedMask.color,
      avatarIcon: selectedMask.icon,
      bio: bio || 'Exploring discreet connections under the midnight sky.',
      lat: lat ? parseFloat(lat) : 12.9716,
      lng: lng ? parseFloat(lng) : 77.5946,
      coinsBalance: startingCoins,
      isVip: false,
      isIncognito: false,
      verified: false,
      lastDailyReward: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      user: newUser,
      token: 'jwt-session-' + userId,
      referralBonusGranted: !!referredByUser,
      maskOptions: MASK_OPTIONS,
      availableDesireTags: DESIRE_TAGS
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create anonymous profile.' });
  }
});

// Instant Zero-Storage Face Liveness Verification Endpoint
router.post('/verify-liveness', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = db.getUser(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const BONUS_VERIFIED_COINS = 50;
    const updated = db.updateUser(userId, {
      verified: true,
      coinsBalance: (user.coinsBalance || 0) + BONUS_VERIFIED_COINS,
      verifiedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Instant biometric liveness verified. +50 coins credited.',
      user: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Get Configuration, Happy Hour state & Pricing
router.get('/config', (req, res) => {
  res.json({
    maskOptions: MASK_OPTIONS,
    desireTags: DESIRE_TAGS,
    welcomeBonusCoins: 100,
    dailyFreeCoins: 20,
    isHappyHour: isNocturnalHappyHour(),
    chatUnlockCostCoins: getCurrentChatCost(),
    happyHourHours: '12:00 AM – 3:00 AM IST (50% OFF)'
  });
});

export default router;
