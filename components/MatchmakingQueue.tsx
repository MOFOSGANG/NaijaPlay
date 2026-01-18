import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, X, Loader2, Sparkles, Gamepad2, Zap } from 'lucide-react';
import { useMultiplayerStore } from '../multiplayerStore';

interface MatchmakingQueueProps {
    gameType: string;
    gameName: string;
    gameIcon: string;
    onClose: () => void;
}

const MatchmakingQueue = ({ gameType, gameName, gameIcon, onClose }: MatchmakingQueueProps) => {
    const { queue, joinQueue, leaveQueue, onlinePlayerCount } = useMultiplayerStore();
    const [elapsedTime, setElapsedTime] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Auto-join queue when component mounts
        if (!queue.isInQueue) {
            joinQueue(gameType);
        }
    }, []);

    useEffect(() => {
        // Update elapsed time every second
        const interval = setInterval(() => {
            if (queue.startedAt) {
                setElapsedTime(Math.floor((Date.now() - queue.startedAt.getTime()) / 1000));
            }
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 1000);
        return () => clearInterval(interval);
    }, [queue.startedAt]);

    const handleCancel = () => {
        leaveQueue();
        onClose();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass p-10 rounded-[50px] max-w-md w-full text-center space-y-8 border border-white/10 relative overflow-hidden"
            >
                {/* Background animation */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic from-[#008751]/10 via-transparent to-[#00ff88]/10"
                    />
                </div>

                {/* Game Icon */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-gradient-to-br from-[#008751] to-[#00ff88] rounded-[35px] mx-auto flex items-center justify-center text-5xl shadow-2xl relative z-10"
                >
                    {gameIcon}
                </motion.div>

                {/* Status Text */}
                <div className="relative z-10">
                    <h2 className="text-3xl font-black font-accent mb-2">Finding Match{dots}</h2>
                    <p className="text-white/50 text-sm">{gameName}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 relative z-10">
                    <div className="glass p-4 rounded-2xl border border-white/5">
                        <Clock size={18} className="text-[#00ff88] mx-auto mb-2" />
                        <p className="text-xl font-black">{formatTime(elapsedTime)}</p>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Searching</p>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5">
                        <Users size={18} className="text-[#FFA500] mx-auto mb-2" />
                        <p className="text-xl font-black">{queue.position || '...'}</p>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest">In Queue</p>
                    </div>
                    <div className="glass p-4 rounded-2xl border border-white/5">
                        <Zap size={18} className="text-yellow-400 mx-auto mb-2" />
                        <p className="text-xl font-black">{onlinePlayerCount}</p>
                        <p className="text-[8px] text-white/40 uppercase tracking-widest">Online</p>
                    </div>
                </div>

                {/* Estimated Wait */}
                <div className="glass p-4 rounded-2xl border border-[#00ff88]/20 bg-[#00ff88]/5 relative z-10">
                    <div className="flex items-center justify-center gap-3">
                        <Loader2 size={16} className="text-[#00ff88] animate-spin" />
                        <span className="text-sm">
                            Estimated wait: <span className="font-black text-[#00ff88]">~{queue.estimatedWait}s</span>
                        </span>
                    </div>
                </div>

                {/* Fun Messages */}
                <motion.p
                    key={elapsedTime % 10}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-white/30 italic relative z-10"
                >
                    {elapsedTime < 10 && "Looking for worthy opponents..."}
                    {elapsedTime >= 10 && elapsedTime < 30 && "Checking the compounds..."}
                    {elapsedTime >= 30 && elapsedTime < 60 && "Sharpening the competition..."}
                    {elapsedTime >= 60 && "The best things take time! 🔥"}
                </motion.p>

                {/* Cancel Button */}
                <button
                    onClick={handleCancel}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 relative z-10"
                >
                    <X size={16} />
                    Cancel Search
                </button>
            </motion.div>
        </motion.div>
    );
};

export default MatchmakingQueue;
