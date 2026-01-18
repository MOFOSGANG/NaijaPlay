import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';
import { z } from 'zod';

const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    username: z.string(),
    password: z.string()
});

const router = Router();

router.post('/register', async (req, res) => {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: "Invalid data. Username must be 3-20 chars, password min 6." });
    }
    const { username, email, password } = parse.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                title: "Street Pikin"
            }
        });

        res.json({ message: "Welcome to the Street! 🏃", userId: user.id });
    } catch (error) {
        res.status(400).json({ error: "Username don take or something burst!" });
    }
});

router.post('/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: "Oga, something wrong with your details!" });
    }
    const { username, password } = parse.data;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Oga, your details no match!" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
        res.json({ token, user: { id: user.id, username: user.username, level: user.level } });
    } catch (error) {
        res.status(500).json({ error: "Login don hang!" });
    }
});

// Basic recovery placeholder
router.post('/recover', async (req, res) => {
    const { email } = req.body;
    // TODO: Send recovery link via email service
    res.json({ message: "Check your email for recovery instructions! (Feature coming soon)" });
});

export default router;
