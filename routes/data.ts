import { Router, Request, Response } from 'express';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';
import { rankInternships, rankScholarships } from '../lib/ranking';
import { requireAuth } from '../middleware/auth';
import { matchScore } from '../services/recommendation';
import { calculateScholarshipMatch } from '../services/scholarshipMatching';
import { User } from '../models/User';

const router = Router();

import { calculateAdvancedMatch, calculateComprehensiveScore } from '../services/aiRecommendation';

router.get('/internships', requireAuth, async (req: Request, res: Response) => {
    try {
        const { query: searchQuery, location, skills } = req.query;
        const user = (req as any).user;
        console.log(`\n--- Dashboard Fetch: Internships ---`);
        console.log(`User: ${user?.email}`);
        console.log(`User Location: ${user?.location}, Preference: ${user?.location_preference}`);

        const searchFilter: any = { status: 'open' };

        // INTERNHUB_UPDATE: Strict Location Filtering
        if (searchQuery) {
            searchFilter.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { company: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // INTERNHUB_PHASE1_UPDATE: Direct location query param
        if (location) {
            searchFilter.location = { $regex: location, $options: 'i' };
        } else if (user.location_preference || user.location) {
            const preferredLocations = [
                user.location_preference,
                user.location,
                'Remote',
                'India' // ALWAYS include India as fallback to prevent empty results
            ].filter(Boolean);

            searchFilter.location = {
                $regex: preferredLocations.join('|'),
                $options: 'i'
            };
        }

        console.log(`DEBUG: Search Filter: ${JSON.stringify(searchFilter)}`);
        let internships = await Internship.find(searchFilter).lean();
        console.log(`DEBUG: Filtered Internships: ${internships.length}`);

        // Fallback 1: Broaden to Remote if strict match fails
        if (internships.length === 0 && (user.location_preference || user.location)) {
            const fallbackFilter = { status: 'open', location: { $regex: 'Remote', $options: 'i' } };
            internships = await Internship.find(fallbackFilter).lean();
            console.log(`DEBUG: Fallback (Remote) Internships: ${internships.length}`);
        }

        // Fallback 2: If STILL zero, show any open internships (don't leave user with empty dashboard)
        if (internships.length === 0) {
            internships = await Internship.find({ status: 'open' }).limit(50).lean();
            console.log(`DEBUG: Emergency Fallback (All Open) Internships: ${internships.length}`);
        }

        // AI Smart Match Score Logic
        const recommended = internships.map((job: any) => {
            const totalScore = calculateComprehensiveScore(user, job);

            return {
                ...job,
                match_score: totalScore
            };
        }).sort((a, b) => b.match_score - a.match_score);

        // DEBUG: Log matches for first 3 jobs
        console.log(`🔍 Found ${recommended.length} internships for user ${user.email}. Top Match Score: ${recommended[0]?.match_score || 0}`);
        if (recommended.length === 0) {
            console.log(`⚠️ No internship recommendations for user ${user.email}. User Skills: ${[...(user.skills || []), ...(user.internshipPreferences?.skills || [])].join(', ')}`);
        }

        res.json({ internships: recommended });


    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch internships' });
    }
});

// INTERNHUB_PHASE1_UPDATE: Personalized internship recommendations
router.get('/internships/recommendations/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const internships = await Internship.find({ status: 'open' }).lean();

        const userSkills = [...(user.skills || []), ...(user.internshipPreferences?.skills || [])];

        const scored = internships.map((job: any) => {
            const totalScore = calculateComprehensiveScore(user, job);
            return { ...job, match_score: totalScore };
        }).sort((a, b) => b.match_score - a.match_score);

        res.json({ internships: scored.slice(0, 20) }); // Top 20 recommendations
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});
router.get('/scholarships', requireAuth, async (req: Request, res: Response) => {
    try {
        let scholarships = await Scholarship.find({
            is_active: true,
            deadline: { $gte: new Date() }
        }).lean();

        if (scholarships.length === 0) {
            scholarships = await Scholarship.find({ is_active: true }).limit(20).lean();
        }

        const user = (req as any).user;
        const scored = scholarships.map((s: any) => {
            const totalScore = calculateComprehensiveScore(user, s);
            return {
                ...s,
                match_score: totalScore,
                is_eligible_match: totalScore >= 40 // Heuristic for highlighting
            };
        }).sort((a, b) => b.match_score - a.match_score);

        // DEBUG: Log scholarship matches
        console.log(`🎓 Found ${scored.length} scholarships for user ${user.email}. Top Match Score: ${scored[0]?.match_score || 0}`);

        res.json({ scholarships: scored });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
});

router.get('/scholarships/recommended/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const scholarships = await Scholarship.find({
            is_active: true,
            deadline: { $gte: new Date() }
        }).lean();

        const scored = scholarships.map((s: any) => {
            const skillScore = calculateAdvancedMatch(user.skills, (s.description || '') + (s.eligibility || ''));

            // Eligibility logic
            let eligibilityScore = 0;
            if (s.education_level === 'All' || s.education_level === user.education_level) eligibilityScore += 40;
            if (s.gender === 'All' || s.gender === user.gender) eligibilityScore += 40;

            // Location Score (Live Location)
            if (user.state && (s.state === 'All' || s.state?.toLowerCase().includes(user.state.toLowerCase()))) eligibilityScore += 10;
            if (user.location && (s.location === 'All' || s.location?.toLowerCase().includes(user.location.toLowerCase()))) eligibilityScore += 10;

            const finalMatch = Math.round((skillScore * 0.4) + (eligibilityScore * 0.6));

            return {
                ...s,
                match_score: finalMatch
            };
        });

        scored.sort((a, b) => b.match_score - a.match_score);

        res.json({ scholarships: scored });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recommended scholarships' });
    }
});

// INTERNHUB_UPDATE: Admin CRUD Operations

// Update Opportunity (Internship or Scholarship)
router.put('/opportunities/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user.isAdmin && user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { type, ...updateData } = req.body; // type must be 'internship' or 'scholarship'

        let updated;
        if (type === 'internship') {
            updated = await Internship.findByIdAndUpdate(id, updateData, { new: true });
        } else {
            updated = await Scholarship.findByIdAndUpdate(id, updateData, { new: true });
        }

        if (!updated) return res.status(404).json({ error: 'Opportunity not found' });
        res.json({ message: 'Updated successfully', opportunity: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update opportunity' });
    }
});

// Delete Opportunity
router.delete('/opportunities/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user.isAdmin && user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const { type } = req.query; // Expecting ?type=internship or scholarship

        let deleted;
        if (type === 'internship') {
            deleted = await Internship.findByIdAndDelete(id);
        } else {
            deleted = await Scholarship.findByIdAndDelete(id);
        }

        if (!deleted) return res.status(404).json({ error: 'Opportunity not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete opportunity' });
    }
});

// Diagnostic endpoint
router.get('/debug-stats', async (req, res) => {
    const intCount = await Internship.countDocuments({ status: 'open' });
    const scholCount = await Scholarship.countDocuments({ is_active: true, deadline: { $gte: new Date() } });
    res.json({
        timestamp: new Date(),
        internships: intCount,
        scholarships: scholCount,
        env: process.env.NODE_ENV
    });
});

export default router;
