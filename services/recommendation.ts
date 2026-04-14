import { IUser } from '../models/User';

export const matchScore = (userSkills: string[], internshipSkills: string[], user?: IUser, scholarship?: any) => {
    let score = 0;

    if (userSkills && internshipSkills) {
        const userSkillsLower = userSkills.map(s => s.toLowerCase());
        const internshipSkillsLower = internshipSkills.map(s => s.toLowerCase());

        const matches = internshipSkillsLower.filter(skill =>
            userSkillsLower.includes(skill)
        );
        score += matches.length * 10;
    }

    // Scholarship specific matching
    if (user && scholarship) {
        // Religion match
        if (scholarship.religion && scholarship.religion !== 'All') {
            if (user.religion === scholarship.religion) {
                score += 50;
            } else {
                score -= 100; // Hard mismatch for targeted scholarships
            }
        }

        // Academic marks match
        if (scholarship.minimum_percentage && user.academic_marks) {
            if (user.academic_marks >= scholarship.minimum_percentage) {
                score += 30;
            } else {
                score -= 50;
            }
        }

        // Community match
        if (scholarship.community && scholarship.community !== 'All') {
            if (user.community === scholarship.community) {
                score += 40;
            } else {
                score -= 80;
            }
        }
    }

    return score;
};
