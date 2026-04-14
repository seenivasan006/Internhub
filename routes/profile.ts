import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

const router = Router();

router.put('/onboarding', requireAuth, async (req: Request, res: Response) => {
    try {
        const {
            preferred_language, location, skills, state, community, education_level, income,
            gender, password, college_or_company, resume_link, degree,
            religion, aadhaar_last_four, academic_marks, location_preference, preferred_company_types, min_stipend, preferred_duration,
            notification_enabled, notification_frequency,
            educationLevel, collegeName, annualIncome, dateOfBirth
        } = req.body;
        const user = (req as any).user;

        const updates: any = {
            preferred_language: preferred_language || 'English',
            location,
            state,
            community,
            education_level,
            income,
            gender,
            college_or_company,
            resume_link,
            degree,
            religion,
            aadhaar_last_four,
            academic_marks,
            location_preference,
            preferred_company_types: Array.isArray(preferred_company_types) ? preferred_company_types : [],
            min_stipend: min_stipend ? Number(min_stipend) : null,
            preferred_duration: preferred_duration ? Number(preferred_duration) : null,
            notification_enabled: notification_enabled !== undefined ? notification_enabled : true,
            notification_frequency: notification_frequency || 'daily',
            skills: Array.isArray(skills) ? skills : [],
            onboarding_completed: true,
            educationLevel,
            collegeName,
            annualIncome,
            dateOfBirth
        };

        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        await User.findByIdAndUpdate(user._id, updates);
        res.json({ message: 'Onboarding completed', redirect: '/dashboard' });
    } catch (err) {
        console.error('Onboarding error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.put('/settings', requireAuth, async (req: Request, res: Response) => {
    try {
        const {
            preferred_language, skills, location, state, community, education_level, income, gender,
            religion, aadhaar_last_four, academic_marks, location_preference, preferred_company_types, min_stipend, preferred_duration,
            notification_enabled, notification_frequency,
            educationLevel, collegeName, annualIncome, dateOfBirth,
            college_or_company, resume_link, degree, year_of_study, interests
        } = req.body;
        const user = (req as any).user;

        const updateData: any = {
            preferred_language,
            skills: Array.isArray(skills) ? skills : undefined,
            location, state, community, education_level, income, gender,
            religion, aadhaar_last_four, academic_marks, location_preference,
            preferred_company_types: Array.isArray(preferred_company_types) ? preferred_company_types : undefined,
            min_stipend: minStipendNumber(min_stipend),
            preferred_duration: preferredDurationNumber(preferred_duration),
            notification_enabled: notification_enabled !== undefined ? notification_enabled : undefined,
            notification_frequency,
            onboarding_completed: true,
            // Enhanced Fields
            educationLevel,
            collegeName,
            annualIncome: incomeNumber(income || annualIncome),
            dateOfBirth,
            // Consistency fields
            college_or_company: college_or_company || collegeName,
            resume_link,
            degree,
            year_of_study,
            interests: Array.isArray(interests) ? interests : undefined
        };

        function minStipendNumber(val: any) {
            if (val === undefined) return undefined;
            return val ? Number(val) : null;
        }
        function preferredDurationNumber(val: any) {
            if (val === undefined) return undefined;
            return val ? Number(val) : null;
        }
        function incomeNumber(val: any) {
            if (val === undefined) return undefined;
            return val ? Number(val) : null;
        }

        // Remove undefined fields to avoid overwriting with null if unintentional
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ message: 'Settings updated', user: updatedUser });
    } catch (err) {
        console.error('Settings update error:', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});


router.get('/saved', requireAuth, async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    try {
        const user = await User.findById(userId)
            .populate('saved_internships')
            .populate('saved_scholarships');

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            saved_internships: user.saved_internships || [],
            saved_scholarships: user.saved_scholarships || []
        });
    } catch (err) {
        console.error('Error fetching saved items:', err);
        res.status(500).json({ error: 'Failed to fetch saved items' });
    }
});

router.post('/save/:type/:id', requireAuth, async (req: Request, res: Response) => {
    const { type, id } = req.params;
    const userId = (req as any).user._id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (type === 'internship') {
            const index = user.saved_internships.indexOf(id as any);
            if (index > -1) {
                user.saved_internships.splice(index, 1);
            } else {
                user.saved_internships.push(id as any);
            }
        } else if (type === 'scholarship') {
            const index = user.saved_scholarships.indexOf(id as any);
            if (index > -1) {
                user.saved_scholarships.splice(index, 1);
            } else {
                user.saved_scholarships.push(id as any);
            }
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        await user.save();
        res.json({
            message: 'Save toggled successfully',
            saved_internships: user.saved_internships,
            saved_scholarships: user.saved_scholarships
        });

    } catch (err) {
        console.error('Error toggling save status:', err);
        res.status(500).json({ error: 'Failed to toggle save status' });
    }
});

router.put('/location', requireAuth, async (req: Request, res: Response) => {
    try {
        const { location, state } = req.body;
        const user = (req as any).user;
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { location, state },
            { new: true }
        ).select('-password');
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update location' });
    }
});

router.put('/preferences', requireAuth, async (req: Request, res: Response) => {
    try {
        const { type, preferences } = req.body; // type = 'internship' | 'scholarship'
        const user = (req as any).user;
        const updateField = type === 'internship' ? 'internshipPreferences' : 'scholarshipPreferences';

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { [updateField]: preferences },
            { new: true }
        ).select('-password');
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export default router;
