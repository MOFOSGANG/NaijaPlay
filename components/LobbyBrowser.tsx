import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, RefreshCw, Lock, Unlock, Play, Eye, Filter,
    Search, X, ArrowRight, Crown, Gamepad2
} from 'lucide-react';
import { useMultiplayerStore, GameRoom } from '../multiplayerStore';

interface LobbyBrowserProps {
    onJoinRoom: (roomId: string) => void;
    onCreateRoom: () => void;
    onSpectate: (roomId: string) => void;
}

const LobbyBrowser = ({ onJoinRoom, onCreateRoom, onSpectate }: LobbyBrowserProps) => {
    const { availableRooms, fetchRooms, onlinePlayerCount, activeGamesCount, isConnected } = useMultiplayerStore();
    const [filter, setFilter] = useState<'ALL' | 'WAITING' | 'IN_PROGRESS'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchRooms();
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchRooms, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchRooms();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const filteredRooms = availableRooms
        .filter(room => filter === 'ALL' || room.status === filter)
        .filter(room =>
            searchQuery === '' ||
            room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.hostName.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const statusColors = {
        WAITING: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
        IN_PROGRESS: 'text-[#FFA500] bg-[#FFA500]/10 border-[#FFA500]/30',
        FINISHED: 'text-white/40 bg-white/5 border-white/10',
    };

    const filterButtons = [
        { id: 'ALL' as const, label: 'All Rooms' },
        { id: 'WAITING' as const, label: 'Open' },
        { id: 'IN_PROGRESS' as const, label: 'In Game' },
    ];

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[#00ff88]">
                        <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                        <span className="text-sm font-black">{onlinePlayerCount} Online</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#FFA500]">
                        <Gamepad2 size={14} />
                        <span className="text-sm font-black">{activeGamesCount} Games</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={!isConnected}
                        className="p-3 glass rounded-xl border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={onCreateRoom}
                        disabled={!isConnected}
                        className="px-6 py-3 bg-[#008751] rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <Plus size={16} />
                        Create Room
                    </button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search rooms or players..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-[#00ff88] transition-all text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id)}
                            className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === btn.id
                                    ? 'bg-[#008751] text-white'
                                    : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Room List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filteredRooms.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass p-12 rounded-[40px] text-center border border-white/5"
                        >
                            <Users size={48} className="mx-auto mb-4 text-white/20" />
                            <p className="text-white/40 text-sm">No rooms found</p>
                            <p className="text-white/20 text-xs mt-1">Create one to start playing!</p>
                        </motion.div>
                    ) : (
                        filteredRooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass p-5 rounded-[30px] border border-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Room Icon */}
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10">
                                        📝
                                    </div>

                                    {/* Room Info */}
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-sm">{room.name}</h4>
                                            {room.isPrivate && <Lock size={12} className="text-white/30" />}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-white/40">
                                            <span className="flex items-center gap-1">
                                                <Crown size={10} className="text-[#FFA500]" />
                                                {room.hostName}
                                            </span>
                                            <span>•</span>
                                            <span>{room.gameType}</span>
                                        </div>
                                    </div>

                                    {/* Player Count */}
                                    <div className="text-center px-4">
                                        <div className="text-lg font-black">
                                            {room.playerCount}/{room.maxPlayers}
                                        </div>
                                        <div className="text-[8px] text-white/40 uppercase">Players</div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusColors[room.status]}`}>
                                        {room.status === 'WAITING' ? 'Open' : room.status === 'IN_PROGRESS' ? 'Playing' : 'Done'}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {room.status === 'WAITING' && room.playerCount < room.maxPlayers ? (
                                            <button
                                                onClick={() => onJoinRoom(room.id)}
                                                className="p-3 bg-[#008751] rounded-xl hover:scale-110 transition-all"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        ) : room.status === 'IN_PROGRESS' ? (
                                            <button
                                                onClick={() => onSpectate(room.id)}
                                                className="p-3 bg-[#FFA500]/20 rounded-xl hover:scale-110 transition-all text-[#FFA500]"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LobbyBrowser;
