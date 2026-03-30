import express from 'express';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// ── Get my notifications ──
router.get('/', authenticate, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mark as read ──
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Mark all as read ──
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Unread count ──
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
