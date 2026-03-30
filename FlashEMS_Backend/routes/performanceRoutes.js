import express from 'express';
import Performance from '../models/Performance.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper: attach user info
const attachUserInfo = async (records, field = 'employeeId') => {
  const ids = [...new Set(records.map(r => r[field]).filter(id => id && !String(id).startsWith('demo_')))];
  const users = await User.find({ _id: { $in: ids } }).select('name email department').lean();
  const userMap = {};
  users.forEach(u => { userMap[String(u._id)] = u; });
  return records.map(r => {
    const obj = r.toObject ? r.toObject() : r;
    if (userMap[String(obj[field])]) obj[field] = userMap[String(obj[field])];
    else obj[field] = { _id: obj[field], name: String(obj[field]), email: '', department: '' };
    return obj;
  });
};

// ── Create performance review (Admin/HR) ──
router.post('/', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { employeeId, period, kpis, rating, feedback } = req.body;
    const perf = await Performance.create({ employeeId, period, kpis, rating, feedback, evaluatedBy: req.user.id });

    try {
      await Notification.create({
        userId: employeeId,
        message: `New performance review for ${period}: Rating ${rating}/5`,
        type: 'performance', link: '/performance'
      });
    } catch (e) { /* skip notification errors */ }
    res.status(201).json(perf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get my performance (Employee) ──
router.get('/my', authenticate, async (req, res) => {
  try {
    const perfs = await Performance.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(perfs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get all reviews (Admin/HR) ──
router.get('/all', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const perfs = await Performance.find().sort({ createdAt: -1 });
    const enriched = await attachUserInfo(perfs);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single employee's performance (Admin/HR) ──
router.get('/employee/:id', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const perfs = await Performance.find({ employeeId: req.params.id }).sort({ createdAt: -1 });
    res.json(perfs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
