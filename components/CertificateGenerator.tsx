import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Check } from 'lucide-react';
import { useGameStore } from '../store';
import html2canvas from 'html2canvas';

export const CertificateGenerator = ({ type = 'RANK' }: { type?: 'RANK' | 'WIN' }) => {
    const { user } = useGameStore();
    const certRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);
    const [completed, setCompleted] = useState(false);

    const handleDownload = async () => {
        if (!certRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(certRef.current, {
                backgroundColor: '#0a0a0f',
                scale: 2,
            });
            const link = document.createElement('a');
            link.download = `NaijaPlay_Cert_${user.username}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setCompleted(true);
            setTimeout(() => setCompleted(false), 3000);
        } catch (err) {
            console.error("Failed to generate certificate", err);
        } finally {
            setGenerating(false);
        }
    };

    const handleWhatsAppShare = async () => {
        const text = `Omo! Check my Street Cred for Naija Play! 🇳🇬🔥 I'm officially a ${user.title} (Level ${user.level}). Who wan challenge me? 🎮🏆`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Hidden/Off-screen certificate to capture */}
            <div className="fixed -left-[2000px] top-0">
                <div
                    ref={certRef}
                    className="w-[800px] h-[500px] bg-[#0a0a0f] p-12 relative overflow-hidden flex flex-col items-center justify-center border-[20px] border-[#008751]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    <div className="absolute inset-0 ankara-pattern opacity-10" />
                    <div className="absolute top-0 left-0 w-full h-full border-[2px] border-[#00ff88]/20 m-4 pointer-events-none" />

                    <div className="text-[#00ff88] text-2xl font-black mb-2 tracking-[0.3em]">NAIJA PLAY</div>
                    <div className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-12">Official Street Credential</div>

                    <h1 className="text-6xl font-black text-white mb-4 uppercase tracking-tighter">CERTIFICATE OF AGBA</h1>

                    <div className="w-32 h-[2px] bg-[#FFA500] mb-8" />

                    <p className="text-white/60 text-lg mb-2">This is to certify that</p>
                    <h2 className="text-5xl font-black text-[#FFA500] mb-8 uppercase">{user.username}</h2>

                    <p className="text-white/60 text-lg mb-8 max-w-xl text-center">
                        Has achieved the rank of <span className="text-white font-black">{user.title}</span> at Level <span className="text-white font-black">{user.level}</span> and is officially recognized as a Legend in the Compound.
                    </p>

                    <div className="flex justify-between w-full mt-10 px-12">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-[1px] bg-white/20 mb-2" />
                            <span className="text-[8px] text-white/40 uppercase tracking-widest">Village Elder</span>
                        </div>

                        <div className="w-24 h-24 bg-[#008751]/20 rounded-full border-4 border-[#00ff88]/40 flex items-center justify-center rotate-[-15deg] shadow-2xl relative">
                            <div className="text-4xl">🏅</div>
                            <div className="absolute -bottom-2 bg-[#FFA500] text-black text-[8px] font-black px-2 py-0.5 rounded uppercase">VERIFIED</div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-24 h-[1px] bg-white/20 mb-2" />
                            <span className="text-[8px] text-white/40 uppercase tracking-widest">Chidi AI</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 w-full">
                <button
                    onClick={handleDownload}
                    disabled={generating}
                    className="flex-grow glass py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                    {completed ? <Check size={16} className="text-[#00ff88]" /> : generating ? "VIBING..." : <Download size={16} />}
                    {completed ? "SAVED!" : "DOWNLOAD CERT"}
                </button>
                <button
                    onClick={handleWhatsAppShare}
                    className="bg-[#25D366] text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                >
                    <Share2 size={20} />
                    <span className="font-black text-xs uppercase">Share Status</span>
                </button>
            </div>
        </div>
    );
};
