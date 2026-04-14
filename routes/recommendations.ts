// INTERNHUB_PHASE2_UPDATE: Career Path Recommendation API Route
// GET /api/recommendations/career-path → Returns matched internships, scholarships, and skill gaps

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';
import { User } from '../models/User';
import { calculateAdvancedMatch, calculateHybridScore, calculateComprehensiveScore } from '../services/aiRecommendation';
import { analyzeSkillGaps } from '../services/skillGapAnalyzer';

const router = Router();

/**
 * GET /api/recommendations/career-path
 * Protected route — requires authenticated user token.
 * Returns top internships, scholarships, and skill gap analysis.
 */
router.get('/career-path', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userId: string = user._id.toString();

        // Merge user skills from profile + internship preferences
        const userSkills: string[] = [
            ...(user.skills || []),
            ...(user.internshipPreferences?.skills || [])
        ];

        // ─── 1. Matched Internships ──────────────────────────────────────────
        const internships = await Internship.find({ status: 'open' }).lean();

        const scoredInternships = internships
            .map((job: any) => {
                // +2 points per matching skill (exact spec formula)
                const jobSkillsLower = (job.skills_required || []).map((s: string) => s.toLowerCase());
                const userSkillsLower = userSkills.map(s => s.toLowerCase());
                const skillMatchScore = jobSkillsLower.filter((s: string) => userSkillsLower.includes(s)).length * 2;

                // Additional TF-IDF boost via existing AI recommender
                const tfidfScore = calculateAdvancedMatch(userSkills, job.description + ' ' + (job.skills_required || []).join(' '));

                const locationMatch =
                    (user.location && job.location?.toLowerCase().includes(user.location.toLowerCase())) ||
                    (user.location_preference && job.location?.toLowerCase().includes(user.location_preference.toLowerCase())) ||
                    (user.state && job.location?.toLowerCase().includes(user.state.toLowerCase()));

                const hybridScore = calculateHybridScore(tfidfScore, !!locationMatch, job.is_new);
                const totalScore = skillMatchScore + hybridScore;

                return {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    stipend: job.stipend,
                    duration: job.duration,
                    skills_required: job.skills_required,
                    external_url: job.external_url,
                    source: job.source,
                    is_new: job.is_new,
                    match_score: totalScore
                };
            })
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 10); // Top 10

        // ─── 2. Matched Scholarships ─────────────────────────────────────────
        const scholarships = await Scholarship.find({
            is_active: true,
            deadline: { $gte: new Date() }
        }).lean();

        const indianStates = ['andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal', 'delhi', 'jammu and kashmir', 'ladakh', 'puducherry'];

        const scoredScholarships = scholarships
            .filter((s: any) => {
                // Eligibility filter
                if (s.gender && s.gender !== 'All') {
                    if (!user.gender || s.gender !== user.gender) return false;
                }

                // Liberalized Ed Level matching (e.g., 'UG/PG' matches 'UG')
                if (s.education_level && s.education_level !== 'All' && user.education_level) {
                    const scholLevel = s.education_level.toLowerCase();
                    const userLevel = user.education_level.toLowerCase();
                    if (!scholLevel.includes(userLevel) && !userLevel.includes(scholLevel)) return false;
                }
                
                // If a scholarship has a specific state requirement, user must have that state
                if (s.state && s.state !== 'All') {
                    if (!user.state || s.state.toLowerCase() !== user.state.toLowerCase()) {
                        return false;
                    }
                }

                // Title-based state filtering for unclassified state scraped scholarships
                if (s.title) {
                    const titleLower = s.title.toLowerCase();
                    const mentionedState = indianStates.find(state => titleLower.includes(state));
                    if (mentionedState) {
                        if (!user.state || mentionedState !== user.state.toLowerCase()) {
                            return false; 
                        }
                    }
                }

                // Community filter
                if (s.community && s.community !== 'All') {
                    if (!user.community || s.community.toLowerCase() !== user.community.toLowerCase()) {
                        return false;
                    }
                }

                // Religion filter
                if (s.religion && s.religion !== 'All') {
                    if (!user.religion || s.religion.toLowerCase() !== user.religion.toLowerCase()) {
                        return false;
                    }
                }

                // Income filter
                if (s.income_limit && user.income && user.income > s.income_limit) {
                    return false;
                }

                // Academic Marks filter
                if (s.minimum_percentage && user.academic_marks && user.academic_marks < s.minimum_percentage) {
                    return false;
                }

                return true;
            })
            .map((s: any) => {
                const tfidfScore = calculateAdvancedMatch(userSkills, (s.description || '') + (s.eligibility || '') + (s.fields_of_study || []).join(' '));
                let eligibilityScore = 0;
                if (s.gender === 'All' || s.gender === user.gender) eligibilityScore += 30;
                if (s.education_level === 'All' || s.education_level === user.education_level) eligibilityScore += 30;

                const userSkillTags = userSkills.map(sk => sk.toLowerCase());
                const scholText = `${s.title} ${s.description || ''} ${(s.fields_of_study || []).join(' ')}`.toLowerCase();
                if (userSkillTags.some(sk => scholText.includes(sk))) eligibilityScore += 20;

                return {
                    _id: s._id,
                    title: s.title,
                    provider: s.provider,
                    amount: s.amount,
                    deadline: s.deadline,
                    education_level: s.education_level,
                    official_website: s.official_website,
                    description: s.description,
                    source: s.source || 'Buddy4Study', // INTERNHUB_UPDATE
                    match_score: Math.round((tfidfScore * 0.4) + (eligibilityScore * 0.6))
                };
            })
            .sort((a, b) => b.match_score - a.match_score)
            .slice(0, 10); // Top 10

        // ─── 3. Skill Gap Analysis ───────────────────────────────────────────
        const skillGaps = await analyzeSkillGaps(userId);

        res.json({
            matchedInternships: scoredInternships,
            matchedScholarships: scoredScholarships,
            skillGaps
        });

    } catch (err) {
        console.error('Career path recommendation error:', err);
        res.status(500).json({ error: 'Failed to generate career path recommendations' });
    }
});

