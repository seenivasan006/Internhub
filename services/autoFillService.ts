// INTERNHUB_UPDATE: Auto-fill service that maps user profile to application fields
import { IUser } from '../models/User';

interface AutoFilledDraft {
    fullName: string;
    email: string;
    location: string;
    state: string;
    education: string;
    fieldOfStudy: string;
    skills: string;
    college: string;
    resumeUrl: string;
    coverLetter: string;
    whyApply: string;
}

export function generateApplicationDraft(user: IUser, opportunity: any): Map<string, string> {
    const answers = new Map<string, string>();

    // Common fields from profile
    answers.set('fullName', user.full_name || '');
    answers.set('email', user.email || '');
    answers.set('location', user.location || '');
    answers.set('state', user.state || '');
    answers.set('education', user.education_level || '');
    answers.set('fieldOfStudy', user.field_of_study || '');
    answers.set('skills', (user.skills || []).join(', '));
    answers.set('college', user.college_or_company || '');
    answers.set('resumeUrl', user.resumeUrl || user.resume_link || '');

    if (opportunity.type === 'internship' || !opportunity.type) {
        // Generate a simple cover letter template
        const skillsList = (user.skills || []).slice(0, 5).join(', ');
        answers.set('coverLetter',
            `Dear Hiring Manager,\n\nI am ${user.full_name}, ` +
            `a ${user.education_level || 'student'} with skills in ${skillsList || 'various areas'}. ` +
            `I am excited to apply for the ${opportunity.title} position at ${opportunity.company || opportunity.provider}.\n\n` +
            `I believe my background in ${user.field_of_study || 'my field'} and practical experience ` +
            `make me a strong candidate for this role.\n\n` +
            `Thank you for considering my application.\n\nBest regards,\n${user.full_name}`
        );
    }

    if (opportunity.type === 'scholarship') {
        answers.set('whyApply',
            `I am applying for the ${opportunity.title} scholarship because ` +
            `it aligns with my academic goals in ${user.field_of_study || 'my field of study'}. ` +
            `As a ${user.education_level || 'student'} from ${user.location || 'India'}, ` +
            `this scholarship would significantly support my educational journey.`
        );
    }

    return answers;
}
