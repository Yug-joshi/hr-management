import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  type: { type: String, enum: ['casual', 'sick', 'paid', 'unpaid'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: String, default: '' },
  reviewNote: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
