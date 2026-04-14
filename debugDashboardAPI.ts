import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Internship } from './models/Internship';
import { Scholarship } from './models/Scholarship';
import { calculateComprehensiveScore } from './services/aiRecommendation';

dotenv.config();

async function debugDashboard() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        const user = await User.findOne({ email: 'vasanseeni006@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`\n--- Debugging Dashboard for User: ${user.email} ---`);
        console.log(`Location: ${user.location}, Pref: ${user.location_preference}`);

        // 1. Test Internship Filter
        const preferredLocations = [
            user.location_preference,
            user.location,
            'Remote',
            'India'
        ].filter(Boolean);

        const searchFilter: any = {
            status: 'open',
            location: { $regex: preferredLocations.join('|'), $options: 'i' }
        };

        console.log(`Internship Filter: ${JSON.stringify(searchFilter)}`);
        const internships = await Internship.find(searchFilter).lean();
        console.log(`Found ${internships.length} internships.`);

        if (internships.length > 0) {
            console.log('Top Match Score Example:', calculateComprehensiveScore(user, internships[0]));
        }

        // 2. Test Scholarship Filter
        const scholarshipFilter = {
            is_active: { $ne: false }, // Broaden to see what exists
            // deadline: { $gte: new Date() } // Temporarily commented to see all active
        };
        console.log(`Scholarship Filter: ${JSON.stringify(scholarshipFilter)}`);
        const scholarships = await Scholarship.find(scholarshipFilter).lean();
        console.log(`Found ${scholarships.length} active scholarships.`);

        const activeAndValid = scholarships.filter(s => s.is_active && (!s.deadline || new Date(s.deadline) >= new Date()));
        console.log(`Found ${activeAndValid.length} scholarships matching dashboard criteria (active & future deadline).`);

        if (scholarships.length > 0) {
            console.log('Sample Scholarship Deadline:', scholarships[0].deadline);
            console.log('Sample Scholarship is_active:', scholarships[0].is_active);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugDashboard();
