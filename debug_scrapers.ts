import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { scrapeInternshala, scrapeLinkedIn, scrapeIndeed, scrapeAdzuna, scrapeNaukri } from './scraper/internships';
import { scrapeScholarships, scrapeNSP, scrapeScholarshipOwl } from './scraper/scholarships';

dotenv.config();

async function debug() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/internhub');
        console.log('✅ Connected.');

        const args = process.argv.slice(2);
        const target = args[0] || 'all';

        if (target === 'all' || target === 'internshala') {
            console.log('\n--- Debugging Internshala ---');
            await scrapeInternshala();
        }
        if (target === 'all' || target === 'linkedin') {
            console.log('\n--- Debugging LinkedIn ---');
            await scrapeLinkedIn();
        }
        if (target === 'all' || target === 'indeed') {
            console.log('\n--- Debugging Indeed ---');
            await scrapeIndeed();
        }
        if (target === 'all' || target === 'adzuna') {
            console.log('\n--- Debugging Adzuna ---');
            await scrapeAdzuna();
        }
        if (target === 'all' || target === 'naukri') {
            console.log('\n--- Debugging Naukri ---');
            await scrapeNaukri();
        }
        if (target === 'all' || target === 'buddy4study') {
            console.log('\n--- Debugging Buddy4Study ---');
            await scrapeScholarships();
        }
        if (target === 'all' || target === 'nsp') {
            console.log('\n--- Debugging NSP ---');
            await scrapeNSP();
        }
        if (target === 'all' || target === 'scholarshipowl') {
            console.log('\n--- Debugging ScholarshipOwl ---');
            await scrapeScholarshipOwl();
        }

        console.log('\n🏁 Debugging session complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Debugging failed:', err);
        process.exit(1);
    }
}

debug();
