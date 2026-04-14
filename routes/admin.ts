import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// GET /api/admin/providers/pending - List providers awaiting approval
router.get('/providers/pending', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const pendingProviders = await User.find({ role: 'provider', approved: false });
        res.json({ providers: pendingProviders });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending providers' });
    }
});

// PUT /api/admin/providers/:id/approve - Approve a provider
router.put('/providers/:id/approve', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
        if (!user) return res.status(404).json({ error: 'Provider not found' });
        res.json({ message: 'Provider approved successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve provider' });
    }
});

// DELETE /api/admin/providers/:id/reject - Reject (delete) a provider
router.delete('/providers/:id/reject', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'Provider not found' });
        res.json({ message: 'Provider rejected and deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject provider' });
    }
});

import { 
    scrapeInternshala, 
    scrapeLinkedIn, 
    scrapeIndeed, 
    scrapeAdzuna, 
    scrapeNaukri 
} from '../scraper/internships';
import { 
    scrapeScholarships, 
    scrapeNSP, 
    scrapeScholarshipOwl 
} from '../scraper/scholarships';

// POST /api/admin/sync-scrapers - Manually trigger all scrapers
router.post('/sync-scrapers', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        console.log('🔄 Admin-triggered Manual Sync Started...');
        
        // Run in background but return immediately to avoid timeout
        scrapeInternshala().catch(console.error);
        scrapeScholarships().catch(console.error);
        scrapeLinkedIn().catch(console.error);

        res.json({ message: 'Scrapers triggered in background. Check database in a few minutes.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to trigger scrapers' });
    }
});

export default router;
