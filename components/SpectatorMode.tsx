import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, MessageCircle, X, Users, Clock, Send, ArrowLeft } from 'lucide-react';
import { useMultiplayerStore } from '../multiplayerStore';

interface SpectatorModeProps {
    roomId: string;
    onLeave: () => void;
}

interface SpectatorMessage {
    id: string;
    username: string;
    text: string;
    timestamp: Date;
}

const SpectatorMode = ({ roomId, onLeave }: SpectatorModeProps) => {
    const { currentRoom } = useMultiplayerStore();
    const [messages, setMessages] = useState<SpectatorMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 20) + 5);

    // Mock game state for demonstration
    const [gameState, setGameState] = useState({
        letter: 'M',
        timeLeft: 45,
        players: [
            { id: '1', name: 'BigBoy_Lagos', avatar: '👦', answers: { name: 'Michael', place: 'M...', animal: '', thing: '' } },
            { id: '2', name: 'AbujaBaller', avatar: '👨', answers: { name: 'Mary', place: 'Miami', animal: 'Mo...', thing: '' } },
        ]
    });

    useEffect(() => {
        // Mock timer countdown
        const interval = setInterval(() => {
            setGameState(prev => ({
                ...prev,
                timeLeft: Math.max(0, prev.timeLeft - 1)
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            username: 'You',
            text: newMessage,
            timestamp: new Date()
        }]);
        setNewMessage('');
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0f]">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <button onClick={onLeave} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center">
                    <p className="font-black text-sm">{currentRoom?.name || 'Game Room'}</p>
                    <p className="text-[10px] text-white/40">NPAT • Round in Progress</p>
                </div>

                <div className="flex items-center gap-2 text-[#FFA500]">
                    <Eye size={14} />
                    <span className="text-sm font-black">{viewerCount}</span>
                </div>
            </div>

            <div className="flex h-[calc(100vh-64px)]">
                {/* Main Game View */}
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    {/* Letter Display */}
                    <div className="text-center">
                        <div className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Current Letter</div>
                        <div className="text-8xl font-black text-[#00ff88] font-accent drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
                            {gameState.letter}
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex justify-center">
                        <div className={`px-6 py-3 glass rounded-2xl border flex items-center gap-3 ${gameState.timeLeft <= 10 ? 'border-red-500 text-red-500' : 'border-white/10'}`}>
                            <Clock size={18} />
                            <span className="text-2xl font-black">{gameState.timeLeft}s</span>
                        </div>
                    </div>

                    {/* Player Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gameState.players.map((player, index) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass p-6 rounded-[30px] border border-white/10"
                            >
                                {/* Player Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                                        {player.avatar}
                                    </div>
                                    <div>
                                        <p className="font-black">{player.name}</p>
                                        <p className="text-[10px] text-white/40">Playing...</p>
                                    </div>
                                </div>

                                {/* Answers Grid (Blurred for spectator) */}
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(player.answers).map(([category, answer]) => (
                                        <div key={category} className="p-3 bg-white/5 rounded-xl">
                                            <p className="text-[8px] font-black uppercase text-white/30 mb-1">{category}</p>
                                            <p className="text-sm font-bold text-white/60 blur-[2px]">
                                                {answer || '...'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Spectator Chat */}
                <div className="w-80 glass border-l border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                        <MessageCircle size={16} className="text-[#00ff88]" />
                        <span className="font-black text-sm">Spectator Chat</span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-white/20 text-xs text-center py-8">No messages yet. Say something!</p>
                        ) : (
                            messages.map(msg => (
                                <div key={msg.id} className="text-xs">
                                    <span className="font-black text-[#00ff88]">{msg.username}: </span>
                                    <span className="text-white/70">{msg.text}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-white/10 flex gap-2">
                        <input
                            type="text"
                            placeholder="Chat..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88]"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-2 bg-[#008751] rounded-xl hover:scale-105 transition-all"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpectatorMode;
