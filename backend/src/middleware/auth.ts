import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Oga, where your token? No entry without pass! 🚫" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Your token don expire or no correct. Try again! ⏰" });
    }
};

// Optional auth - attaches userId if token exists, but doesn't block requests
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
            req.userId = decoded.userId;
        } catch (error) {
            // Token invalid, but we continue without user
        }
    }
    next();
};
