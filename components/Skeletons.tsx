import React from 'react';
import { motion } from 'framer-motion';

// Skeleton shimmer animation
const shimmer = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
    },
};

export const SkeletonBox = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
    <motion.div
        className={`bg-gradient-to-r from-white/5 via-white/10 to-white/5 rounded-2xl ${className}`}
        style={{ backgroundSize: '200% 100%', ...style }}
        animate={shimmer.animate}
        transition={shimmer.transition}
    />
);

export const SkeletonText = ({ width = '100%', height = '16px' }: { width?: string; height?: string }) => (
    <SkeletonBox style={{ width, height }} className="rounded-lg" />
);

export const SkeletonCircle = ({ size = '48px' }: { size?: string }) => (
    <SkeletonBox style={{ width: size, height: size }} className="rounded-full" />
);

export const SkeletonCard = () => (
    <div className="glass p-6 rounded-[40px] border border-white/5 space-y-4">
        <div className="flex items-center gap-4">
            <SkeletonCircle size="60px" />
            <div className="flex-grow space-y-2">
                <SkeletonText width="60%" height="20px" />
                <SkeletonText width="40%" height="14px" />
            </div>
        </div>
        <SkeletonText width="100%" height="40px" />
    </div>
);

export const SkeletonGameCard = () => (
    <div className="glass p-8 rounded-[40px] border border-white/10 space-y-6">
        <div className="flex items-center gap-6">
            <SkeletonBox className="w-20 h-20 rounded-3xl" />
            <div className="space-y-2">
                <SkeletonText width="120px" height="24px" />
                <SkeletonText width="80px" height="12px" />
            </div>
        </div>
        <SkeletonText width="100%" height="48px" />
    </div>
);

export const SkeletonProfileHeader = () => (
    <div className="glass p-8 rounded-[50px] border border-white/10">
        <div className="flex flex-col md:flex-row items-center gap-8">
            <SkeletonCircle size="128px" />
            <div className="flex-grow space-y-3">
                <SkeletonText width="200px" height="32px" />
                <SkeletonText width="120px" height="14px" />
                <SkeletonText width="250px" height="12px" />
            </div>
        </div>
    </div>
);

export const SkeletonStatsGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass p-6 rounded-[30px] border border-white/10 flex flex-col items-center gap-2">
                <SkeletonText width="60px" height="32px" />
                <SkeletonText width="80px" height="10px" />
            </div>
        ))}
    </div>
);
