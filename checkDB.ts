import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Internship } from './models/Internship.ts';
import { Scholarship } from './models/Scholarship.ts';
import { User } from './models/User.ts';

dotenv.config();

const checkDB = async () => {
    try {
        console.log('🔍 Connecting to Database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');

        const userCount = await User.countDocuments();
        const intCount = await Internship.countDocuments();
        const scholCount = await Scholarship.countDocuments();

        console.log('\n--- Database Summary ---');
        console.log(`👥 Total Users: ${userCount}`);
        console.log(`💼 Total Internships: ${intCount}`);
        console.log(`🎓 Total Scholarships: ${scholCount}`);

        if (intCount > 0) {
            console.log('\n--- Latest 3 Internships ---');
            const latestInts = await Internship.find().sort({ created_at: -1 }).limit(3);
            latestInts.forEach(i => {
                console.log(`- [${i.source}] ${i.title} at ${i.company} (${i.location})`);
            });
        }

        if (scholCount > 0) {
            console.log('\n--- Latest 3 Scholarships ---');
            const latestSchols = await Scholarship.find().sort({ created_at: -1 }).limit(3);
            latestSchols.forEach(s => {
                console.log(`- [${s.source}] ${s.title} (Reward: ${s.amount || 'N/A'})`);
            });
        }

        console.log('\n✅ Check complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Check failed:', err);
        process.exit(1);
    }
};

checkDB();
