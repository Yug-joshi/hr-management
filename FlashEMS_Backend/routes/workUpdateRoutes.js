import express from 'express';
import WorkUpdate from '../models/WorkUpdate.js';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper: attach user info
const attachUserInfo = async (records) => {
  const ids = [...new Set(records.map(r => r.employeeId).filter(id => id && !String(id).startsWith('demo_')))];
  const users = await User.find({ _id: { $in: ids } }).select('name email department').lean();
  const userMap = {};
  users.forEach(u => { userMap[String(u._id)] = u; });
  return records.map(r => {
    const obj = r.toObject ? r.toObject() : r;
    obj.employeeId = userMap[String(obj.employeeId)] || { _id: obj.employeeId, name: String(obj.employeeId), email: '', department: '' };
    return obj;
  });
};

// ── Submit work update (Employee) ──
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const update = await WorkUpdate.create({ employeeId: req.user.id, title, description, date: date || new Date() });
    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get my updates ──
router.get('/my', authenticate, async (req, res) => {
  try {
    const updates = await WorkUpdate.find({ employeeId: req.user.id }).sort({ date: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get all updates (Admin/HR) ──
router.get('/all', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const updates = await WorkUpdate.find().sort({ date: -1 });
    const enriched = await attachUserInfo(updates);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Add feedback (Admin/HR) ──
router.put('/:id/feedback', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { feedback } = req.body;
    const update = await WorkUpdate.findByIdAndUpdate(req.params.id, { feedback, feedbackBy: req.user.id }, { new: true });
    res.json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
