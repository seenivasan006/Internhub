import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Internship } from './models/Internship';
import { calculateComprehensiveScore } from './services/aiRecommendation';

dotenv.config();

const testMatch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        const user = await User.findOne({ email: 'vasanseeni006@gmail.com' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        console.log(`\n--- Testing for User: ${user.email} ---`);

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

        const internships = await Internship.find(searchFilter).lean();
        console.log(`Found ${internships.length} internships matching location filter.`);

        if (internships.length === 0) {
            console.log('Trying fallback (Remote)...');
            const fallbackFilter = { status: 'open', location: { $regex: 'Remote', $options: 'i' } };
            const fallbackInts = await Internship.find(fallbackFilter).lean();
            console.log(`Fallback found ${fallbackInts.length} internships.`);
        }

        const scored = internships.map((job: any) => {
            return {
                title: job.title,
                company: job.company,
                location: job.location,
                score: calculateComprehensiveScore(user, job)
            };
        }).sort((a, b) => b.score - a.score);

        console.log('\nTop 5 Scored Matches:');
        scored.slice(0, 5).forEach(s => {
            console.log(`- [${s.score}%] ${s.title} at ${s.company} (${s.location})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testMatch();
