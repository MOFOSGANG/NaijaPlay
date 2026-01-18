import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/client/client.js';
import { createClient } from 'redis';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { setupGameEngine } from './sockets/gameEngine';
import { setupMatchmaking } from './sockets/matchmaking';
import { translateToPidgin } from './services/aiService';

import { validateEnv } from './utils/envValidator';

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
const redisClient = createClient({ url: process.env.REDIS_URL });

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
setupGameEngine(io);
setupMatchmaking(io);

io.on('connection', (socket) => {
    console.log("New player don enter street! 🏃 ID:", socket.id);

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

app.use('/api/auth', authRoutes);
app.use('/api/auth', recoveryRoutes); // Register recovery under auth namespace
app.use('/api/market', marketRoutes);
app.use('/api/villages', villageRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: "Steady vibing! 🇳🇬", time: new Date() });
});

// POST /api/auth/register
// GET /api/user/profile
// POST /api/market/buy (Atomic transaction)

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await redisClient.connect().catch(() => {
            console.warn("⚠️ Redis no dey! Falling back to DB only. No wahala.");
        });

        const listen = (port: number | string) => {
            server.listen(port)
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
                    console.log(`Compound dey live for port: ${server.address() && typeof server.address() !== 'string' ? (server.address() as any).port : port}`);
                    console.log(`========================================`);
                });
        };

        listen(PORT);
    } catch (error) {
        console.error("Omo, something burst for server start:", error);
    }
};

startServer();

export { prisma, redisClient, io };
