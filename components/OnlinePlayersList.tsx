import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, X, UserPlus, Gamepad2, MessageCircle, Circle } from 'lucide-react';

interface OnlinePlayer {
    id: string;
    username: string;
    avatar: string;
    title: string;
    status: 'ONLINE' | 'IN_GAME' | 'IN_QUEUE';
    level: number;
    currentGame?: string;
}

interface OnlinePlayersListProps {
    players: OnlinePlayer[];
    onInvite?: (playerId: string) => void;
    onMessage?: (playerId: string) => void;
}

const OnlinePlayersList = ({ players, onInvite, onMessage }: OnlinePlayersListProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'IN_GAME'>('ALL');

    const statusColors = {
        ONLINE: 'bg-[#00ff88]',
        IN_GAME: 'bg-[#FFA500]',
        IN_QUEUE: 'bg-yellow-500',
    };

    const statusLabels = {
        ONLINE: 'Online',
        IN_GAME: 'In Game',
        IN_QUEUE: 'In Queue',
    };

    const filteredPlayers = players
        .filter(p => filter === 'ALL' || p.status === filter)
        .filter(p =>
            searchQuery === '' ||
            p.username.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="glass rounded-[40px] border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#00ff88]" />
                    <span className="font-black text-sm">Online Players</span>
                    <span className="text-xs text-white/40">({players.length})</span>
                </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-white/5">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search players..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#00ff88]"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-white/5">
                {[
                    { id: 'ALL' as const, label: 'All' },
                    { id: 'ONLINE' as const, label: 'Available' },
                    { id: 'IN_GAME' as const, label: 'In Game' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase transition-all ${filter === tab.id ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-white/40'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Player List */}
            <div className="max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                    {filteredPlayers.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users size={32} className="mx-auto mb-3 text-white/10" />
                            <p className="text-xs text-white/30">No players found</p>
                        </div>
                    ) : (
                        filteredPlayers.map((player, index) => (
                            <motion.div
                                key={player.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 p-3 hover:bg-white/5 transition-all group"
                            >
                                {/* Avatar with Status */}
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-lg">
                                        {player.avatar}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[player.status]} rounded-full border-2 border-[#0a0a0f]`} />
                                </div>

                                {/* Player Info */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm truncate">{player.username}</p>
                                        <span className="text-[8px] text-white/30 bg-white/5 px-2 py-0.5 rounded">Lv.{player.level}</span>
                                    </div>
                                    <p className="text-[9px] text-white/40 truncate">
                                        {player.status === 'IN_GAME' && player.currentGame
                                            ? `Playing ${player.currentGame}`
                                            : statusLabels[player.status]}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {player.status === 'ONLINE' && onInvite && (
                                        <button
                                            onClick={() => onInvite(player.id)}
                                            className="p-2 bg-[#008751]/20 rounded-lg hover:bg-[#008751]/40 transition-all"
                                            title="Invite to game"
                                        >
                                            <Gamepad2 size={14} className="text-[#00ff88]" />
                                        </button>
                                    )}
                                    {onMessage && (
                                        <button
                                            onClick={() => onMessage(player.id)}
                                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                            title="Send message"
                                        >
                                            <MessageCircle size={14} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OnlinePlayersList;
