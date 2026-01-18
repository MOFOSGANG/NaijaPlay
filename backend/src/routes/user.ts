import { Router } from 'express';
import type { Response } from 'express';
import { prisma } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as rewardService from '../services/rewardService.js';

const router = Router();

router.post('/daily-reward', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const result = await rewardService.checkDailyReward(req.userId!);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: "Invalid User ID" });

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                inventory: { include: { item: true } },
                village: true,
                _count: { select: { matchHistory: true } }
            }
        });

        if (!user) return res.status(404).json({ error: "User no dey found." });

        // XP Calculation Logic (Example)
        const nextLevelXP = 1000 * user.level;
        const progress = (user.xp / nextLevelXP) * 100;

        res.json({ ...user, progress, nextLevelXP });
    } catch (error) {
        res.status(500).json({ error: "No fit load profile." });
    }
});

export default router;
