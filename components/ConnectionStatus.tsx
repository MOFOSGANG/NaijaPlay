import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { useMultiplayerStore } from '../multiplayerStore';

const ConnectionStatus = () => {
    const { isConnected, isConnecting, connectionError, reconnectAttempts, connect } = useMultiplayerStore();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Show banner if disconnected for more than 2 seconds
        let timeout: ReturnType<typeof setTimeout>;
        if (!isConnected && !isConnecting) {
            timeout = setTimeout(() => setShowBanner(true), 2000);
        } else {
            setShowBanner(false);
        }
        return () => clearTimeout(timeout);
    }, [isConnected, isConnecting]);

    // Small indicator in corner
    const StatusIndicator = () => (
        <div className="fixed bottom-28 right-6 z-[100]">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex items-center gap-2 px-3 py-2 glass rounded-full border ${isConnected
                        ? 'border-[#00ff88]/30 text-[#00ff88]'
                        : isConnecting
                            ? 'border-yellow-500/30 text-yellow-500'
                            : 'border-red-500/30 text-red-500'
                    }`}
            >
                {isConnected ? (
                    <>
                        <Wifi size={14} />
                        <span className="text-[10px] font-black uppercase">Live</span>
                    </>
                ) : isConnecting ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase">Connecting...</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={14} />
                        <span className="text-[10px] font-black uppercase">Offline</span>
                    </>
                )}
            </motion.div>
        </div>
    );

    // Full banner for extended disconnection
    const DisconnectBanner = () => (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-16 left-0 right-0 z-[200] px-4"
                >
                    <div className="max-w-md mx-auto glass border-2 border-red-500/30 rounded-2xl p-4 bg-red-500/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <WifiOff size={24} className="text-red-500" />
                            </div>
                            <div className="flex-grow">
                                <p className="font-black text-sm">Connection Lost</p>
                                <p className="text-xs text-white/50">
                                    {connectionError || 'Trying to reconnect...'}
                                    {reconnectAttempts > 0 && ` (Attempt ${reconnectAttempts})`}
                                </p>
                            </div>
                            <button
                                onClick={connect}
                                className="p-3 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-all"
                            >
                                <RefreshCw size={18} className="text-red-500" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <StatusIndicator />
            <DisconnectBanner />
        </>
    );
};

export default ConnectionStatus;
