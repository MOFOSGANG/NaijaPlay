import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Unlock, Users, Gamepad2, Copy, Check } from 'lucide-react';
import { useMultiplayerStore } from '../multiplayerStore';

interface CreateRoomModalProps {
    onClose: () => void;
    defaultGameType?: string;
}

const CreateRoomModal = ({ onClose, defaultGameType = 'NPAT' }: CreateRoomModalProps) => {
    const { createRoom, isConnected } = useMultiplayerStore();
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const generateInviteCode = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        setInviteCode(code);
        return code;
    };

    const handleCreate = () => {
        if (!roomName.trim()) return;

        setIsCreating(true);
        const code = isPrivate ? generateInviteCode() : '';
        createRoom(roomName.trim(), defaultGameType, isPrivate);

        // In real implementation, wait for server confirmation
        setTimeout(() => {
            if (!isPrivate) {
                onClose();
            }
            setIsCreating(false);
        }, 1000);
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass p-8 rounded-[40px] max-w-md w-full border border-white/10 space-y-6"
            >
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black font-accent">Create Room</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Room Name Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-2">Room Name</label>
                    <input
                        type="text"
                        placeholder="Enter a cool room name..."
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        maxLength={30}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#00ff88] transition-all font-bold"
                    />
                </div>

                {/* Game Type (Locked to NPAT for now) */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-2">Game</label>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">📝</div>
                        <div>
                            <p className="font-black">NPAT</p>
                            <p className="text-[10px] text-white/40">Name, Place, Animal, Thing</p>
                        </div>
                    </div>
                </div>

                {/* Max Players */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-2">Max Players</label>
                    <div className="flex gap-2">
                        {[2, 4, 6, 8].map(num => (
                            <button
                                key={num}
                                onClick={() => setMaxPlayers(num)}
                                className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${maxPlayers === num
                                        ? 'bg-[#008751] text-white'
                                        : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Private Toggle */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        {isPrivate ? <Lock size={18} className="text-[#FFA500]" /> : <Unlock size={18} className="text-white/40" />}
                        <div>
                            <p className="font-black text-sm">{isPrivate ? 'Private Room' : 'Public Room'}</p>
                            <p className="text-[10px] text-white/40">{isPrivate ? 'Invite only' : 'Anyone can join'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`w-14 h-8 rounded-full relative transition-all ${isPrivate ? 'bg-[#008751]' : 'bg-white/10'}`}
                    >
                        <motion.div
                            animate={{ x: isPrivate ? 24 : 2 }}
                            className="w-6 h-6 bg-white rounded-full absolute top-1"
                        />
                    </button>
                </div>

                {/* Invite Code (shown after creating private room) */}
                {inviteCode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-2xl"
                    >
                        <p className="text-[10px] text-[#00ff88] font-black uppercase mb-2">Invite Code</p>
                        <div className="flex items-center gap-3">
                            <code className="flex-grow text-2xl font-black tracking-[0.3em]">{inviteCode}</code>
                            <button
                                onClick={handleCopyCode}
                                className="p-3 bg-[#00ff88]/20 rounded-xl hover:bg-[#00ff88]/30 transition-all"
                            >
                                {copied ? <Check size={18} className="text-[#00ff88]" /> : <Copy size={18} className="text-[#00ff88]" />}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    disabled={!roomName.trim() || !isConnected || isCreating}
                    className="w-full py-5 bg-[#008751] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                >
                    {isCreating ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Gamepad2 size={20} />
                            Create & Start
                        </>
                    )}
                </button>
            </motion.div>
        </motion.div>
    );
};

export default CreateRoomModal;
