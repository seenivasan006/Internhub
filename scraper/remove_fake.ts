import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Scholarship } from '../models/Scholarship';

dotenv.config();

const removeFake = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        console.log('Connected to DB');

        const result = await Scholarship.deleteMany({
            description: { $regex: /Official scholarship listings for/i }
        });
        console.log(`Deleted ${result.deletedCount} fake aggregate scholarships.`);

        // Also delete "Top Scholarships for" etc if any remain
        const result2 = await Scholarship.deleteMany({
            title: { $regex: /Top Scholarships for/i }
        });
        console.log(`Deleted ${result2.deletedCount} Top Scholarships for...`);

        // Also delete "Scholarships for Class" etc
        const result3 = await Scholarship.deleteMany({
            title: { $regex: /^Scholarships for /i }
        });
        console.log(`Deleted ${result3.deletedCount} generic Scholarships for...`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

removeFake();
