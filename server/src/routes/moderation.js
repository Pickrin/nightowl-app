import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Report an Anonymous Profile / Message (Google Play UGC requirement)
router.post('/report', (req, res) => {
  try {
    const reporterId = req.headers['x-user-id'] || 'anonymous';
    const { reportedId, reason, details } = req.body;

    if (!reportedId || !reason) {
      return res.status(400).json({ error: 'Reported user ID and reason are required.' });
    }

    const report = db.createReport(reporterId, reportedId, reason, details);
    res.json({
      success: true,
      message: 'Report submitted for human & automated review. The user has been muted from your radar.',
      reportId: report.id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// Automated AI Moderation Check (simulates Google Vision SafeSearch / AWS Rekognition)
router.post('/check-media', (req, res) => {
  try {
    const { mediaUrl, isAvatar } = req.body;
    // In production, this proxies to Google Cloud Vision API SafeSearch
    const isExplicit = false; // Mock approval

    res.json({
      safe: !isExplicit,
      requiresBlur: isAvatar ? false : true,
      status: 'approved_for_ephemeral_vault'
    });
  } catch (err) {
    res.status(500).json({ error: 'Moderation check failed' });
  }
});

export default router;
