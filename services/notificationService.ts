import { User } from '../models/User';
import { sendMail } from './mailService';
import { Internship } from '../models/Internship';
import { Scholarship, IScholarship } from '../models/Scholarship';
import { calculateAdvancedMatch } from './aiRecommendation';

export const findAndNotifyMatches = async () => {
    console.log('📨 Starting matching and notification service...');
    try {
        const users = await User.find({ onboarding_completed: true });
        const internships = await Internship.find({ status: 'open' }).sort({ created_at: -1 }).limit(20);
        const scholarships = await Scholarship.find({ is_active: true, deadline: { $gte: new Date() } });

        for (const user of users) {
            const matchedInternships = internships
                .map(job => ({
                    ...job,
                    score: calculateAdvancedMatch(user.skills, job.description + (job.skills_required || []).join(' '))
                }))
                .filter(job => job.score >= 60)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            const matchedScholarships = scholarships
                .filter(s => {
                    if (s.gender && s.gender !== 'All' && user.gender && s.gender !== user.gender) return false;
                    if (s.education_level && s.education_level !== 'All' && user.education_level && s.education_level !== user.education_level) return false;
                    return true;
                })
                .map(s => ({
                    ...s,
                    score: calculateAdvancedMatch(user.skills, (s.description || '') + (s.provider || ''))
                }))
                .filter(s => s.score >= 50)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            if (matchedInternships.length > 0 || matchedScholarships.length > 0) {
                await sendNotificationEmail(user, matchedInternships, matchedScholarships);
            }
        }
        console.log('✅ Notifications sent to matched users.');
    } catch (err) {
        console.error('❌ Notification Service Error:', err);
    }
};

const sendNotificationEmail = async (user: any, internships: any[], scholarships: any[]) => {
    const subject = `InternHub: ${internships.length + scholarships.length} New Opportunities Matched for You!`;

    let html = `<h2>Hello ${user.full_name},</h2>`;
    html += `<p>We found some opportunities matching your profile and skills:</p>`;

    if (internships.length > 0) {
        html += `<h3>Top Internship Matches:</h3><ul>`;
        internships.forEach(i => {
            html += `<li><strong>${i.title}</strong> at ${i.company} (${i.score}% Match)</li>`;
        });
        html += `</ul>`;
    }

    if (scholarships.length > 0) {
        html += `<h3>Top Scholarship Matches:</h3><ul>`;
        scholarships.forEach(s => {
            html += `<li><strong>${s.title}</strong> (${s.score}% Match)</li>`;
        });
        html += `</ul>`;
    }

    html += `<p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard">View all matches on your dashboard</a></p>`;
    html += `<p>Best regards,<br/>The InternHub Team</p>`;

    try {
        await sendMail(user.email, subject, html);
    } catch (e) {
        console.error(`Failed to send email to ${user.email}`, e);
    }
};
