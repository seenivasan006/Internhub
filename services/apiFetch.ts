import { Internship } from '../models/Internship';
import { calculateRanking } from './ranking';

export const fetchAdzunaInternships = async (country = 'in') => {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
        console.warn(`⚠️ Adzuna credentials missing. Skipping external fetch for ${country}.`);
        return;
    }

    try {
        const keywords = ['internship', 'intern'];
        const results = [];

        for (const what of keywords) {
            const params = new URLSearchParams({
                app_id: appId,
                app_key: appKey,
                results_per_page: "100",
                what: what
            });

            const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.results) results.push(...data.results);
            }
        }

        const jobs = results;

        for (const job of jobs) {
            if (!job.company?.display_name || !job.title) continue;

            const title = job.title;
            const company = job.company.display_name;
            const external_url = job.redirect_url;

            const skills: string[] = [];
            if (job.category?.label) skills.push(job.category.label);

            const stipend = job.salary_min
                ? (country === 'in' ? `₹${job.salary_min} - ₹${job.salary_max}` : `$${job.salary_min} - $${job.salary_max}`)
                : 'Unpaid / Undisclosed';

            const ranking_score = calculateRanking({
                created_at: new Date(),
                stipend,
                source: 'Adzuna API'
            });

            await Internship.updateOne(
                { title, company, external_url },
                {
                    $setOnInsert: {
                        title,
                        company,
                        description: job.description || 'No description provided.',
                        skills_required: skills,
                        location: job.location?.display_name || 'Remote/Unknown',
                        stipend,
                        source: 'Adzuna API',
                        external_url,
                        is_new: true,
                        ranking_score,
                        created_at: new Date()
                    }
                },
                { upsert: true }
            );
        }

        console.log(`✅ Adzuna sync complete for ${country.toUpperCase()}. Checked ${jobs.length} internships.`);

    } catch (error) {
        console.error(`❌ Failed to fetch from Adzuna API for ${country}:`, error);
    }
};