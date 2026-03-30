import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import User from '../models/User.js';
import Ledger from '../models/Ledger.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const imports = data.map(async (row) => {
            let user = await User.findOne({ email: row.Email });
            if (!user) {
                user = new User({
                    name: row.Name || 'Imported User',
                    email: row.Email,
                    password: 'defaultPassword',
                    role: 'Employee'
                });
                await user.save();
            }

            if (row.LedgerAmount && row.LedgerType) {
                await Ledger.create({
                    userId: user._id,
                    type: row.LedgerType,
                    amount: Number(row.LedgerAmount),
                    description: 'Excel Import'
                });
            }
        });

        await Promise.all(imports);
        res.json({ message: 'Excel Data Imported Successfully', importedRows: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
