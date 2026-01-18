// Session persistence utilities for Naija Play

const STORAGE_KEY = 'naija_play_session';

export interface SessionData {
    userId: string;
    username: string;
    avatar: string;
    coins: number;
    xp: number;
    level: number;
    inventory: string[];
    activeTheme: string;
    settings: {
        music: boolean;
        sfx: boolean;
        haptics: boolean;
        radioTrack: number;
    };
}

export const saveSession = (data: Partial<SessionData>): void => {
    try {
        const existing = loadSession();
        const merged = { ...existing, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
        console.error('Failed to save session:', e);
    }
};

export const loadSession = (): SessionData | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to load session:', e);
        return null;
    }
};

export const clearSession = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear session:', e);
    }
};

export const hasSession = (): boolean => {
    return loadSession() !== null;
};
