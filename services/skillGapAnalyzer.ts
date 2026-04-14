// INTERNHUB_PHASE2_UPDATE: Skill Gap Analyzer Service
// Analyzes user skills vs internship requirements and surfaces learning opportunities

import { User } from '../models/User';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';

export interface SkillGap {
    skill: string;
    demandCount: number;
    suggestedScholarships: {
        id: string;
        title: string;
        provider: string;
        descriptionSnippet: string;
        source: string; // INTERNHUB_UPDATE
    }[];
}

/**
 * Analyzes skill gaps for a given user by comparing their skills
 * against all open internship requirements, then surfaces scholarships
 * that could help them learn each missing skill.
 */
export const analyzeSkillGaps = async (userId: string): Promise<SkillGap[]> => {
    // 1. Fetch user profile
    const user = await User.findById(userId).lean();
    if (!user) return [];

    const userSkills = [
        ...(user.skills || []),
        ...(user.internshipPreferences?.skills || [])
    ].map(s => s.toLowerCase().trim());

    // 2. Fetch open internships
    const internships = await Internship.find({ status: 'open' }).lean();

    // 3. Count missing skill frequency across internships
    const missingSkillCount = new Map<string, number>();

    for (const job of internships) {
        const required = (job.skills_required || []).map((s: string) => s.toLowerCase().trim());
        for (const skill of required) {
            if (skill && !userSkills.includes(skill)) {
                missingSkillCount.set(skill, (missingSkillCount.get(skill) || 0) + 1);
            }
        }
    }

    // 4. Sort by demand, take top 8 gaps
    const sortedGaps = Array.from(missingSkillCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    if (sortedGaps.length === 0) return [];

    // 5. Fetch all active scholarships once
    const scholarships = await Scholarship.find({
        is_active: true,
        deadline: { $gte: new Date() }
    }).lean();

    // 6. Build skill gaps with matching scholarships
    const skillGaps: SkillGap[] = sortedGaps.map(([skill, demandCount]) => {
        // Match scholarships whose title/description/tags mention the skill or related domain
        const relatedKeywords = getRelatedKeywords(skill);

        const matched = scholarships
            .filter((s: any) => {
                const haystack = `${s.title} ${s.description || ''} ${(s.fields_of_study || []).join(' ')}`.toLowerCase();
                return relatedKeywords.some(kw => haystack.includes(kw));
            })
            .slice(0, 3)
            .map((s: any) => ({
                id: s._id.toString(),
                title: s.title,
                provider: s.provider,
                descriptionSnippet: (s.description || '').substring(0, 120),
                source: s.source || 'Buddy4Study', // INTERNHUB_UPDATE
                url: s.official_website || `/scholarships?id=${s._id}`
            }));

        return {
            skill: capitalizeFirst(skill),
            demandCount,
            suggestedScholarships: matched
        };
    });

    return skillGaps;
};

/** Expand a skill into related search keywords for scholarship matching */
const getRelatedKeywords = (skill: string): string[] => {
    const base = skill.toLowerCase();
    const domainMap: Record<string, string[]> = {
        'python': ['python', 'programming', 'software', 'data science', 'machine learning', 'backend'],
        'javascript': ['javascript', 'web', 'frontend', 'programming', 'software', 'react', 'node'],
        'react': ['react', 'web', 'frontend', 'javascript', 'programming', 'ui'],
        'machine learning': ['machine learning', 'ai', 'data science', 'artificial intelligence', 'python', 'ml'],
        'artificial intelligence': ['artificial intelligence', 'ai', 'machine learning', 'deep learning', 'neural'],
        'tensorflow': ['tensorflow', 'deep learning', 'ai', 'machine learning', 'data science', 'python'],
        'sql': ['sql', 'database', 'data', 'analytics', 'backend', 'postgresql', 'mysql'],
        'java': ['java', 'programming', 'software', 'backend', 'spring'],
        'data science': ['data science', 'analytics', 'machine learning', 'statistics', 'python'],
        'deep learning': ['deep learning', 'ai', 'machine learning', 'neural'],
        'cloud': ['cloud', 'aws', 'azure', 'devops', 'gcp', 'infrastructure'],
        'docker': ['docker', 'devops', 'cloud', 'container', 'kubernetes'],
        'figma': ['figma', 'ui', 'ux', 'design', 'product', 'graphics'],
        'node': ['node', 'backend', 'javascript', 'express', 'server'],
        'digital marketing': ['digital marketing', 'seo', 'social media', 'content strategy', 'advertising', 'marketing'],
        'data analysis': ['data analysis', 'statistics', 'excel', 'tableau', 'power bi', 'analytics'],
        'ui/ux': ['ui/ux', 'design', 'figma', 'user interface', 'user experience', 'prototyping']
    };
    // If no specific map, only search for the skill itself to avoid irrelevant "Engineering" fallbacks
    return domainMap[base] || [base];
};

const capitalizeFirst = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1);
