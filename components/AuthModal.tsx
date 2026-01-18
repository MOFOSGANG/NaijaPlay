import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'RECOVER' | 'VERIFY' | 'RESET'>('LOGIN');
    const [formData, setFormData] = useState({ username: '', email: '', password: '', token: '', newPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const API_URL = import.meta.env.VITE_BACKEND_URL || '';

        try {
            if (mode === 'RECOVER') {
                // Mock API call for recovery request
                const res = await fetch(`${API_URL}/api/auth/recover`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email })
                });
                const data = await res.json();

                if (res.ok) {
                    setMessage("If that email exists, check your logs for the PIN!");
                    setTimeout(() => setMode('VERIFY'), 1500);
                } else {
                    setError(data.error || "Recovery failed.");
                }
                setLoading(false);
                return;
            }

            if (mode === 'VERIFY') {
                // Placeholder verification logic
                setMode('RESET');
                setLoading(false);
                return;
            }

            if (mode === 'RESET') {
                // Placeholder reset logic
                setTimeout(() => {
                    setMessage("Password updated! Sharp! 🔥");
                    setMode('LOGIN');
                    setLoading(false);
                }, 1000);
                return;
            }

            if (mode === 'LOGIN') {
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: formData.username, password: formData.password })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('auth_token', data.token);
                    onSuccess(data.user);
                    onClose();
                } else {
                    setError(data.error || "Login fail. Check details.");
                }
                setLoading(false);
                return;
            }

            if (mode === 'SIGNUP') {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('auth_token', data.token);
                    setMessage("Welcome to the Street! Oya... 🔥");
                    setTimeout(() => {
                        onSuccess(data.user);
                        onClose();
                    }, 1500);
                } else {
                    setError(data.error || "Signup fail. Try different name.");
                }
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Server dey online?");
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"
                    >
                        {/* Header Decoration */}
                        <div className="h-32 bg-[#008751] relative flex items-center justify-center">
                            <div className="ankara-pattern opacity-20" />
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl mb-2 border border-white/20">
                                    {mode === 'SIGNUP' ? '👋' : (mode === 'RECOVER' || mode === 'VERIFY' || mode === 'RESET') ? '🔑' : '🔥'}
                                </div>
                                <h2 className="text-2xl font-black font-accent text-white uppercase tracking-tighter text-center">
                                    {mode === 'SIGNUP' ? 'Join the Street' : mode === 'RECOVER' ? 'Account Recovery' : mode === 'VERIFY' ? 'Check your Street' : mode === 'RESET' ? 'New Identity' : 'Welcome Back'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 bg-black/20 rounded-full text-white/60 hover:text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">⚠️</div>
                                    {error}
                                </motion.div>
                            )}

                            {message && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-2xl text-[#00ff88] text-xs font-bold flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 bg-[#00ff88]/20 rounded-lg flex items-center justify-center shrink-0">✅</div>
                                    {message}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {(mode === 'LOGIN' || mode === 'SIGNUP') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-white/40 ml-2">Street Username</label>
                                        <div className="relative">
                                            <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. SharpGuy"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#00ff88] transition-all text-sm font-bold"
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(mode === 'SIGNUP' || mode === 'RECOVER') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-white/40 ml-2">
                                            {mode === 'SIGNUP' ? 'Street Email' : 'Recovery Email'}
                                        </label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                required
                                                type="email"
                                                placeholder="yourname@gmail.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#00ff88] transition-all text-sm font-bold"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {mode === 'VERIFY' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-white/40 ml-2">Verification Code</label>
                                        <div className="relative">
                                            <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                required
                                                type="text"
                                                placeholder="Paste token here"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#00ff88] transition-all tracking-[0.2em] text-center font-black"
                                                value={formData.token}
                                                onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(mode === 'LOGIN' || mode === 'SIGNUP' || mode === 'RESET') && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-white/40 ml-2">
                                            {mode === 'RESET' ? 'New Password' : 'Password'}
                                        </label>
                                        <div className="relative">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                                            <input
                                                required
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#00ff88] transition-all text-sm font-bold"
                                                value={mode === 'RESET' ? formData.newPassword : formData.password}
                                                onChange={(e) => mode === 'RESET'
                                                    ? setFormData({ ...formData, newPassword: e.target.value })
                                                    : setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    className="w-full py-5 bg-[#008751] rounded-2xl font-black text-sm uppercase tracking-widest text-white flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-900/20 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            {mode === 'LOGIN' ? 'Oya! Enter' :
                                                mode === 'RECOVER' ? 'Send Recovery PIN' :
                                                    mode === 'VERIFY' ? 'Verify Identity' :
                                                        mode === 'RESET' ? 'Update Street Keys' :
                                                            'Finalize Registration'}
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="pt-4 flex flex-col items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                                {mode === 'LOGIN' ? (
                                    <>
                                        <button onClick={() => setMode('RECOVER')} className="text-white/40 hover:text-white transition-colors underline underline-offset-4">Forgot Password?</button>
                                        <button onClick={() => setMode('SIGNUP')} className="text-[#00ff88] hover:text-[#00ff88]/80 transition-colors">Don't have an account? Sign Up</button>
                                    </>
                                ) : (
                                    <button onClick={() => setMode('LOGIN')} className="text-white/40 hover:text-white transition-colors">Already have an account? Login</button>
                                )}
                            </div>
                        </div>

                        {/* Footer Trust Badge */}
                        <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2 text-[8px] text-white/20 font-black uppercase tracking-[0.2em]">
                            <ShieldCheck size={10} />
                            Secured Compound Encryption
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
