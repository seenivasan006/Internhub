// INTERNHUB_UPDATE: Application routes for one-click apply & tracking
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { Application } from '../models/Application';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';
import { User } from '../models/User';
import { generateApplicationDraft } from '../services/autoFillService';

const router = Router();

// POST /api/applications/draft – Create or load a draft
router.post('/draft', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { opportunityId, type } = req.body;
        console.log(`[API] Creating application draft for user ${userId}, opportunity ${opportunityId} (${type})`);

        // Check for existing application
        const existing = await Application.findOne({ userId, opportunityId });
        if (existing) {
            return res.json({ application: existing, isExisting: true });
        }

        // Fetch the opportunity
        let opportunity: any;
        if (type === 'internship') {
            opportunity = await Internship.findById(opportunityId).lean();
        } else {
            opportunity = await Scholarship.findById(opportunityId).lean();
        }
        if (!opportunity) {
            console.error(`[API] Opportunity ${opportunityId} of type ${type} not found!`);
            return res.status(404).json({ error: 'The opportunity could not be found. It may have expired or been removed.' });
        }

        // Fetch user profile for auto-fill
        const user = await User.findById(userId);
        if (!user) {
            console.error(`[API] User ${userId} not found!`);
            return res.status(404).json({ error: 'User profile not found.' });
        }

        // Generate auto-filled draft
        const answers = generateApplicationDraft(user, { ...opportunity, type });

        const application = await Application.create({
            userId,
            opportunityId,
            opportunityTitle: opportunity.title,
            opportunityProvider: type === 'internship' ? opportunity.company : (opportunity.provider || 'Scholarship Provider'),
            opportunityUrl: (type === 'internship' ? opportunity.external_url : (opportunity.official_website || opportunity.external_url)) || 'https://internhub.com', // INTERNHUB_UPDATE: Fallback URL
            type,
            status: 'draft',
            answers,
            attachments: user.resumeUrl ? [user.resumeUrl] : []
        });

        res.json({ application, isExisting: false });
    } catch (err: any) {
        if (err.code === 11000) {
            // Duplicate – load existing
            const userId = (req as any).user._id;
            const existing = await Application.findOne({ userId, opportunityId: req.body.opportunityId });
            return res.json({ application: existing, isExisting: true });
        }
        res.status(500).json({ error: 'Failed to create draft' });
    }
});

// POST /api/applications/submit – Submit an application
router.post('/submit', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { applicationId, answers } = req.body;

        const application = await Application.findOne({ _id: applicationId, userId });
        if (!application) return res.status(404).json({ error: 'Application not found' });
        if (application.status !== 'draft') {
            return res.status(400).json({ error: 'Application already submitted' });
        }

        // Update answers if provided
        if (answers) {
            for (const [key, value] of Object.entries(answers)) {
                application.answers.set(key, value as string);
            }
        }

        application.status = 'submitted';
        application.submittedAt = new Date();
        application.lastUpdated = new Date();
        await application.save();

        res.json({ success: true, application });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// GET /api/applications – List all applications for a user
router.get('/', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { status, type } = req.query;

        const filter: any = { userId };
        if (status) filter.status = status;
        if (type) filter.type = type;

        const applications = await Application.find(filter)
            .sort({ lastUpdated: -1 })
            .lean();

        res.json({ applications });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET /api/applications/:id – Get a single application
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const application = await Application.findOne({ _id: req.params.id, userId }).lean();
        if (!application) return res.status(404).json({ error: 'Application not found' });
        res.json({ application });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// PUT /api/applications/:id – Update a draft
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const application = await Application.findOne({ _id: req.params.id, userId });
        if (!application) return res.status(404).json({ error: 'Application not found' });
        if (application.status !== 'draft') {
            return res.status(400).json({ error: 'Cannot edit a submitted application' });
        }

        const { answers } = req.body;
        if (answers) {
            for (const [key, value] of Object.entries(answers)) {
                application.answers.set(key, value as string);
            }
        }
        application.lastUpdated = new Date();
        await application.save();

        res.json({ success: true, application });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// DELETE /api/applications/:id – Delete a draft
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const application = await Application.findOne({ _id: req.params.id, userId });
        if (!application) return res.status(404).json({ error: 'Application not found' });
        if (application.status !== 'draft') {
            return res.status(400).json({ error: 'Cannot delete a submitted application' });
        }
        await Application.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: 'Draft deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// POST /api/applications/:id/cancel – Cancel a submitted application
router.post('/:id/cancel', requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const application = await Application.findOne({ _id: req.params.id, userId });

        if (!application) return res.status(404).json({ error: 'Application not found' });

        // Only allow canceling if not already processed in a way that makes it immutable
        if (['accepted', 'rejected'].includes(application.status)) {
            return res.status(400).json({ error: 'Cannot cancel an application that has already been accepted or rejected.' });
        }

        // Use deleteOne to remove it permanently as requested by the user
        await Application.deleteOne({ _id: req.params.id, userId });
        res.json({ success: true, message: 'Application canceled and deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to cancel application' });
    }
});

export default router;
