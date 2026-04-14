import puppeteer from 'puppeteer';
import { Internship } from '../models/Internship';
import { cleanText, validateUrl } from './cleaner';
import { logSuccess, logError } from './logger';

// Helper to extract skills from text if missing
const getFallbackSkills = (text: string): string[] => {
    const commonSkills = [
        'React', 'Node.js', 'Python', 'Java', 'Javascript', 'TypeScript', 'MongoDB', 'SQL',
        'Data Analysis', 'Digital Marketing', 'Content Writing', 'UI/UX', 'Figma',
        'C++', 'Machine Learning', 'Artificial Intelligence', 'AWS', 'Docker'
    ];
    const textLower = text.toLowerCase();
    return commonSkills.filter(skill => textLower.includes(skill.toLowerCase()));
};

export const scrapeInternshala = async (keywords: string = '') => {
    console.log(`🕷️ Starting Internshala Scraper ${keywords ? `with keywords: ${keywords}` : ''}...`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        const searchUrl = keywords
            ? `https://internshala.com/internships/keywords-${encodeURIComponent(keywords)}`
            : 'https://internshala.com/internships';

        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Handle Modal if it appears
        try {
            await page.waitForSelector('#close_popup', { timeout: 5000 });
            await page.click('#close_popup');
        } catch (e) { }

        const results = await page.evaluate(() => {
            const items = document.querySelectorAll('.individual_internship');
            return Array.from(items).map(item => {
                const title = item.querySelector('.job-internship-name')?.textContent?.trim() ||
                    item.querySelector('.heading_3_l3')?.textContent?.trim() || '';
                const company = item.querySelector('.company-name')?.textContent?.trim() ||
                    item.querySelector('.heading_4_5')?.textContent?.trim() || '';
                const location = item.querySelector('.locations span')?.textContent?.trim() ||
                    item.querySelector('.location_link')?.textContent?.trim() || '';
                const linkElement = item.querySelector('a.job-title-href') as HTMLAnchorElement ||
                    item.querySelector('.view_detail_button') as HTMLAnchorElement ||
                    item.querySelector('a') as HTMLAnchorElement;
                const link = linkElement?.href || '';
                const stipend = item.querySelector('.stipend')?.textContent?.trim() || 'Undisclosed';
                const skillElements = item.querySelectorAll('.tags_container .individual_tag, .round_tabs');
                const skills = Array.from(skillElements).map(s => s.textContent?.trim() || '').filter(Boolean);
                const durationEl = item.querySelectorAll('.other_detail_item, .item_body');
                let duration = '';
                durationEl.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    if (text.toLowerCase().includes('month') || text.toLowerCase().includes('week')) {
                        duration = text;
                    }
                });
                return { title, company, location, link, stipend, skills, duration };
            });
        });

        let savedCount = 0;
        for (const data of results) {
            if (!data.title || !data.company || !data.link) continue;
            const cleanData = {
                title: cleanText(data.title),
                company: cleanText(data.company),
                location: cleanText(data.location),
                stipend: cleanText(data.stipend),
                external_url: validateUrl(data.link) || '',
                source: 'Internshala',
                description: `Internship at ${data.company} for ${data.title}.`,
                skills_required: data.skills.length > 0 ? data.skills : getFallbackSkills(data.title),
                duration: cleanText(data.duration),
                is_new: true,
                scraped_at: new Date(),
                created_at: new Date()
            };
            await Internship.findOneAndUpdate(
                { title: cleanData.title, company: cleanData.company, source: 'Internshala' },
                { ...cleanData, status: 'open' },
                { upsert: true }
            );
            savedCount++;
        }
        logSuccess(`Internshala${keywords ? ` (${keywords})` : ''}`, savedCount);
    } catch (err) {
        logError('Internshala', err);
    } finally {
        if (browser) await browser.close();
    }
};

