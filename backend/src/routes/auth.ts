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
            const target = error.meta?.target;
            // Handle both array and string formats of target
            const isUsername = Array.isArray(target) ? target.includes('username') : target === 'username';
            const isEmail = Array.isArray(target) ? target.includes('email') : target === 'email';

            if (isUsername) {
                return res.status(400).json({ error: "Username don take by another person! 😩" });
            }
            if (isEmail) {
                return res.status(400).json({ error: "Email don register already! 📧" });
            }

            // Fallback for P2002 if target is unclear
            return res.status(400).json({ error: "Username or Email already dey in the street! 🏾" });
        }
        console.error("===== REGISTER ERROR =====");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error("==========================");

        // Return more detail in non-production for debugging
        const errorDetail = process.env.NODE_ENV !== 'production'
            ? ` (${error.code || error.name}: ${error.message})`
            : '';
        res.status(500).json({ error: `Something burst for our end! Try again later. 🏾${errorDetail}` });
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
    } catch (error: any) {
        console.error("===== LOGIN ERROR =====");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Full Error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error("=======================");

        const errorDetail = process.env.NODE_ENV !== 'production'
            ? ` (${error.code || error.name}: ${error.message})`
            : '';
        res.status(500).json({ error: `Login don hang!${errorDetail}` });
    }
});

// Token verification / Current user
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized access! 🚫" });
        }
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
