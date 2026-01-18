import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
    if (!socket) {
        socket = io(BACKEND_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('🔥 Connected to Compound! Socket ID:', socket?.id);
        });

        socket.on('disconnect', () => {
            console.log('👋 Disconnected from Compound');
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
        });
    }
    return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Game-specific socket events
export const joinGameRoom = (roomId: string) => {
    socket?.emit('join_room', roomId);
};

export const startGame = (roomId: string) => {
    socket?.emit('start_game', roomId);
};

export const submitAnswers = (roomId: string, answers: Record<string, string>) => {
    socket?.emit('submit_answers', { roomId, answers });
};

export const sendChatMessage = (message: { id: string; text: string; senderId: string; senderName: string; senderTitle: string }) => {
    socket?.emit('send_message', message);
};

export const requestTranslation = (msgId: string, text: string) => {
    socket?.emit('translate_message', { id: msgId, text });
};

// Listen for events
export const onGameStarted = (callback: (data: { letter: string; timer: number }) => void) => {
    socket?.on('game_started', callback);
};

export const onTimerUpdate = (callback: (timer: number) => void) => {
    socket?.on('timer_update', callback);
};

export const onGameOver = (callback: (data: { message: string }) => void) => {
    socket?.on('game_over', callback);
};

export const onNewMessage = (callback: (message: any) => void) => {
    socket?.on('new_message', callback);
};

export const onMessageTranslated = (callback: (data: { msgId: string; translatedText: string }) => void) => {
    socket?.on('message_translated', callback);
};