export const scrapeLinkedIn = async (keywords: string = 'Internship') => {
    console.log(`🕷️ Starting LinkedIn Scraper with keywords: ${keywords}...`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keywords)}&location=India&geoId=102713980&f_TP=1%2C2&f_E=1`;
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const results = await page.evaluate(() => {
            const cards = document.querySelectorAll('.base-search-card');
            return Array.from(cards).map(card => {
                const title = card.querySelector('.base-search-card__title')?.textContent?.trim() || '';
                const company = card.querySelector('.base-search-card__subtitle')?.textContent?.trim() || '';
                const location = card.querySelector('.job-search-card__location')?.textContent?.trim() || '';
                const link = (card.querySelector('.base-card__full-link') as HTMLAnchorElement)?.href || '';
                return { title, company, location, link };
            });
        });

        let savedCount = 0;
        for (const data of results) {
            if (!data.title || !data.company || !data.link) continue;
            const cleanData = {
                title: cleanText(data.title),
                company: cleanText(data.company),
                location: cleanText(data.location),
                external_url: validateUrl(data.link) || '',
                source: 'LinkedIn',
                description: `${data.title} at ${data.company}.`,
                skills_required: getFallbackSkills(data.title),
                is_new: true,
                scraped_at: new Date(),
                created_at: new Date()
            };
            await Internship.findOneAndUpdate(
                { title: cleanData.title, company: cleanData.company, source: 'LinkedIn' },
                { ...cleanData, status: 'open' },
                { upsert: true }
            );
            savedCount++;
        }
        logSuccess(`LinkedIn (${keywords})`, savedCount);
    } catch (err) {
        logError('LinkedIn', err);
    } finally {
        if (browser) await browser.close();
    }
};

export const scrapeIndeed = async (keywords: string = 'internship') => {
    console.log(`🕷️ Starting Indeed Scraper with keywords: ${keywords}...`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.goto(`https://in.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=India&fromage=1`, { waitUntil: 'networkidle2' });

        const results = await page.evaluate(() => {
            const jobs = document.querySelectorAll('.job_seen_beacon');
            return Array.from(jobs).map(job => {
                const title = job.querySelector('h2.jobTitle')?.textContent?.trim() || '';
                const company = job.querySelector('[data-testid="company-name"]')?.textContent?.trim() || '';
                const location = job.querySelector('[data-testid="text-location"]')?.textContent?.trim() || '';
                const link = (job.querySelector('a.jcs-JobTitle') as HTMLAnchorElement)?.href || '';
                return { title, company, location, link };
            });
        });

        let savedCount = 0;
        for (const data of results) {
            if (!data.title || !data.company) continue;
            const cleanData = {
                title: cleanText(data.title),
                company: cleanText(data.company),
                location: cleanText(data.location),
                external_url: validateUrl(data.link) || '',
                source: 'Indeed',
                description: `Internship at ${data.company}.`,
                skills_required: getFallbackSkills(data.title),
                is_new: true,
                scraped_at: new Date(),
                created_at: new Date()
            };
            await Internship.findOneAndUpdate(
                { title: cleanData.title, company: cleanData.company, source: 'Indeed' },
                { ...cleanData, status: 'open' },
                { upsert: true }
            );
            savedCount++;
        }
        logSuccess(`Indeed (${keywords})`, savedCount);
    } catch (err) {
        logError('Indeed', err);
    } finally {
        if (browser) await browser.close();
    }
};

export const scrapeAdzuna = async (keywords: string = 'internship') => {
    console.log(`📡 Fetching from Adzuna API with keywords: ${keywords}...`);
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) return;

    try {
        let totalSaved = 0;
        // Fetch top 3 pages to get more results
        for (let page = 1; page <= 3; page++) {
            const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=50&content-type=application/json&what=${encodeURIComponent(keywords)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!data.results || data.results.length === 0) break;

            for (const job of data.results) {
                const cleanData = {
                    title: cleanText(job.title),
                    company: cleanText(job.company?.display_name || 'Various'),
                    location: cleanText(job.location?.display_name || 'India'),
                    external_url: validateUrl(job.redirect_url) || '',
                    source: 'Adzuna',
                    description: cleanText(job.description),
                    skills_required: getFallbackSkills(job.title + ' ' + (job.description || '')),
                    is_new: true,
                    scraped_at: new Date(),
                    created_at: new Date()
                };
                await Internship.findOneAndUpdate(
                    { title: cleanData.title, company: cleanData.company, external_url: cleanData.external_url },
                    { ...cleanData, status: 'open' },
                    { upsert: true }
                );
                totalSaved++;
            }
        }
        logSuccess(`Adzuna API (${keywords})`, totalSaved);
    } catch (err) {
        logError('Adzuna API', err);
    }
};


export const scrapeNaukri = async (keywords: string = 'internship') => {
    console.log(`🕷️ Starting Naukri Scraper with keywords: ${keywords}...`);
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

        // Update Naukri URL/selectors for better results
        const url = keywords === 'internship'
            ? 'https://www.naukri.com/internship-jobs'
            : `https://www.naukri.com/${keywords.replace(/\s+/g, '-')}-internship-jobs`;

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

        const results = await page.evaluate(() => {
            const items = document.querySelectorAll('.srp-jobtuple-wrapper, .jobTuple');
            return Array.from(items).map(item => {
                const title = item.querySelector('a.title')?.textContent?.trim() || '';
                const company = item.querySelector('a.comp-name, .subTitle')?.textContent?.trim() || '';
                const location = item.querySelector('.locWp, .location')?.textContent?.trim() || '';
                const link = (item.querySelector('a.title') as HTMLAnchorElement)?.href || '';
                return { title, company, location, link };
            });
        });

        let savedCount = 0;
        for (const data of results) {
            if (!data.title || !data.company) continue;
            const cleanData = {
                title: cleanText(data.title),
                company: cleanText(data.company),
                location: cleanText(data.location),
                external_url: validateUrl(data.link) || '',
                source: 'Naukri',
                description: `Internship at ${data.company}.`,
                skills_required: getFallbackSkills(data.title),
                is_new: true,
                scraped_at: new Date(),
                created_at: new Date()
            };
            await Internship.findOneAndUpdate(
                { title: cleanData.title, company: cleanData.company, source: 'Naukri' },
                { ...cleanData, status: 'open' },
                { upsert: true }
            );
            savedCount++;
        }
        logSuccess(`Naukri (${keywords})`, savedCount);
    } catch (err) {
        logError('Naukri', err);
    } finally {
        if (browser) await browser.close();
    }
};

