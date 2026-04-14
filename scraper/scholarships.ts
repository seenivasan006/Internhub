import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { Scholarship } from '../models/Scholarship';
import { cleanText, validateUrl } from './cleaner';
import { logSuccess, logError } from './logger';

export const scrapeScholarships = async (category: string = '') => {
    console.log(`🕷️ Starting Buddy4Study Scraper ${category ? `for ${category}` : '(Enhanced Mode)'}...`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        const url = category
            ? `https://www.buddy4study.com/scholarships/${category.toLowerCase().replace(/\s+/g, '-')}`
            : 'https://www.buddy4study.com/scholarships';

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        const html = await page.content();
        const $ = cheerio.load(html);

        let savedCount = 0;

        // We removed Strategy 1 because it scraped category aggregate pages (like "Top Scholarships for Uttar Pradesh") instead of specific scholarships.
        
        // Strategy 2: DOM-based Featured Scholarships
        const cards = $('.scholarships-inner-card, .scholarship-card, [class*="inner-card"]');
        cards.each((_, el) => {
            const title = cleanText($(el).find('h4, h3, .title').first().text());
            const link = $(el).find('a').first().attr('href') || '';
            const provider = cleanText($(el).find('p, .provider').first().text()) || 'Buddy4Study Partner';

            if (title && link) {
                const isFemale = title.toLowerCase().includes('girl') || title.toLowerCase().includes('women');
                const fullLink = link.startsWith('http') ? link : `https://www.buddy4study.com${link}`;

                Scholarship.findOneAndUpdate(
                    { title },
                    {
                        title,
                        provider,
                        official_website: fullLink,
                        description: `Featured scholarship: ${title}. Managed by ${provider}.`,
                        is_verified: true,
                        is_active: true,
                        gender: isFemale ? 'Female' : 'All',
                        education_level: title.toLowerCase().includes('matric') ? 'School' : 'UG/PG',
                        source: 'Buddy4Study',
                        deadline: new Date(Date.now() + (30 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
                        created_at: new Date()
                    },
                    { upsert: true }
                ).catch(() => { });
                savedCount++;
            }
        });

        logSuccess(`Scholarships (Buddy4Study${category ? ` - ${category}` : ''})`, savedCount);

    } catch (err) {
        logError('Scholarships', err);
    } finally {
        if (browser) await browser.close();
    }
};

export const scrapeNSP = async (keywords: string = '') => {
    console.log(`🕷️ Starting NSP Scraper ${keywords ? `with keywords: ${keywords}` : ''}...`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        // NSP is dynamic, but we can target the scheme listing page
        await page.goto('https://scholarships.gov.in/All-Scholarships', { waitUntil: 'networkidle2' });

        const schemes = await page.evaluate(() => {
            const items: any[] = [];
            // Target scheme rows and accordions
            document.querySelectorAll('.scheme-item, tr, .scheme-row, .accordion-body').forEach(row => {
                const text = row.textContent?.trim() || '';
                if (text.toLowerCase().includes('scholarship') || text.toLowerCase().includes('scheme')) {
                    const title = row.querySelector('td:nth-child(2), .title, h3, h4')?.textContent?.trim() || text.substring(0, 100);
                    if (title.length > 15) {
                        items.push({ title, link: 'https://scholarships.gov.in/' });
                    }
                }
            });
            return items;
        });

        let savedCount = 0;
        for (const s of schemes) {
            if (keywords && !s.title.toLowerCase().includes(keywords.toLowerCase())) continue;

            const isFemale = s.title.toLowerCase().includes('girl') || s.title.toLowerCase().includes('women');
            await Scholarship.findOneAndUpdate(
                { title: cleanText(s.title) },
                {
                    title: cleanText(s.title),
                    provider: 'National Scholarship Portal',
                    description: `Government of India Scheme: ${s.title}.`,
                    official_website: s.link,
                    is_verified: true,
                    is_active: true,
                    gender: isFemale ? 'Female' : 'All',
                    education_level: 'All',
                    source: 'NSP',
                    deadline: new Date(Date.now() + (60 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
                    created_at: new Date()
                },
                { upsert: true }
            );
            savedCount++;
        }
        logSuccess(`NSP${keywords ? ` (${keywords})` : ''}`, savedCount);
    } catch (err) {
        logError('NSP', err);
    } finally {
        if (browser) await browser.close();
    }
};

export const scrapeScholarshipOwl = async (type: string = 'merit-based-scholarships') => {
    console.log(`🕷️ Starting ScholarshipOwl Scraper for type: ${type}...`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        const url = `https://scholarshipowl.com/scholarship-list/by-type/${type}`;
        await page.goto(url, { waitUntil: 'networkidle2' });

        const results = await page.evaluate(() => {
            // Updated selectors based on current findings
            const items = document.querySelectorAll('div.bg-white.border.border-gray-100.rounded-2xl');
            return Array.from(items).map(item => {
                const title = item.querySelector('div.text-lg.font-bold')?.textContent?.trim() || '';
                const amount = item.querySelector('div.text-2xl.font-bold')?.textContent?.trim() || '';
                const linkElement = item.closest('a') as HTMLAnchorElement || item.querySelector('a') as HTMLAnchorElement;
                const link = linkElement?.href || '';
                return { title, amount, link };
            });
        });

        let savedCount = 0;
        for (const data of results) {
            if (!data.title) continue;
            const cleanData = {
                title: cleanText(data.title),
                provider: 'ScholarshipOwl Partner',
                amount: cleanText(data.amount),
                official_website: validateUrl(data.link) || url,
                description: `International Scholarship: ${data.title}. Reward: ${data.amount}`,
                is_verified: true,
                is_active: true,
                education_level: 'All',
                source: 'ScholarshipOwl',
                deadline: new Date(Date.now() + (90 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000),
                created_at: new Date()
            };
            await Scholarship.findOneAndUpdate(
                { title: cleanData.title },
                cleanData,
                { upsert: true }
            );
            savedCount++;
        }
        logSuccess(`ScholarshipOwl (${type})`, savedCount);
    } catch (err) {
        logError('ScholarshipOwl', err);
    } finally {
        if (browser) await browser.close();
    }
};