// INTERNHUB_AI_MATCHING: AI-powered resume-to-opportunity matching
// Uses TF-IDF vectorization + cosine similarity to rank opportunities
router.get('/ai', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const userSkills: string[] = [
            ...(user.skills || []),
            ...(user.internshipPreferences?.skills || [])
        ];

        // If no skills at all, prompt resume upload
        if (userSkills.length === 0) {
            return res.json({
                opportunities: [],
                message: 'Upload your resume to get AI-powered recommendations.',
                hasResume: !!user.resumeUrl,
                skillCount: 0
            });
        }

        // Fetch all open internships + active scholarships
        const [internships, scholarships] = await Promise.all([
            Internship.find({ status: 'open' }).lean(),
            Scholarship.find({ is_active: true, deadline: { $gte: new Date() } }).lean()
        ]);

        // Combine into a unified opportunity list for scoring
        const allOpportunities: any[] = [
            ...internships.map((j: any) => ({ ...j, type: 'internship' })),
            ...scholarships.map((s: any) => ({ ...s, type: 'scholarship' }))
        ];

        // Compute similarity scores using comprehensive logic
        const scored = allOpportunities.map((opp) => {
            const matchPercent = calculateComprehensiveScore(user, opp);

            return {
                _id: opp._id,
                title: opp.title,
                company: opp.company || opp.provider,
                location: opp.location || opp.state,
                type: opp.type,
                stipend: opp.stipend,
                amount: opp.amount,
                deadline: opp.deadline,
                external_url: opp.external_url || opp.official_website,
                is_new: opp.is_new,
                source: opp.source,
                match_score: matchPercent
            };
        });

        // Sort by match score descending, return top 10
        scored.sort((a, b) => b.match_score - a.match_score);

        res.json({
            opportunities: scored.slice(0, 10),
            hasResume: !!user.resumeUrl,
            skillCount: userSkills.length,
            message: null
        });

    } catch (err) {
        console.error('AI matching error:', err);
        res.status(500).json({ error: 'Failed to generate AI recommendations' });
    }
});

export default router;
