// Sound effects service for Naija Play

const sounds: Record<string, HTMLAudioElement> = {};

// Using Web Audio API for better performance
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Simple beep using oscillator (no external files needed)
export const playBeep = (frequency: number = 440, duration: number = 0.1, volume: number = 0.3) => {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
        // Audio not supported
    }
};

// Game-specific sounds
export const playSounds = {
    click: () => playBeep(800, 0.05, 0.2),
    success: () => {
        playBeep(523, 0.1, 0.3); // C5
        setTimeout(() => playBeep(659, 0.1, 0.3), 100); // E5
        setTimeout(() => playBeep(784, 0.15, 0.3), 200); // G5
    },
    error: () => playBeep(200, 0.2, 0.3),
    notification: () => playBeep(1000, 0.1, 0.2),
    gameStart: () => {
        playBeep(440, 0.1, 0.3);
        setTimeout(() => playBeep(550, 0.1, 0.3), 150);
        setTimeout(() => playBeep(660, 0.2, 0.4), 300);
    },
    countdown: () => playBeep(600, 0.1, 0.25),
    coinEarned: () => {
        playBeep(880, 0.05, 0.2);
        setTimeout(() => playBeep(1100, 0.1, 0.3), 50);
    },
    levelUp: () => {
        [523, 659, 784, 1047].forEach((freq, i) => {
            setTimeout(() => playBeep(freq, 0.15, 0.3), i * 100);
        });
    },
    purchase: () => {
        playBeep(400, 0.1, 0.2);
        setTimeout(() => playBeep(600, 0.15, 0.3), 100);
    }
};

// Haptic feedback
export const vibrate = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
};

export const haptics = {
    light: () => vibrate(10),
    medium: () => vibrate(30),
    heavy: () => vibrate(50),
    success: () => vibrate([50, 30, 100]),
    error: () => vibrate([100, 50, 100]),
    notification: () => vibrate([25, 25, 25])
};
