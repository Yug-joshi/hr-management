import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import salaryRoutes from './routes/salaryRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import workUpdateRoutes from './routes/workUpdateRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/work-updates', workUpdateRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`FlashEMS Backend running on port ${PORT}`));
