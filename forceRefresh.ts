import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scrapeInternshala, scrapeLinkedIn, scrapeIndeed, scrapeNaukri, scrapeAdzuna } from './scraper/internships.ts';
import { scrapeScholarships, scrapeNSP, scrapeScholarshipOwl } from './scraper/scholarships.ts';
import { Scholarship } from './models/Scholarship.ts';
import { Internship } from './models/Internship.ts';



dotenv.config();

const forceRefresh = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');

        console.log('🧹 Clearing old/mock data...');
        const intCount = await Internship.countDocuments();
        const scholCount = await Scholarship.countDocuments();
        console.log(`Current: Internships=${intCount}, Scholarships=${scholCount}`);

        await Internship.deleteMany({});
        await Scholarship.deleteMany({});
        console.log('✨ Database wiped clean.');

        console.log('🕷️ Running Scrapers...');

        console.log('-- Internships --');
        await scrapeInternshala();
        await scrapeLinkedIn();
        await scrapeIndeed();
        await scrapeNaukri();
        await scrapeAdzuna();



        console.log('-- Scholarships --');
        await scrapeScholarships();
        await scrapeNSP();
        await scrapeScholarshipOwl();

        console.log('✅ Database refresh complete with REAL data.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Refresh failed:', err);
        process.exit(1);
    }
};

forceRefresh();
