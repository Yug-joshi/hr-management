import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['User', 'HR_Manager', 'Super_Admin'], default: 'User' },
  department: { type: String, default: 'General' },
  designation: { type: String, default: 'Employee' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  joinDate: { type: Date, default: Date.now },
  basicSalary: { type: Number, default: 0 },
  documents: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
  leaveBalance: {
    casual: { type: Number, default: 12 },
    sick: { type: Number, default: 10 },
    paid: { type: Number, default: 15 },
    unpaid: { type: Number, default: 999 }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
