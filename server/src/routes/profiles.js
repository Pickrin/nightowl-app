import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Get Nearby Radar Feed with Distance & Desire Tag Filter
router.get('/nearby', (req, res) => {
  try {
    const currentUserId = req.headers['x-user-id'] || 'guest';
    const lat = req.query.lat ? parseFloat(req.query.lat) : 12.9716;
    const lng = req.query.lng ? parseFloat(req.query.lng) : 77.5946;
    const tag = req.query.tag || null;

    const nearbyList = db.getNearbyUsers(currentUserId, lat, lng, tag);
    res.json({
      success: true,
      count: nearbyList.length,
      users: nearbyList
    });
  } catch (err) {
    console.error('Error fetching nearby profiles:', err);
    res.status(500).json({ error: 'Failed to fetch radar feed.' });
  }
});

// Update Profile & Desire Tags
router.put('/me', (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { nickname, bio, desireTags, avatarMask, avatarColor, isIncognito } = req.body;
    const updated = db.updateUser(userId, {
      ...(nickname && { nickname: nickname.trim() }),
      ...(bio !== undefined && { bio }),
      ...(desireTags && { desireTags }),
      ...(avatarMask && { avatarMask }),
      ...(avatarColor && { avatarColor }),
      ...(isIncognito !== undefined && { isIncognito })
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Fetch Single Anonymous Profile
router.get('/:id', (req, res) => {
  const profile = db.getUser(req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  // Exclude raw coordinates for privacy, provide masked data
  res.json({
    id: profile.id,
    nickname: profile.nickname,
    age: profile.age,
    gender: profile.gender,
    seeking: profile.seeking,
    desireTags: profile.desireTags || [],
    avatarMask: profile.avatarMask,
    avatarColor: profile.avatarColor,
    bio: profile.bio,
    photos: profile.photos || [],
    isVip: profile.isVip,
    lastActive: profile.lastActive,
    verified: profile.verified
  });
});

export default router;
