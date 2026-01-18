import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { setupGameEngine } from './sockets/gameEngine.js';
import { setupMatchmaking } from './sockets/matchmaking.js';
import { translateToPidgin } from './services/aiService.js';
import bcrypt from 'bcryptjs';

import { validateEnv } from './utils/envValidator.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
validateEnv();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) console.warn("⚠️ REDIS_URL no dey! Real-time features fit burst.");
const redisClient = createClient({
    url: redisUrl || 'redis://localhost:6379'
});

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Omo, you dey press too much! Chill small. ✋"
});

app.use('/api/', limiter);
app.use(express.json());

// --- NIGERIAN LOGS ---
console.log("Setting up the Compound... 🏗️");

// --- MIDDLEWARE ---
// TODO: JWT Auth Middleware

// --- SOCKET LOGIC ---
io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) {
        (socket as any).userId = userId;
    }
    next();
});

setupGameEngine(io);
setupMatchmaking(io);

io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    console.log(`New player don enter street! 🏃 ID: ${socket.id}, User: ${userId || 'Guest'}`);

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Player join ${roomId}. Oya!`);
    });

    socket.on('send_message', (data) => {
        io.emit('new_message', data);
    });

    socket.on('translate_message', async (data) => {
        console.log("AI translation requested for:", data.text);
        const pidgin = await translateToPidgin(data.text);
        socket.emit('message_translated', { msgId: data.id, translatedText: pidgin });
    });

    socket.on('game_action', (data) => {
        // Sync status across room
        io.to(data.roomId).emit('game_update', data);
    });

    socket.on('disconnect', () => {
        console.log("Player don go house. 👋");
    });
});

// --- ROUTES ---
import authRoutes from './routes/auth.js';
import marketRoutes from './routes/market.js';
import villageRoutes from './routes/villages.js';
import userRoutes from './routes/user.js';
import recoveryRoutes from './routes/recovery.js';
import questRoutes from './routes/quests.js';
import socialRoutes from './routes/social.js';
import leaderboardRoutes from './routes/leaderboard.js';

app.use('/api/auth', authRoutes);
app.use('/api/auth', recoveryRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/leaderboards', leaderboardRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: "Steady vibing! 🇳🇬", time: new Date() });
});

// Serve Static Files in Production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.resolve(__dirname, '../../dist');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(frontendPath, 'index.html'));
        }
    });
}

// POST /api/auth/register
// GET /api/user/profile
// POST /api/market/buy (Atomic transaction)

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        const listen = (port: number | string) => {
            const s = server.listen(port)
                .on('error', (err: any) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`⚠️ Port ${port} occupied. Trying ${Number(port) + 1}...`);
                        listen(Number(port) + 1);
                    } else {
                        console.error("Server error:", err);
                    }
                })
                .on('listening', () => {
                    console.log(`========================================`);
                    console.log(`🔥 NAIJA PLAY SERVER READY!`);
                    console.log(`Compound dey live for port: ${port}`);
                    console.log(`========================================`);
                });
        };

        // --- 1. Bind Port Immediately (Crucial for Render Health Check) ---
        listen(PORT);

        // --- 2. Background Connections (Non-blocking) ---
        redisClient.connect()
            .then(() => console.log("✅ Redis connected - Real-time features ready."))
            .catch(() => console.warn("⚠️ Redis connection failed. Real-time features fit burst."));

        const initAdmin = async () => {
            const adminEmail = 'Mofosgang123@gmail.com';
            const p = prisma as any;
            const existingAdmin = await p.user.findUnique({ where: { email: adminEmail } });
            if (!existingAdmin) {
                console.log("Setting up the Street Boss... 🕴️");
                const hashedPassword = await bcrypt.hash('MOFOSGNG12$', 10);
                await p.user.create({
                    data: {
                        username: 'MOFOSGANG',
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'ADMIN',
                        title: 'Compound Chief',
                        coins: 10000,
                        level: 10
                    }
                });
                console.log("Admin account MOFOSGANG don ready! ✅");
            }
        };

        await initAdmin();
    } catch (error) {
        console.error("Omo, something burst for server start:", error);
    }
};

startServer();

// --- GRACEFUL SHUTDOWN ---
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export { prisma, redisClient, io };
