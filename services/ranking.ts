import { IUser } from '../models/User';

export const calculateRanking = (internship: any, user?: IUser) => {
    let score = 0;

    // New internships boost
    const daysOld =
        (Date.now() - new Date(internship.created_at || Date.now()).getTime()) /
        (1000 * 60 * 60 * 24);

    if (daysOld < 3) score += 40;
    else if (daysOld < 7) score += 25;

    // Salary boost / User preference
    if (internship.stipend && internship.stipend !== 'Unpaid / Undisclosed') {
        score += 20;

        // Check against user's minimum stipend preference
        if (user?.min_stipend) {
            const stipendValue = parseInt(internship.stipend.replace(/[^0-9]/g, ''));
            if (!isNaN(stipendValue) && stipendValue >= user.min_stipend) {
                score += 30;
            }
        }
    }

    // Company Type matching
    if (user?.preferred_company_types && user.preferred_company_types.length > 0) {
        const companyMatches = user.preferred_company_types.includes('Any') || user.preferred_company_types.some(type =>
            internship.description?.toLowerCase().includes(type.toLowerCase()) ||
            internship.company?.toLowerCase().includes(type.toLowerCase())
        );
        if (companyMatches) score += 25;
    }

    // Duration matching
    if (user?.preferred_duration && internship.duration) {
        const durationValue = parseInt(internship.duration.replace(/[^0-9]/g, ''));
        if (!isNaN(durationValue) && durationValue <= user.preferred_duration) {
            score += 20;
        }
    }

    // Verified source boost
    if (internship.source === 'Adzuna API') {
        score += 15;
    }

    return score;
};
