import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

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
                email: email.toLowerCase(),
                password: hashedPassword,
                title: "Street Pikin"
            },
            include: { inventory: true }
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');
        const { password: _, ...userData } = user;

        res.json({ message: "Welcome to the Street! 🏃", token, user: userData });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const target = error.meta?.target || [];
            if (target.includes('username')) {
                return res.status(400).json({ error: "Username don take by another person! 😩" });
            }
            if (target.includes('email')) {
                return res.status(400).json({ error: "Email don register already! 📧" });
            }
        }
        console.error("REGISTER ERROR:", error);
        res.status(400).json({ error: "Something burst for our end! Try again. 🏾" });
    }
});

router.post('/login', async (req, res) => {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: "Oga, something wrong with your details!" });
    }
    const { username, password } = parse.data;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: { inventory: true } // Include some basics
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Oga, your details no match!" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');

        // Return full user (minus password)
        const { password: _, ...userData } = user;
        res.json({ token, user: userData });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ error: "Login don hang!" });
    }
});

// Token verification / Current user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: { inventory: true }
        });
        if (!user) return res.status(404).json({ error: "User no exist!" });
        const { password: _, ...userData } = user;
        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
