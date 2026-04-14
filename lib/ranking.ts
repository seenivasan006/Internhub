import { IInternship } from '../models/Internship';
import { IScholarship } from '../models/Scholarship';
import { IUser } from '../models/User';

export const rankInternships = (internships: IInternship[], user: IUser, query?: string) => {
    return internships.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // 1. Location / State Match (Highest Priority: +100)
        if (user.state || user.location) {
            const uState = (user.state || '').toLowerCase();
            const uLoc = (user.location || '').toLowerCase();

            const aLoc = (a.location || '').toLowerCase();
            const bLoc = (b.location || '').toLowerCase();

            if (uLoc && aLoc.includes(uLoc)) scoreA += 100;
            if (uLoc && bLoc.includes(uLoc)) scoreB += 100;

            if (uState && aLoc.includes(uState)) scoreA += 50;
            if (uState && bLoc.includes(uState)) scoreB += 50;
        }

        // 2. Education Level Match (+50)
        if (user.education_level) {
            if (a.description.toLowerCase().includes(user.education_level.toLowerCase())) scoreA += 50;
            if (b.description.toLowerCase().includes(user.education_level.toLowerCase())) scoreB += 50;
        }

        // 3. Match User Skills (+5 per skill - Secondary "Relatability")
        if (user.skills && user.skills.length > 0) {
            const userSkillsLower = user.skills.map(s => s.toLowerCase());
            const aSkillsLower = (a.skills_required || []).map(s => s.toLowerCase());
            const bSkillsLower = (b.skills_required || []).map(s => s.toLowerCase());

            scoreA += aSkillsLower.filter(s => userSkillsLower.includes(s)).length * 5;
            scoreB += bSkillsLower.filter(s => userSkillsLower.includes(s)).length * 5;
        }

        // 4. Query String Relevance in Title (+10)
        if (query) {
            const qLower = query.toLowerCase();
            if (a.title.toLowerCase().includes(qLower)) scoreA += 10;
            if (b.title.toLowerCase().includes(qLower)) scoreB += 10;
        }

        // 5. New Boost (+5)
        if (a.is_new) scoreA += 5;
        if (b.is_new) scoreB += 5;

        // 6. Recency (Secondary sort)
        if (scoreA === scoreB) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        return scoreB - scoreA;
    });
};

export const rankScholarships = (scholarships: IScholarship[], user: IUser, query?: string) => {
    return scholarships.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // 1. Location / State Match (+100)
        if (user.state) {
            const uState = user.state.toLowerCase();
            if (a.state && (a.state.toLowerCase() === uState || a.state === 'All')) scoreA += 100;
            if (b.state && (b.state.toLowerCase() === uState || b.state === 'All')) scoreB += 100;
        }

        // 2. Gender Match (+80)
        if (user.gender) {
            if (!a.gender || a.gender === 'All' || a.gender === user.gender) scoreA += 80;
            if (!b.gender || b.gender === 'All' || b.gender === user.gender) scoreB += 80;
        }

        // 3. Education Level Match (+70)
        if (user.education_level) {
            if (a.education_level === user.education_level || a.education_level === 'All') scoreA += 70;
            if (b.education_level === user.education_level || b.education_level === 'All') scoreB += 70;
        }

        // 4. Query Match (+10)
        if (query) {
            const qLower = query.toLowerCase();
            if (a.title.toLowerCase().includes(qLower)) scoreA += 10;
            if (b.title.toLowerCase().includes(qLower)) scoreB += 10;
        }

        if (a.is_featured) scoreA += 5;
        if (b.is_featured) scoreB += 5;

        if (scoreA === scoreB) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        return scoreB - scoreA;
    });
};
