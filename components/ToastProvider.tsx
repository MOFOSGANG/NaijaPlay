import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Zap, Users, Swords } from 'lucide-react';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'challenge' | 'reward';
    title: string;
    message?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToasts = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToasts must be used within ToastProvider');
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts(prev => [...prev, { ...toast, id }]);

        // Auto remove after duration
        const duration = toast.duration || 4000;
        setTimeout(() => removeToast(id), duration);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToasts();

    const typeStyles = {
        success: 'border-[#00ff88] bg-[#00ff88]/10',
        error: 'border-red-500 bg-red-500/10',
        info: 'border-blue-500 bg-blue-500/10',
        challenge: 'border-[#FFA500] bg-[#FFA500]/10',
        reward: 'border-yellow-400 bg-yellow-400/10',
    };

    const typeIcons = {
        success: <CheckCircle size={20} className="text-[#00ff88]" />,
        error: <AlertCircle size={20} className="text-red-500" />,
        info: <Info size={20} className="text-blue-500" />,
        challenge: <Swords size={20} className="text-[#FFA500]" />,
        reward: <Zap size={20} className="text-yellow-400" />,
    };

    return (
        <div className="fixed top-20 right-6 z-[500] space-y-3 max-w-sm">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className={`glass p-4 rounded-2xl border-2 ${typeStyles[toast.type]} shadow-xl backdrop-blur-xl`}
                    >
                        <div className="flex items-start gap-3">
                            {typeIcons[toast.type]}
                            <div className="flex-grow">
                                <p className="font-black text-sm">{toast.title}</p>
                                {toast.message && (
                                    <p className="text-xs text-white/60 mt-0.5">{toast.message}</p>
                                )}
                                {toast.action && (
                                    <button
                                        onClick={toast.action.onClick}
                                        className="mt-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-white/20 transition-all"
                                    >
                                        {toast.action.label}
                                    </button>
                                )}
                            </div>
                            <button onClick={() => removeToast(toast.id)} className="text-white/40 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastProvider;
