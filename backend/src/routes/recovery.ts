import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server.js';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// Recovery Request
router.post('/recover', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "Omo, we no sabi this email o!" });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { email },
            data: {
                recoveryToken: token,
                recoveryExpires: expires
            }
        });

        // SIMULATION: Log token to console instead of sending email
        console.log(`========================================`);
        console.log(`🔑 RECOVERY TOKEN FOR ${email}:`);
        console.log(`${token}`);
        console.log(`========================================`);

        res.json({ message: "Check your email (or server logs) for recovery instructions!" });
    } catch (error) {
        res.status(500).json({ error: "Something burst for backend!" });
    }
});

// Password Reset
const resetSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6)
});

router.post('/reset-password', async (req, res) => {
    const parse = resetSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: "Invalid data." });

    const { token, newPassword } = parse.data;

    try {
        const user = await prisma.user.findFirst({
            where: {
                recoveryToken: token,
                recoveryExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: "Token don expire or e no valid!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                recoveryToken: null,
                recoveryExpires: null
            }
        });

        res.json({ message: "Password updated! You fit login now. 🔥" });
    } catch (error) {
        res.status(500).json({ error: "Something burst during reset!" });
    }
});

export default router;
