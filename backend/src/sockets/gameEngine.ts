import { Server, Socket } from 'socket.io';

interface GameState {
    letter: string;
    timer: number;
    isActive: boolean;
    players: string[];
}

const gameRooms: Record<string, GameState> = {};

export const setupGameEngine = (io: Server) => {
    io.on('connection', (socket: Socket) => {

        socket.on('start_game', (roomId: string) => {
            if (!roomId) return;
            console.log(`Starting game in room: ${roomId} ... Oya! 🚀`);

            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const secretLetter = letters[Math.floor(Math.random() * letters.length)] || 'A';

            gameRooms[roomId] = {
                letter: secretLetter,
                timer: 60,
                isActive: true,
                players: []
            };

            io.to(roomId).emit('game_started', {
                letter: secretLetter,
                timer: 60
            });

            // Simple countdown
            const interval = setInterval(() => {
                if (!gameRooms[roomId]) {
                    clearInterval(interval);
                    return;
                }

                gameRooms[roomId].timer -= 1;
                io.to(roomId).emit('timer_update', gameRooms[roomId].timer);

                if (gameRooms[roomId].timer <= 0) {
                    gameRooms[roomId].isActive = false;
                    io.to(roomId).emit('game_over', { message: "Time up! Bring your papers! 📝" });
                    clearInterval(interval);
                }
            }, 1000);
        });

        socket.on('submit_answers', (data: { roomId: string; answers: any }) => {
            console.log(`Answers received from ${socket.id} for room ${data.roomId}`);
            // In a real app, you'd calculate scores here and emit results
            socket.emit('submission_received', { status: "Correct! You sharp! 🔥" });
        });

    });
};
