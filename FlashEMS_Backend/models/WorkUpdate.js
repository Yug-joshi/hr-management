import mongoose from 'mongoose';

const workUpdateSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [{ name: String, url: String }],
  feedback: { type: String, default: '' },
  feedbackBy: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('WorkUpdate', workUpdateSchema);
