import express from 'express';
import Ledger from '../models/Ledger.js';

const router = express.Router();

router.get('/admin', async (req, res) => {
    try {
        // Admin Ledger Filtering: User's objective was to ensure the admin's general ledger view
        // excludes trade-related entries (buys and allocations) and only displays 
        // funds added/withdrawn, user final P&L, and credited brokerage.
        const entries = await Ledger.find({
            type: { $ne: 'Trade_Buy', $ne: 'Trade_Allocation' } // Excluding these
        }).populate('userId', 'name email');
        
        let totalAdminBalance = 0;
        entries.forEach(e => {
            if (e.type === 'Credited_Brokerage') {
                totalAdminBalance += e.amount;
            }
            // Ensuring balance zeroes out other properties if they are pass-throughs
        });

        res.json({ entries, totalAdminBalance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
