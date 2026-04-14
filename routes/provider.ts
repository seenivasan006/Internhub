import { Router, Request, Response } from 'express';
import { Internship } from '../models/Internship';
import { Scholarship } from '../models/Scholarship';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { requireAuth, requireProvider } from '../middleware/auth';

const router = Router();

// GET /api/provider/opportunities - Get all opportunities owned by provider
router.get('/opportunities', requireAuth, requireProvider, async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user._id;
        const [internships, scholarships] = await Promise.all([
            Internship.find({ providerId }),
            Scholarship.find({ providerId })
        ]);
        res.json({ internships, scholarships });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});

// POST /api/provider/opportunities - Create opportunity
router.post('/opportunities', requireAuth, requireProvider, async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user._id;
        const { type, data } = req.body; // type: 'internship' | 'scholarship'

        if (type === 'internship') {
            const internship = await Internship.create({ ...data, providerId, source: 'Provider' });
            res.status(201).json({ internship });
        } else if (type === 'scholarship') {
            const scholarship = await Scholarship.create({ ...data, providerId, source: 'Provider' });
            res.status(201).json({ scholarship });
        } else {
            res.status(400).json({ error: 'Invalid opportunity type' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to create opportunity' });
    }
});

// PUT /api/provider/opportunities/:id - Update opportunity
router.put('/opportunities/:id', requireAuth, requireProvider, async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user._id;
        const { type, data } = req.body;

        if (type === 'internship') {
            const internship = await Internship.findOneAndUpdate({ _id: req.params.id, providerId }, data, { new: true });
            if (!internship) return res.status(404).json({ error: 'Internship not found or unauthorized' });
            res.json({ internship });
        } else if (type === 'scholarship') {
            const scholarship = await Scholarship.findOneAndUpdate({ _id: req.params.id, providerId }, data, { new: true });
            if (!scholarship) return res.status(404).json({ error: 'Scholarship not found or unauthorized' });
            res.json({ scholarship });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update opportunity' });
    }
});

// DELETE /api/provider/opportunities/:id - Delete opportunity
router.delete('/opportunities/:id', requireAuth, requireProvider, async (req: Request, res: Response) => {
    try {
        const providerId = (req as any).user._id;
        const { type } = req.query;

        if (type === 'internship') {
            await Internship.findOneAndDelete({ _id: req.params.id, providerId });
        } else {
            await Scholarship.findOneAndDelete({ _id: req.params.id, providerId });
        }
        res.json({ message: 'Opportunity deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete opportunity' });
    }
});

// GET /api/provider/opportunities/:id/applications - Get applicants
router.get('/opportunities/:id/applications', requireAuth, requireProvider, async (req: Request, res: Response) => {
    try {
        const applications = await Application.find({ opportunityId: req.params.id })
            .populate('userId', 'full_name email resumeUrl skills education_level college_or_company')
            .sort({ submittedAt: -1 });

        res.json({ applications });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// PUT /api/provider/applications/:id/status - Update application status
router.put('/applications/:id/status', requireAuth, requireProvider, async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        if (!['shortlisted', 'accepted', 'rejected', 'under_review'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!application) return res.status(404).json({ error: 'Application not found' });

        res.json({ message: 'Status updated', application });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;
