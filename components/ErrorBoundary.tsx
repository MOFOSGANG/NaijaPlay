import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-center">
                    <div className="glass p-12 rounded-[50px] border border-white/10 max-w-lg w-full space-y-8" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
                        <div className="w-24 h-24 bg-red-500/10 rounded-[35px] border-4 border-red-500 flex items-center justify-center text-5xl mx-auto">
                            <AlertTriangle size={48} className="text-red-500" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-black font-accent text-white" style={{ fontFamily: 'Baloo 2, cursive' }}>Omo, Something Burst! 🤯</h1>
                            <p className="text-white/40 leading-relaxed font-bold">
                                The street don get small issue. Our engineers dey fix the pothole.
                                Abeg, try refresh or go back home.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-grow py-5 bg-[#008751] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-green-900/20"
                            >
                                <RefreshCw size={22} />
                                Refresh Street
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                            >
                                <Home size={22} className="text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
