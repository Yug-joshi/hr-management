import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  period: { type: String, required: true }, // e.g. "Q1 2026"
  kpis: [{
    name: { type: String, required: true },
    target: { type: Number, default: 100 },
    achieved: { type: Number, default: 0 },
    weight: { type: Number, default: 1 }
  }],
  rating: { type: Number, min: 1, max: 5, default: 3 },
  feedback: { type: String, default: '' },
  evaluatedBy: { type: String, default: 'system' },
}, { timestamps: true });

export default mongoose.model('Performance', performanceSchema);
