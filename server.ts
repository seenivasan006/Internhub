import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';

// Routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import dataRoutes from './routes/data';
import aiRoutes from './routes/ai';
import uploadRoutes from './routes/upload';
import applicationRoutes from './routes/applications';
import supportRoutes from './routes/support';
import recommendationRoutes from './routes/recommendations'; // INTERNHUB_PHASE2_UPDATE
import adminRoutes from './routes/admin';
import providerRoutes from './routes/provider';

// Scheduler
import { startScheduler } from './services/scheduler';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Root API Healthcheck
app.get('/', (req, res) => {
    res.send('InternHub Backend API is running!');
});

// Connect Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub')
    .then(() => {
        console.log('✅ Connected to MongoDB');
        startScheduler(); // Initialize the 10-minute fetch cron job
    })
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/recommendations', recommendationRoutes); // INTERNHUB_PHASE2_UPDATE
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/ai', aiRoutes); // Contains /api/ai/generate-essay, /api/ai/profile-tips, etc.

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files (from dist/public)
app.use(express.static(path.join(__dirname, 'public')));

// SPA Routing: Serve index.html for unknown routes (after API routes)
app.get('*', (req, res) => {
    // If it's an API route that wasn't found, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
