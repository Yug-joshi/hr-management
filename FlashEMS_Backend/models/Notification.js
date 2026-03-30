import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'leave', 'salary', 'performance'], default: 'info' },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
