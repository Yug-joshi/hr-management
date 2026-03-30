import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── Demo bypass login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Demo accounts
    const demoAccounts = {
      'admin@flashems.com': { password: 'admin123', role: 'Super_Admin', name: 'System Administrator', department: 'Management', designation: 'CEO' },
      'hr@flashems.com': { password: 'hr123', role: 'HR_Manager', name: 'HR Operations Director', department: 'Human Resources', designation: 'HR Director' },
      'employee@flashems.com': { password: 'emp123', role: 'User', name: 'Standard Employee', department: 'Engineering', designation: 'Software Developer' },
    };

    const demo = demoAccounts[email];
    if (demo && password === demo.password) {
      const token = jwt.sign({ id: `demo_${email}`, role: demo.role, name: demo.name }, process.env.JWT_SECRET || 'supersecretflash', { expiresIn: '1d' });
      return res.json({ token, role: demo.role, name: demo.name, department: demo.department, designation: demo.designation });
    }

    // Real DB login
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'supersecretflash', { expiresIn: '1d' });
    res.json({ token, role: user.role, name: user.name, department: user.department, designation: user.designation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Signup (Admin/HR can create employees) ──
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, basicSalary } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'User', department, designation, basicSalary });

    await AuditLog.create({ userId: req.user?.id || 'system', action: 'CREATE_USER', target: user.email, details: `Created ${role || 'User'} account` });
    res.status(201).json({ message: 'User created', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── List all employees (Admin/HR only) ──
router.get('/employees', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { search, department, role } = req.query;
    let filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (department) filter.department = department;
    if (role) filter.role = role;

    const employees = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get single employee ──
router.get('/employee/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Employee not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Update employee (Admin/HR, or self for profile) ──
router.put('/employee/:id', authenticate, async (req, res) => {
  try {
    const { name, department, designation, phone, address, role, basicSalary } = req.body;
    const update = { name, department, designation, phone, address };
    
    // Only admin can change roles/salary
    if (['Super_Admin', 'HR_Manager'].includes(req.user.role)) {
      if (role) update.role = role;
      if (basicSalary !== undefined) update.basicSalary = basicSalary;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    await AuditLog.create({ userId: req.user.id, action: 'UPDATE_USER', target: user.email, details: JSON.stringify(update) });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete employee (Admin only, HR cannot delete Admin) ──
router.delete('/employee/:id', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Employee not found' });
    if (target.role === 'Super_Admin' && req.user.role !== 'Super_Admin') {
      return res.status(403).json({ error: 'HR cannot delete Admin accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    await AuditLog.create({ userId: req.user.id, action: 'DELETE_USER', target: target.email, details: 'Account deleted' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get current user profile ──
router.get('/me', authenticate, async (req, res) => {
  try {
    // For demo users, return synthetic profile
    if (String(req.user.id).startsWith('demo_')) {
      return res.json({
        _id: req.user.id, name: req.user.name, email: req.user.id.replace('demo_', ''),
        role: req.user.role, department: 'General', designation: 'Staff', phone: '', address: '',
        leaveBalance: { casual: 12, sick: 10, paid: 15, unpaid: 999 }, joinDate: new Date('2025-01-15')
      });
    }
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Dashboard stats (Admin/HR) ──
router.get('/stats', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments();
    const departments = await User.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const roles = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({ totalEmployees, departments, roles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Audit logs (Admin only) ──
router.get('/audit-logs', authenticate, authorize('Super_Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
