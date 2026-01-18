import { Router } from 'express';
import { prisma } from '../server';

const router = Router();

router.get('/profile/:id', async (req, res) => {
    const { id } = req.params;

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
