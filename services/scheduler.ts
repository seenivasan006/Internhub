import cron from 'node-cron';
import { scrapeInternshala, scrapeLinkedIn, scrapeIndeed, scrapeAdzuna, scrapeNaukri } from '../scraper/internships';
import { scrapeScholarships, scrapeNSP, scrapeScholarshipOwl } from '../scraper/scholarships';
import { findAndNotifyMatches } from './notificationService';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';
import { User } from '../models/User';

export const startScheduler = () => {

    // INTERNHUB_PHASE1_UPDATE: Scraping every 8 hours (00:00, 08:00, 16:00)
    cron.schedule('0 0,8,16 * * *', async () => {
        try {
            console.log('⏰ Running scheduled Daily Scraping Module (3x Daily)...');

            // 1. General Scraping
            await scrapeInternshala();
            await scrapeLinkedIn();
            await scrapeIndeed();
            await scrapeAdzuna();
            await scrapeNaukri();
            await scrapeScholarships();
            await scrapeNSP();
            await scrapeScholarshipOwl();

            // 2. Targeted Scraping based on User Profiles
            console.log('🎯 Running Targeted Scraping Module...');
            const users = await User.find({ onboarding_completed: true }).limit(100);

            // Extract top skills (limit to most common to avoid infinite loops)
            const allSkills = users.flatMap(u => u.skills || []);
            const skillCounts: Record<string, number> = {};
            allSkills.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1);
            const topSkills = Object.entries(skillCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(e => e[0]);

            for (const skill of topSkills) {
                console.log(`🔍 Targeting internships for: ${skill}`);
                await scrapeInternshala(skill);
                await scrapeNaukri(skill);
                await scrapeAdzuna(skill);
            }

            // Extract top interests/studies for scholarships
            const allInterests = users.flatMap(u => u.interests || []);
            const interestCounts: Record<string, number> = {};
            allInterests.forEach(i => interestCounts[i] = (interestCounts[i] || 0) + 1);
            const topInterests = Object.entries(interestCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(e => e[0]);

            for (const interest of topInterests) {
                console.log(`🔍 Targeting scholarships for: ${interest}`);
                await scrapeScholarships(interest);
                await scrapeNSP(interest);
            }

            console.log('📧 Triggering matching notifications...');
            await findAndNotifyMatches();

            console.log('✅ Daily Scraping and Notification cycle complete.');
        } catch (err) {
            console.error('❌ Scheduler Error:', err);
        }
    });


    // 2. Clean up old/expired listings once a week
    cron.schedule('0 0 * * 0', async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            await Internship.deleteMany({ created_at: { $lt: thirtyDaysAgo } });

            await Scholarship.updateMany(
                { deadline: { $lt: new Date() }, is_active: true },
                { is_active: false }
            );
            console.log('🧹 Cleaned up old listings and deactivated expired scholarships');
        } catch (err) {
            console.error('🧹 Cleanup Error:', err);
        }
    });

    console.log('🚀 Scheduler Initialized (Scraping every 8 hours at 00:00, 08:00, 16:00)');
};

