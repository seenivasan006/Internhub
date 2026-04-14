import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token && process.env.NODE_ENV !== 'production') {
            // DEBUG BYPASS: Auto-login as first user
            const debugUser = await User.findOne({ email: 'vasanseeni006@gmail.com' });
            if (debugUser) {
                (req as any).user = debugUser;
                return next();
            }
        }
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized. User not found.' });
        }

        // Attach user to request
        (req as any).user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
};

export const requireOnboarding = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user.onboarding_completed) {
        return res.status(403).json({ error: 'Forbidden. Onboarding required.', redirect: '/onboarding' });
    }
    next();
};
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin access required.' });
    }
    next();
};

export const requireProvider = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'provider') {
        return res.status(403).json({ error: 'Forbidden. Provider access required.' });
    }
    if (!user.approved) {
        return res.status(403).json({ error: 'Access Denied. Your account is pending approval.' });
    }
    next();
};
