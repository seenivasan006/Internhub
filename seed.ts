import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fetchAdzunaInternships } from './services/apiFetch';
import { Scholarship } from './models/Scholarship';

dotenv.config();

const runSeed = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        console.log('✅ Connected');

        console.log('⏳ Fetching initial real internships from Adzuna...');
        await fetchAdzunaInternships();

        console.log('⏳ Seeding initial mock scholarships (since public APIs for this are rare without keys)...');

        // Check if scholarships exist
        const count = await Scholarship.countDocuments();
        if (count === 0) {
            await Scholarship.insertMany([
                {
                    title: 'AICTE Pragati Scholarship for Girls',
                    provider: 'All India Council for Technical Education (AICTE)',
                    description: 'Aimed at providing assistance to girls pursuing technical education. Scholarships are awarded to meritorious female students taking admission in AICTE approved technical institutions.',
                    eligibility: 'Must be female student admitted to 1st year of Degree/Diploma course in any AICTE approved institution.',
                    skills_required: ['Engineering', 'Technology', 'Architecture'],
                    amount: '₹50,000 per annum',
                    currency: 'INR',
                    education_level: 'UG',
                    gender: 'Female',
                    community: 'All',
                    income_limit: 800000,
                    external_url: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
                    is_new: true,
                    is_verified: true,
                    deadline: new Date(new Date().setMonth(new Date().getMonth() + 2))
                },
                {
                    title: 'Post Matric Scholarship for SC/ST Students',
                    provider: 'Ministry of Social Justice & Empowerment, Govt. of India',
                    description: 'Financial assistance to students belonging to SC/ST categories studying at post matriculation or post-secondary stage to enable them to complete their education.',
                    eligibility: 'Students must belong to SC/ST categories and their parents/guardians income from all sources should not exceed ₹2,50,000 per annum.',
                    skills_required: ['All Fields'],
                    amount: 'Maintenance Allowance + Course Fees',
                    currency: 'INR',
                    education_level: 'PG',
                    community: 'SC/ST',
                    income_limit: 250000,
                    external_url: 'https://scholarships.gov.in/',
                    is_new: false,
                    is_verified: true,
                    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
            ]);
            console.log('✅ Seeded mock scholarships');
        } else {
            console.log('⏭️ Scholarships already exist. Skipping seed.');
        }

        console.log('🎉 Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

runSeed();
