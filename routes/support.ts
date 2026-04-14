// INTERNHUB_UPDATE: Support ticket routes for in-app helpdesk
import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { SupportTicket } from '../models/SupportTicket';

const router = Router();

// POST /api/support/tickets – Create a new ticket
router.post('/tickets', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { subject, description, category } = req.body;

        if (!subject || !description) {
            return res.status(400).json({ error: 'Subject and description are required' });
        }

        const ticket = await SupportTicket.create({
            userId: user._id,
            userName: user.full_name,
            userEmail: user.email,
            subject,
            description,
            category: category || 'general',
            messages: [{
                sender: 'user',
                message: description,
                timestamp: new Date()
            }]
        });

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// GET /api/support/tickets – List tickets (user's own, or all for admin)
router.get('/tickets', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const isAdmin = user.isAdmin || user.role === 'admin';
        const { status } = req.query;

        const filter: any = isAdmin ? {} : { userId: user._id };
        if (status) filter.status = status;

        const tickets = await SupportTicket.find(filter)
            .sort({ updatedAt: -1 })
            .lean();

        res.json({ tickets });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// GET /api/support/tickets/:id – Get a specific ticket with messages
router.get('/tickets/:id', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const isAdmin = user.isAdmin || user.role === 'admin';

        const ticket = await SupportTicket.findById(req.params.id).lean();
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        // Non-admin can only view their own tickets
        if (!isAdmin && ticket.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ ticket });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});

// POST /api/support/tickets/:id/messages – Add a message
router.post('/tickets/:id/messages', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const isAdmin = user.isAdmin || user.role === 'admin';
        const { message } = req.body;

        if (!message) return res.status(400).json({ error: 'Message is required' });

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (!isAdmin && ticket.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        ticket.messages.push({
            sender: isAdmin ? 'admin' : 'user',
            message,
            timestamp: new Date()
        });
        ticket.updatedAt = new Date();

        // If admin replies, move to in_progress
        if (isAdmin && ticket.status === 'open') {
            ticket.status = 'in_progress';
        }

        await ticket.save();
        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add message' });
    }
});

// PUT /api/support/tickets/:id/status – Change status (admin only)
router.put('/tickets/:id/status', requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user.isAdmin && user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { status } = req.body;
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

export default router;
