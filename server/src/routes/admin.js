import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Admin Overview & Financial Stats
router.get('/overview', (req, res) => {
  try {
    const stats = db.getAdminStats();
    res.json({
      success: true,
      stats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// List All Chats with Unique Start Date & Time
router.get('/chats', (req, res) => {
  try {
    const chats = db.getAllChats();
    res.json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat logs' });
  }
});

// View Full Chat Session Transcript
router.get('/chats/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = db.getChatMessages(chatId);
    const chat = db.data.chats[chatId];

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found or already incinerated.' });
    }

    res.json({
      success: true,
      chat,
      messages
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to inspect chat' });
  }
});

// 7-Day Admin Image Moderation Vault
router.get('/media-vault', (req, res) => {
  try {
    const mediaList = db.getAdminMediaVault();
    res.json({
      success: true,
      count: mediaList.length,
      retentionPolicy: '7 Days Auto-Purge',
      mediaVault: mediaList
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch media vault' });
  }
});

// Delete Inappropriate Image from Vault
router.post('/delete-media', (req, res) => {
  try {
    const { mediaId } = req.body;
    db.deleteVaultMedia(mediaId);
    res.json({ success: true, message: 'Image deleted from admin review vault.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Trigger Manual 7-Day Database Purge
router.post('/purge-now', (req, res) => {
  try {
    const result = db.purgeExpiredAdminData();
    res.json({
      success: true,
      message: '7-Day automated database purge executed successfully.',
      result
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to run purge routine' });
  }
});

// Ban Malicious User
router.post('/ban-user', (req, res) => {
  try {
    const { userId } = req.body;
    const updated = db.updateUser(userId, { isBanned: true });
    res.json({ success: true, message: `User ${userId} banned from the platform.`, user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

export default router;
