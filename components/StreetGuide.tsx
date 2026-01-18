import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, MapPin, MessageCircle, ShoppingBag, User } from 'lucide-react';
import { useGameStore } from '../store';

const STEPS = [
    {
        title: "Welcome to the Compound!",
        description: "This is your home. From here, you can access your games, check your daily quests, and see how your village is doing.",
        icon: <Sparkles className="text-yellow-400" size={32} />,
        target: "DASHBOARD"
    },
    {
        title: "The Hub",
        description: "The Hub is where the street vibe is at! Chat with other legends, react with cultural slangs, and listen to the latest Afrobeats instrumentals.",
        icon: <MessageCircle className="text-blue-400" size={32} />,
        target: "SOCIAL"
    },
    {
        title: "The Market",
        description: "Spend your hard-earned coins here! Get premium Agbadas, unique skins, and elite titles like 'Agba Gamer'.",
        icon: <ShoppingBag className="text-[#00ff88]" size={32} />,
        target: "MARKET"
    },
    {
        title: "Villages & Regions",
        description: "Represent your village! Compete for your region—whether you're a Lekki Lion or an Abuja Eagle, every XP counts.",
        icon: <MapPin className="text-red-400" size={32} />,
        target: "VILLAGES"
    },
    {
        title: "Your Profile",
        description: "Keep track of your wins, achievements, and unique titles. This is where you generate your 'Street Cred' certificates.",
        icon: <User className="text-purple-400" size={32} />,
        target: "PROFILE"
    }
];

export const StreetGuide = ({ onClose }: { onClose: () => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { setView } = useGameStore();
    const step = STEPS[currentStep];

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            // Optional: Auto-navigate to show the user the view
            // setView(STEPS[currentStep + 1].target as any);
        } else {
            onClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
        >
            <div className="absolute top-10 right-10">
                <button onClick={onClose} className="p-3 glass rounded-full hover:bg-white/10 transition-all">
                    <X size={24} />
                </button>
            </div>

            <motion.div
                key={currentStep}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="max-w-md w-full glass p-10 rounded-[50px] border-2 border-[#00ff88]/20 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-white/5">
                    <motion.div
                        className="h-full bg-[#00ff88]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>

                <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-inner overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#008751]/20 to-transparent" />
                    {step.icon}
                </div>

                <h2 className="text-2xl font-black font-accent mb-4 uppercase tracking-tight">{step.title}</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-10 font-medium">
                    {step.description}
                </p>

                <button
                    onClick={handleNext}
                    className="w-full py-5 bg-[#008751] text-white rounded-[25px] font-black text-lg shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 group"
                >
                    {currentStep === STEPS.length - 1 ? "LET'S VIBE! 🔥" : "NEXT STEP"}
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-8 flex justify-center gap-2">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-8 bg-[#00ff88]' : 'w-2 bg-white/10'}`}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};
