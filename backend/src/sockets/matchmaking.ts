import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface QueuePlayer {
    socketId: string;
    gameType: string;
    joinedAt: number;
}

const queues: Record<string, QueuePlayer[]> = {
    'NPAT': [],
    'AFTER': [],
    'TINKO': [],
    'CATCHER': [],
    'GARDEN': [],
    'SUWE': []
};

export const setupMatchmaking = (io: Server) => {
    io.on('connection', (socket: Socket) => {

        socket.on('join_queue', (data: { gameType: string }) => {
            const { gameType } = data;
            if (!queues[gameType]) return;

            // Prevent double queuing
            if (queues[gameType].find(p => p.socketId === socket.id)) return;

            console.log(`Player ${socket.id} joined ${gameType} queue. 🏃`);

            queues[gameType].push({
                socketId: socket.id,
                gameType,
                joinedAt: Date.now()
            });

            // Trigger match check
            checkMatches(io, gameType);
        });

        socket.on('leave_queue', () => {
            removePlayerFromAllQueues(socket.id);
            console.log(`Player ${socket.id} left all queues. 👋`);
        });

        socket.on('disconnect', () => {
            removePlayerFromAllQueues(socket.id);
        });
    });
};

const checkMatches = (io: Server, gameType: string) => {
    const queue = queues[gameType];

    // Simple 1v1 match for now (can be expanded to 4 players)
    while (queue.length >= 2) {
        const player1 = queue.shift()!;
        const player2 = queue.shift()!;

        const roomId = `room_${uuidv4().substring(0, 8)}`;

        console.log(`Match found for ${gameType}! Creating room ${roomId} for ${player1.socketId} and ${player2.socketId} 🎮`);

        const roomData = {
            id: roomId,
            name: `${gameType} Battle`,
            gameType,
            status: 'WAITING',
            playerCount: 2,
            maxPlayers: 4
        };

        io.to(player1.socketId).emit('match_found', { roomId, room: roomData });
        io.to(player2.socketId).emit('match_found', { roomId, room: roomData });
    }
};

const removePlayerFromAllQueues = (socketId: string) => {
    Object.keys(queues).forEach(gameType => {
        queues[gameType] = queues[gameType].filter(p => p.socketId !== socketId);
    });
};
