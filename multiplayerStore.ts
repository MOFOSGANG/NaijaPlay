import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from './socketService';
import { GameType } from './types';

export interface GameRoom {
    id: string;
    name: string;
    hostName: string;
    hostAvatar: string;
    gameType: string;
    playerCount: number;
    maxPlayers: number;
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
    isPrivate: boolean;
    createdAt: Date;
}

export interface OnlinePlayer {
    id: string;
    username: string;
    avatar: string;
    status: 'ONLINE' | 'IN_GAME' | 'IN_QUEUE';
    currentGame?: string;
}

export interface QueueState {
    isInQueue: boolean;
    position: number;
    estimatedWait: number; // seconds
    gameType: string;
    startedAt: Date | null;
}

interface MultiplayerState {
    // Connection
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;
    reconnectAttempts: number;

    // Online Stats
    onlinePlayerCount: number;
    activeGamesCount: number;

    // Matchmaking
    queue: QueueState;

    // Lobbies
    availableRooms: GameRoom[];
    currentRoom: GameRoom | null;

    // Actions
    connect: () => void;
    disconnect: () => void;

    // Matchmaking Actions
    joinQueue: (gameType: GameType) => void;
    leaveQueue: () => void;

    // Lobby Actions
    fetchRooms: () => void;
    createRoom: (name: string, gameType: GameType, isPrivate: boolean) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;

    // Internal Setters
    setConnectionStatus: (connected: boolean, error?: string) => void;
    setOnlineStats: (players: number, games: number) => void;
    setQueuePosition: (position: number, estimatedWait: number) => void;
    setRooms: (rooms: GameRoom[]) => void;
    setCurrentRoom: (room: GameRoom | null) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
    // Initial State
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    reconnectAttempts: 0,

    onlinePlayerCount: 0,
    activeGamesCount: 0,

    queue: {
        isInQueue: false,
        position: 0,
        estimatedWait: 0,
        gameType: '',
        startedAt: null,
    },

    availableRooms: [],
    currentRoom: null,

    // Connection Actions
    connect: () => {
        set({ isConnecting: true, connectionError: null });

        try {
            const socket = connectSocket();

            socket.on('connect', () => {
                set({ isConnected: true, isConnecting: false, reconnectAttempts: 0 });
                console.log('🟢 Connected to Naija Play servers!');
            });

            socket.on('disconnect', () => {
                set({ isConnected: false });
                console.log('🔴 Disconnected from servers');
            });

            socket.on('connect_error', (error) => {
                const attempts = get().reconnectAttempts + 1;
                set({
                    isConnecting: false,
                    connectionError: error.message,
                    reconnectAttempts: attempts
                });
            });

            // Listen for online stats updates
            socket.on('online_stats', (data: { players: number; games: number }) => {
                set({ onlinePlayerCount: data.players, activeGamesCount: data.games });
            });

            // Listen for queue updates
            socket.on('queue_update', (data: { position: number; estimatedWait: number }) => {
                set((state) => ({
                    queue: { ...state.queue, position: data.position, estimatedWait: data.estimatedWait }
                }));
            });

            socket.on('match_found', (data: { roomId: string; room: GameRoom }) => {
                set((state) => ({
                    queue: { ...state.queue, isInQueue: false },
                    currentRoom: data.room
                }));
            });

            // Listen for room updates
            socket.on('rooms_list', (rooms: GameRoom[]) => {
                set({ availableRooms: rooms });
            });

            socket.on('room_updated', (room: GameRoom) => {
                set((state) => ({
                    availableRooms: state.availableRooms.map(r => r.id === room.id ? room : r),
                    currentRoom: state.currentRoom?.id === room.id ? room : state.currentRoom
                }));
            });

        } catch (error: any) {
            set({ isConnecting: false, connectionError: error.message });
        }
    },

    disconnect: () => {
        disconnectSocket();
        set({ isConnected: false, isConnecting: false });
    },

    // Matchmaking Actions
    joinQueue: (gameType: string) => {
        const socket = getSocket();
        if (!socket) return;

        socket.emit('join_queue', { gameType });
        set({
            queue: {
                isInQueue: true,
                position: 0,
                estimatedWait: 30,
                gameType,
                startedAt: new Date(),
            }
        });
    },

    leaveQueue: () => {
        const socket = getSocket();
        if (socket) {
            socket.emit('leave_queue');
        }
        set({
            queue: {
                isInQueue: false,
                position: 0,
                estimatedWait: 0,
                gameType: '',
                startedAt: null,
            }
        });
    },

    // Lobby Actions
    fetchRooms: () => {
        const socket = getSocket();
        if (socket) {
            socket.emit('get_rooms');
        }
    },

    createRoom: (name: string, gameType: string, isPrivate: boolean) => {
        const socket = getSocket();
        if (socket) {
            socket.emit('create_room', { name, gameType, isPrivate });
        }
    },

    joinRoom: (roomId: string) => {
        const socket = getSocket();
        if (socket) {
            socket.emit('join_room', roomId);
        }
    },

    leaveRoom: () => {
        const socket = getSocket();
        const currentRoom = get().currentRoom;
        if (socket && currentRoom) {
            socket.emit('leave_room', currentRoom.id);
        }
        set({ currentRoom: null });
    },

    // Internal Setters
    setConnectionStatus: (connected, error) => set({ isConnected: connected, connectionError: error || null }),
    setOnlineStats: (players, games) => set({ onlinePlayerCount: players, activeGamesCount: games }),
    setQueuePosition: (position, estimatedWait) => set((state) => ({
        queue: { ...state.queue, position, estimatedWait }
    })),
    setRooms: (rooms) => set({ availableRooms: rooms }),
    setCurrentRoom: (room) => set({ currentRoom: room }),
}));
