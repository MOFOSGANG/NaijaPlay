import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from '../services/roomManager.js';

interface QueuePlayer {
    socketId: string;
    userId?: string;
    gameType: string;
    stake: number;
    joinedAt: number;
    level?: number; // For skill-based matching in future
}

// Queues grouped by gameType and then by stake
// queues[gameType][stake] = QueuePlayer[]
const queues: Record<string, Record<number, QueuePlayer[]>> = {};

const GAME_TYPES = ['NPAT', 'AFTER', 'TINKO', 'CATCHER', 'GARDEN', 'SUWE'];

// Initialize queues
GAME_TYPES.forEach(gt => {
    queues[gt] = {};
});

// Room Manager (initialized with Redis client in setupMatchmaking)
let roomManager: RoomManager;
const socketToRoom: Map<string, string> = new Map();

export const setupMatchmaking = (io: Server, redisClient: any = null) => {
    // Initialize Room Manager with Redis if available
    roomManager = new RoomManager(redisClient);

    io.on('connection', (socket: Socket) => {
        // userId from auth middleware (to be implemented)
        const userId = socket.handshake.auth?.userId;

        socket.on('join_queue', (data: { gameType: string; stake: number; level?: number }) => {
            const { gameType, stake = 0, level } = data;

            if (!queues[gameType]) {
                queues[gameType] = {};
            }
            if (!queues[gameType][stake]) {
                queues[gameType][stake] = [];
            }

            // Prevent double queuing
            if (isPlayerInAnyQueue(socket.id)) {
                return socket.emit('queue_error', { message: 'You dey queue already!' });
            }

            console.log(`Player ${socket.id} (User: ${userId}) joined ${gameType} queue with ${stake} stake. 💰`);

            const player: QueuePlayer = {
                socketId: socket.id,
                userId,
                gameType,
                stake,
                joinedAt: Date.now(),
                ...(level !== undefined && { level })
            };

            queues[gameType][stake].push(player);

            // Send queue confirmation with estimated wait
            const queueSize = queues[gameType][stake].length;
            socket.emit('queue_joined', {
                gameType,
                stake,
                position: queueSize,
                estimatedWait: queueSize > 1 ? '< 1 min' : 'Searching...'
            });

            // Trigger match check
            checkMatches(io, gameType, stake);

            // Set timeout for long waits (2 minutes)
            setTimeout(() => {
                if (isPlayerInQueue(socket.id, gameType, stake)) {
                    socket.emit('queue_timeout', {
                        message: 'No match found. Try again or lower stake!',
                        gameType,
                        stake
                    });
                    removePlayerFromAllQueues(socket.id);
                }
            }, 120000); // 2 minutes
        });

        socket.on('leave_queue', () => {
            removePlayerFromAllQueues(socket.id);
            console.log(`Player ${socket.id} left all queues. 👋`);
        });

        socket.on('disconnect', () => {
            removePlayerFromAllQueues(socket.id);
            handleLeaveRoom(io, socket);
        });

        // Periodic stats update
        const statsInterval = setInterval(async () => {
            const onlineCount = io.engine.clientsCount;
            const rooms = await roomManager.getAllRooms();
            const gamesCount = rooms.length;
            socket.emit('online_stats', { players: onlineCount, games: gamesCount });
        }, 5000);

        socket.on('disconnect', () => clearInterval(statsInterval));

        // --- Room Management ---

        socket.on('get_rooms', async () => {
            const rooms = await roomManager.getAllRooms();
            socket.emit('rooms_list', rooms);
        });

        socket.on('create_room', async (data: { name: string; gameType: string; isPrivate: boolean; stake?: number }) => {
            const roomId = `room_${uuidv4().substring(0, 8)}`;
            const room = {
                id: roomId,
                name: data.name || "Street Battle",
                gameType: data.gameType || "NPAT",
                status: 'WAITING' as const,
                playerCount: 1,
                maxPlayers: 4,
                isPrivate: !!data.isPrivate,
                stake: data.stake || 0,
                hostName: (socket as any).username || "Street King",
                hostAvatar: "👤",
                createdAt: new Date().toISOString(),
                players: [socket.id]
            };

            await roomManager.createRoom(room);
            socket.join(roomId);
            socketToRoom.set(socket.id, roomId);

            socket.emit('room_created', room);
            const allRooms = await roomManager.getAllRooms();
            io.emit('rooms_list', allRooms);

            console.log(`Room created: ${roomId} by ${socket.id}`);
        });

        socket.on('join_room', async (roomId: string) => {
            const room = await roomManager.getRoom(roomId);
            if (!room) return socket.emit('error', { message: "Room no dey!" });
            if (room.playerCount >= room.maxPlayers) return socket.emit('error', { message: "Room full!" });

            socket.join(roomId);
            socketToRoom.set(socket.id, roomId);
            await roomManager.addPlayer(roomId, socket.id);

            const updatedRoom = await roomManager.getRoom(roomId);
            socket.emit('join_success', updatedRoom); // Explicit success for joining player
            io.to(roomId).emit('room_updated', updatedRoom);

            const allRooms = await roomManager.getAllRooms();
            io.emit('rooms_list', allRooms);

            console.log(`Player ${socket.id} joined room ${roomId}`);
        });

        socket.on('leave_room', () => {
            handleLeaveRoom(io, socket);
        });
    });
};

