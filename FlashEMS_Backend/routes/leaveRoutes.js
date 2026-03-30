import express from 'express';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper: attach user info to leaves
const attachUserInfo = async (leaves) => {
  const userIds = [...new Set(leaves.map(l => l.employeeId).filter(id => id && !String(id).startsWith('demo_')))];
  const users = await User.find({ _id: { $in: userIds } }).select('name email department').lean();
  const userMap = {};
  users.forEach(u => { userMap[String(u._id)] = u; });
  return leaves.map(l => {
    const obj = l.toObject ? l.toObject() : l;
    obj.employeeId = userMap[String(obj.employeeId)] || { _id: obj.employeeId, name: obj.employeeId, email: '', department: '' };
    return obj;
  });
};

// ── Apply for leave (Employee) ──
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({
      employeeId: req.user.id, type, startDate, endDate, reason
    });
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get my leaves (Employee) ──
router.get('/my', authenticate, async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get all leaves (Admin/HR) ──
router.get('/all', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    const enriched = await attachUserInfo(leaves);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Approve/Reject leave (Admin/HR) ──
router.put('/:id', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, {
      status, reviewNote, approvedBy: req.user.id
    }, { new: true });

    // Try to send notification (skip if demo user)
    if (leave.employeeId && !String(leave.employeeId).startsWith('demo_')) {
      try {
        await Notification.create({
          userId: leave.employeeId,
          message: `Your ${leave.type} leave request has been ${status}`,
          type: 'leave', link: '/leave'
        });
      } catch (e) { /* skip notification errors */ }
    }

    await AuditLog.create({ userId: req.user.id, action: `LEAVE_${status.toUpperCase()}`, target: leave.employeeId, details: reviewNote || '' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Leave stats (Admin/HR) ──
router.get('/stats', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const pending = await Leave.countDocuments({ status: 'pending' });
    const approved = await Leave.countDocuments({ status: 'approved' });
    const rejected = await Leave.countDocuments({ status: 'rejected' });
    const total = await Leave.countDocuments();
    res.json({ pending, approved, rejected, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
