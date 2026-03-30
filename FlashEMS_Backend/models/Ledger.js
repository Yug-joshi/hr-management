import mongoose from 'mongoose';

const ledgerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Deposit', 'Withdrawal', 'Trade_Buy', 'Trade_Allocation', 'Final_PnL', 'Credited_Brokerage'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model('Ledger', ledgerSchema);
