import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { OTP } from './models/OTP';
import { Internship } from './models/Internship';
import { Scholarship } from './models/Scholarship';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub';

mongoose.connect(mongoUri)
    .then(async () => {
        console.log('🌱 Connected to DB');

        const userRes = await User.deleteMany({});
        const otpRes = await OTP.deleteMany({});
        const intRes = await Internship.deleteMany({});
        const scholRes = await Scholarship.deleteMany({});

        console.log(`✅ Deleted ${userRes.deletedCount} users.`);
        console.log(`✅ Deleted ${otpRes.deletedCount} OTPs.`);
        console.log(`✅ Deleted ${intRes.deletedCount} internships.`);
        console.log(`✅ Deleted ${scholRes.deletedCount} scholarships.`);

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error clearing DB:', err);
        process.exit(1);
    });
