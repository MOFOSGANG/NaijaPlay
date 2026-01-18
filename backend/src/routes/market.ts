import { Router } from 'express';
import { prisma } from '../server';

const router = Router();

router.post('/buy', async (req, res) => {
    const { userId, itemId } = req.body;

    try {
        // Start Atomic Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get user and item
            const user = await tx.user.findUnique({ where: { id: userId } });
            const item = await tx.shopItem.findUnique({ where: { id: itemId } });

            if (!user || !item) {
                throw new Error("Oga, who you be? Or which item be that?");
            }

            // 2. Check if already owned
            const owned = await tx.inventoryItem.findFirst({
                where: { userId, itemId }
            });
            if (owned) {
                throw new Error("You already get this one for your bag!");
            }

            // 3. Check credits
            if (user.coins < item.price) {
                throw new Error("Omo, your credit no reach! Go hustle some coins.");
            }

            // 4. Deduct coins and add to inventory
            await tx.user.update({
                where: { id: userId },
                data: { coins: user.coins - item.price }
            });

            await tx.inventoryItem.create({
                data: { userId, itemId }
            });

            return { success: true, balance: user.coins - item.price };
        });

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Something burst!" });
    }
});

export default router;
