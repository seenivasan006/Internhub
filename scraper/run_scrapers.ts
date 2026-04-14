import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scrapeScholarships, scrapeNSP, scrapeScholarshipOwl } from '../scraper/scholarships';

dotenv.config();

const runScrapers = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        console.log('✅ Connected');

        console.log('⏳ Running Scrapers...');

        await scrapeScholarships('');
        await scrapeScholarships('engineering-students');
        await scrapeScholarships('medical-students');
        await scrapeScholarshipOwl('merit-based-scholarships');
        await scrapeScholarshipOwl('women-scholarships');
        await scrapeNSP('scholarship');

        console.log('✅ Scraping Complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to run scrapers:', err);
        process.exit(1);
    }
};

runScrapers();
