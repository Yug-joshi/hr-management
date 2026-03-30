import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  basic: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: { type: String, enum: ['generated', 'paid'], default: 'generated' },
  generatedBy: { type: String, default: 'system' },
}, { timestamps: true });

salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Salary', salarySchema);
