import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Swords, Lock, Sparkles, MapPin } from 'lucide-react';

const RegionalWars = () => {
    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-8 glass rounded-[40px] border border-white/10 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 ankara-pattern opacity-5 pointer-events-none" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-[#008751]/10 rounded-full blur-3xl"
            />

            <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFA500]/10 border border-[#FFA500]/20 rounded-full text-[#FFA500] text-[8px] font-black uppercase tracking-[0.2em] mb-4">
                    <Lock size={10} />
                    Expansion in Progress
                </div>

                <div className="flex justify-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-3xl">⚔️</div>
                    <div className="w-16 h-16 bg-[#008751]/20 rounded-2xl border border-[#008751]/30 flex items-center justify-center text-3xl shadow-lg shadow-green-900/20">🛡️</div>
                </div>

                <h2 className="text-4xl font-black font-accent text-white uppercase tracking-tighter">
                    Regional wars <span className="text-white/20">/</span> Coming Soon
                </h2>

                <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                    Prepare your Village! We are expanding the compound to support massive inter-regional battles.
                    Soon, you'll be able to dominate Lagos, Abuja, and Port Harcourt in high-stakes tournaments.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-xl relative z-10 opacity-40">
                {[
                    { label: 'Territory Control', icon: <MapPin size={16} /> },
                    { label: 'Weekly Tournaments', icon: <Globe size={16} /> },
                    { label: 'Elite Badges', icon: <Shield size={16} /> }
                ].map((feature, idx) => (
                    <div key={idx} className="p-4 glass rounded-2xl border border-white/5 flex flex-col items-center gap-2">
                        <div className="text-[#00ff88]">{feature.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{feature.label}</span>
                    </div>
                ))}
            </div>

            <button disabled className="relative z-10 px-8 py-4 bg-white/5 rounded-2xl text-white/20 font-black text-xs uppercase tracking-widest border border-white/10 cursor-not-allowed">
                Wait for Street Permission
            </button>
        </div>
    );
};

export default RegionalWars;
