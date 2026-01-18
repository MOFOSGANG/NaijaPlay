import { Router } from 'express';
import { prisma, redisClient } from '../server';

const router = Router();

// List all villages
router.get('/', async (req, res) => {
    try {
        const villages = await prisma.village.findMany({
            include: {
                _count: { select: { members: true } }
            }
        });
        res.json(villages);
    } catch (error) {
        res.status(500).json({ error: "No fit fetch villages now." });
    }
});

// Get leaderboard (from Redis for speed)
router.get('/leaderboard', async (req, res) => {
    try {
        // Basic implementation: fetch from DB and cache in Redis
        if (redisClient.isOpen) {
            const cached = await redisClient.get('village_leaderboard');
            if (cached) return res.json(JSON.parse(cached));
        }

        const board = await prisma.village.findMany({
            orderBy: { totalXP: 'desc' },
            take: 10
        });

        if (redisClient.isOpen) {
            await redisClient.setEx('village_leaderboard', 3600, JSON.stringify(board));
        }
        res.json(board);
    } catch (error) {
        res.status(500).json({ error: "Leaderboard don hang!" });
    }
});

export default router;