const checkMatches = (io: Server, gameType: string, stake: number) => {
    const queue = queues[gameType]?.[stake];
    if (!queue) return;

    // Simple 1v1 match for now
    while (queue.length >= 2) {
        const player1 = queue.shift();
        const player2 = queue.shift();
        if (!player1 || !player2) break;

        const roomId = `room_${uuidv4().substring(0, 8)}`;

        console.log(`Match found for ${gameType} (${stake}C)! Creating room ${roomId} 🎮`);

        const roomData = {
            id: roomId,
            name: `${gameType} Battle`,
            gameType,
            status: 'WAITING',
            playerCount: 2,
            maxPlayers: 2, // Changed to 2 for 1v1
            stake
        };

        io.to(player1.socketId).emit('match_found', { roomId, room: roomData });
        io.to(player2.socketId).emit('match_found', { roomId, room: roomData });
    }
};

const isPlayerInAnyQueue = (socketId: string) => {
    for (const gt in queues) {
        const subQueues = queues[gt];
        for (const stake in subQueues) {
            const q = subQueues[stake as any];
            if (q && q.find((p: QueuePlayer) => p.socketId === socketId)) return true;
        }
    }
    return false;
};

const isPlayerInQueue = (socketId: string, gameType: string, stake: number) => {
    const q = queues[gameType]?.[stake];
    return q ? q.some((p: QueuePlayer) => p.socketId === socketId) : false;
};

const removePlayerFromAllQueues = (socketId: string) => {
    for (const gt in queues) {
        const subQueues = queues[gt];
        for (const stake in subQueues) {
            const q = subQueues[stake as any];
            if (q) {
                subQueues[stake as any] = q.filter((p: QueuePlayer) => p.socketId !== socketId);
            }
        }
    }
};

const handleLeaveRoom = async (io: Server, socket: Socket) => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const room = await roomManager.getRoom(roomId);
    if (room) {
        socket.leave(roomId);
        socketToRoom.delete(socket.id);

        await roomManager.removePlayer(roomId, socket.id);

        const updatedRoom = await roomManager.getRoom(roomId);
        if (!updatedRoom) {
            console.log(`Room ${roomId} deleted (empty)`);
        } else {
            io.to(roomId).emit('room_updated', updatedRoom);
        }

        const allRooms = await roomManager.getAllRooms();
        io.emit('rooms_list', allRooms);
    }
};
