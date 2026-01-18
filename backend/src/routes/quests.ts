import { Router } from 'express';
import { prisma } from '../server.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { refreshDailyQuests, claimQuestReward } from '../services/questService.js';

const router = Router();

// Get active quests (refreshes if needed)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

        // Ensure user has daily quests
        await refreshDailyQuests(req.userId);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const quests = await prisma.quest.findMany({
            where: {
                userId: req.userId,
                createdAt: { gte: startOfDay }
            },
            orderBy: { completed: 'asc' } // Show uncompleted first
        });

        res.json(quests);
    } catch (error) {
        console.error("Quest fetch error:", error);
        res.status(500).json({ error: "Failed to fetch quests." });
    }
});

// Claim quest reward
router.post('/:questId/claim', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.userId) return res.status(401).json({ error: "Unauthorized" });
        const { questId } = req.params;
        if (!questId || typeof questId !== 'string') throw new Error("Invalid Quest ID");

        const updatedQuest = await claimQuestReward(req.userId, questId);
        res.json({ message: "Reward claimed!", quest: updatedQuest });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Cannot claim reward." });
    }
});

export default router;
