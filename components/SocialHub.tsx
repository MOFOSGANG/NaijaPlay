import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, MessageCircle, Search, Check, X, Send, ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store';
import { User, FriendRequest } from '../types';

const SocialHub = () => {
    const {
        social, fetchFriends, fetchRequests, sendFriendRequest,
        respondToRequest, fetchMessages, sendPrivateMessage,
        setActiveChat, user: currentUser
    } = useGameStore();

    const [tab, setTab] = useState<'FRIENDS' | 'REQUESTS' | 'FIND'>('FRIENDS');
    const [searchTerm, setSearchTerm] = useState('');
    const [msgText, setMsgText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentUser) return;
        fetchFriends();
        fetchRequests();
    }, [currentUser?.id]);

    useEffect(() => {
        if (social.activeChatId) {
            fetchMessages(social.activeChatId);
            const interval = setInterval(() => fetchMessages(social.activeChatId!), 5000); // Poll for new messages
            return () => clearInterval(interval);
        }
    }, [social.activeChatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [social.messages, social.activeChatId]);

    // Early return AFTER ALL hooks - React Rules of Hooks requires consistent hook call order
    if (!currentUser) return null;

    const handleSendRequest = async () => {
        if (!searchTerm.trim()) return;
        try {
            await sendFriendRequest(searchTerm);
            setSearchTerm('');
            alert("Request sent! Oya wait for reply.");
        } catch (e: any) {
            alert(e.message || "Failed to send request");
        }
    };

    const handleSendMessage = async () => {
        if (!msgText.trim() || !social.activeChatId) return;
        await sendPrivateMessage(social.activeChatId, msgText);
        setMsgText('');
    };

    // Chat View
    if (social.activeChatId) {
        const friend = social.friends.find(f => f.id === social.activeChatId) || { username: 'Unknown', title: '' } as User;
        const messages = social.messages[social.activeChatId] || [];

        return (
            <div className="h-[600px] flex flex-col bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/5">
                    <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#008751] to-[#00ff88] rounded-full flex items-center justify-center text-lg font-black text-white">
                        {friend.username[0]}
                    </div>
                    <div>
                        <h3 className="font-black text-white">{friend.username}</h3>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{friend.title}</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-white/20 text-xs mt-10">No gist yet. Start am now!</div>
                    ) : (
                        messages.map(m => (
                            <div key={m.id} className={`flex flex-col ${m.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${m.senderId === currentUser.id
                                    ? 'bg-[#008751] text-white rounded-tr-none'
                                    : 'bg-white/10 text-white rounded-tl-none border border-white/5'
                                    }`}>
                                    {m.text}
                                </div>
                                <span className="text-[8px] text-white/20 mt-1 px-1">
                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                    <input
                        type="text"
                        value={msgText}
                        onChange={e => setMsgText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your gist..."
                        className="flex-grow bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00ff88] transition-all"
                    />
                    <button onClick={handleSendMessage} className="p-3 bg-[#008751] rounded-xl text-white hover:scale-105 transition-all">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-white/5 p-2 gap-2">
                {[
                    { id: 'FRIENDS', label: 'My Guys', icon: Users },
                    { id: 'REQUESTS', label: 'Incoming', icon: UserPlus, count: social.requests.length },
                    { id: 'FIND', label: 'Find Person', icon: Search }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <t.icon size={14} />
                        {t.label}
                        {t.count ? <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full">{t.count}</span> : null}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {tab === 'FRIENDS' && (
                        <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {social.friends.length === 0 ? (
                                <div className="text-center py-10 text-white/30">
                                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>You never get guys for street?</p>
                                    <button onClick={() => setTab('FIND')} className="mt-4 text-[#00ff88] text-xs font-black underline">Find Friends</button>
                                </div>
                            ) : (
                                social.friends.map(friend => (
                                    <div key={friend.id} onClick={() => setActiveChat(friend.id)} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 cursor-pointer transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl shadow-inner">
                                                {friend.username[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white group-hover:text-[#00ff88] transition-colors">{friend.username}</h4>
                                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{friend.title}</p>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-white/5 rounded-full text-white/40 group-hover:text-[#00ff88] group-hover:bg-[#00ff88]/10 transition-all">
                                            <MessageCircle size={20} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {tab === 'REQUESTS' && (
                        <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {social.requests.length === 0 ? (
                                <div className="text-center py-10 text-white/30">
                                    <p>No new requests.</p>
                                </div>
                            ) : (
                                social.requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold">
                                                {req.user.username[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm">{req.user.username}</h4>
                                                <p className="text-[10px] text-white/40">wants to be your guy</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => respondToRequest(req.id, true)} className="p-2 bg-[#00ff88]/20 text-[#00ff88] rounded-xl hover:bg-[#00ff88]/30 transition-all"><Check size={18} /></button>
                                            <button onClick={() => respondToRequest(req.id, false)} className="p-2 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500/30 transition-all"><X size={18} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {tab === 'FIND' && (
                        <motion.div key="find" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-white/40 ml-2">Username</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Enter person username"
                                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00ff88] transition-all"
                                    />
                                    <button onClick={handleSendRequest} className="px-6 bg-[#008751] rounded-xl font-black text-white hover:bg-[#00a865] transition-all">
                                        ADD
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                <p className="text-[10px] text-white/40">Share your username so guys fit find you:</p>
                                <p className="text-xl font-black text-[#00ff88] mt-2 select-all">{currentUser.username}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SocialHub;
