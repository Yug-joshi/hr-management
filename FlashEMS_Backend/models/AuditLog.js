import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: String, default: 'system' },
  action: { type: String, required: true },
  target: { type: String, default: '' },
  details: { type: String, default: '' },
  ip: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
