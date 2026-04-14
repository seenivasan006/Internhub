import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Scholarship } from '../models/Scholarship';

dotenv.config();

const fixDeadlines = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        console.log('✅ Connected');

        console.log('⏳ Randomizing scholarship deadlines...');
        const scholarships = await Scholarship.find({});
        let updatedCount = 0;

        for (const s of scholarships) {
            // Add a random jitter to the deadline between 1 to 60 days from now
            // Just so they don't look identically generated all on the same day
            const jitterDays = Math.floor(Math.random() * 60) + 15; // 15 to 75 days
            s.deadline = new Date(Date.now() + jitterDays * 24 * 60 * 60 * 1000);
            await s.save();
            updatedCount++;
        }

        console.log(`✅ Updated deadlines for ${updatedCount} scholarships.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to update deadlines:', err);
        process.exit(1);
    }
};

fixDeadlines();
