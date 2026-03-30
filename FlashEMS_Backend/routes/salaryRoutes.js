import express from 'express';
import Salary from '../models/Salary.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper: attach user info to salary records
const attachUserInfo = async (records) => {
  const userIds = [...new Set(records.map(r => r.employeeId).filter(id => id && !String(id).startsWith('demo_')))];
  const users = await User.find({ _id: { $in: userIds } }).select('name email department').lean();
  const userMap = {};
  users.forEach(u => { userMap[String(u._id)] = u; });
  return records.map(r => {
    const obj = r.toObject ? r.toObject() : r;
    obj.employeeId = userMap[String(obj.employeeId)] || { _id: obj.employeeId, name: String(obj.employeeId), email: '', department: '' };
    return obj;
  });
};

// ── Generate payslip (Admin/HR) ──
router.post('/generate', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { employeeId, month, year, basic, hra, bonus, deductions, tax } = req.body;
    const netPay = basic + hra + bonus - deductions - tax;

    const salary = await Salary.create({
      employeeId, month, year, basic, hra, bonus, deductions, tax, netPay, generatedBy: req.user.id
    });

    try {
      await Notification.create({ userId: employeeId, message: `Payslip for ${month}/${year} generated. Net: ₹${netPay}`, type: 'salary', link: '/salary' });
    } catch (e) { /* skip notification errors */ }
    await AuditLog.create({ userId: req.user.id, action: 'GENERATE_SALARY', target: employeeId, details: `${month}/${year} — ₹${netPay}` });
    res.status(201).json(salary);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Payslip already exists for this month' });
    res.status(500).json({ error: err.message });
  }
});

// ── Bulk generate (Admin/HR) ──
router.post('/generate-bulk', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { month, year } = req.body;
    const employees = await User.find({ role: 'User' });
    const results = [];

    for (const emp of employees) {
      const existing = await Salary.findOne({ employeeId: String(emp._id), month, year });
      if (existing) continue;

      const basic = emp.basicSalary || 30000;
      const hra = Math.round(basic * 0.4);
      const bonus = 0;
      const deductions = Math.round(basic * 0.05);
      const tax = Math.round(basic * 0.1);
      const netPay = basic + hra + bonus - deductions - tax;

      const salary = await Salary.create({ employeeId: String(emp._id), month, year, basic, hra, bonus, deductions, tax, netPay, generatedBy: req.user.id });
      results.push(salary);
    }

    res.json({ message: `Generated ${results.length} payslips`, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get my salary history (Employee) ──
router.get('/my', authenticate, async (req, res) => {
  try {
    const salaries = await Salary.find({ employeeId: req.user.id }).sort({ year: -1, month: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get all salaries (Admin/HR) ──
router.get('/all', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const salaries = await Salary.find(filter).sort({ year: -1, month: -1 });
    const enriched = await attachUserInfo(salaries);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Payroll summary stats (Admin/HR) ──
router.get('/stats', authenticate, authorize('Super_Admin', 'HR_Manager'), async (req, res) => {
  try {
    const totalPaid = await Salary.aggregate([{ $group: { _id: null, total: { $sum: '$netPay' } } }]);
    const thisMonth = new Date();
    const currentMonthTotal = await Salary.aggregate([
      { $match: { month: thisMonth.getMonth() + 1, year: thisMonth.getFullYear() } },
      { $group: { _id: null, total: { $sum: '$netPay' } } }
    ]);
    res.json({
      totalPaid: totalPaid[0]?.total || 0,
      currentMonthTotal: currentMonthTotal[0]?.total || 0,
      totalPayslips: await Salary.countDocuments()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
