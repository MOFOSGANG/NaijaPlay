
import { create } from 'zustand';
import { User, AppView, GameType, GameRoom, ChatMessage, GameStats, DailyQuest } from './types';
import { XP_PER_LEVEL, DAILY_QUESTS, CULTURAL_TITLES } from './constants';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

interface GameState {
  user: User;
  currentView: AppView;
  activeGameId: GameType | null;
  activeRoom: GameRoom | null;
  globalChat: ChatMessage[];
  dailyQuests: DailyQuest[];
  isLoading: boolean;
  aiBanter: { text: string; visible: boolean };
  settings: { music: boolean; sfx: boolean; haptics: boolean; radioTrack: number };

  // Actions
  setView: (view: AppView, gameId?: GameType) => void;
  setLoading: (loading: boolean) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateStats: (gameId: GameType, result: 'WIN' | 'LOSS', score?: number) => void;
  sendMessage: (text: string) => void;
  translateMessage: (msgId: string) => Promise<void>;
  updateQuest: (id: string, amount: number) => void;
  joinVillage: (id: string) => void;
  buyItem: (itemId: string, price: number) => boolean;
  triggerAIBanter: (context: string) => Promise<void>;
  closeBanter: () => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  // Fix: Added updateProfile signature
  updateProfile: (updates: Partial<User>) => void;
  completeOnboarding: () => void;
}

const INITIAL_STATS: GameStats = { wins: 0, losses: 0, highScore: 0, played: 0 };

const MOCK_USER: User = {
  id: 'guest-' + Math.random().toString(36).substr(2, 9),
  username: 'Street-Pikin',
  avatar: '👤',
  title: CULTURAL_TITLES[0],
  level: 1,
  xp: 0,
  coins: 500,
  friends: [],
  achievements: [],
  stats: {
    NPAT: { ...INITIAL_STATS },
    AFTER: { ...INITIAL_STATS },
    SUWE: { ...INITIAL_STATS },
    GARDEN: { ...INITIAL_STATS },
    TINKO: { ...INITIAL_STATS },
    CATCHER: { ...INITIAL_STATS }
  },
  activeTheme: 'classic',
  inventory: ['classic_theme'],
  bio: 'Compounding heritage one game at a time! 🔥',
  hasCompletedOnboarding: false
};

export const useGameStore = create<GameState>((set, get) => ({
  user: MOCK_USER,
  currentView: 'LANDING',
  activeGameId: null,
  activeRoom: null,
  globalChat: [],
  dailyQuests: DAILY_QUESTS,
  isLoading: false,
  aiBanter: { text: "", visible: false },
  settings: { music: true, sfx: true, haptics: true, radioTrack: 0 },

  setView: (view, gameId) => set({ currentView: view, activeGameId: gameId || null }),
  setLoading: (loading) => set({ isLoading: loading }),

  addXP: (amount) => set((state) => {
    let newXP = state.user.xp + amount;
    let newLevel = state.user.level;
    while (newXP >= XP_PER_LEVEL) {
      newXP -= XP_PER_LEVEL;
      newLevel += 1;
    }
    const newTitle = CULTURAL_TITLES[Math.min(newLevel - 1, CULTURAL_TITLES.length - 1)];
    return { user: { ...state.user, xp: newXP, level: newLevel, title: newTitle } };
  }),

  addCoins: (amount) => set((state) => ({ user: { ...state.user, coins: state.user.coins + amount } })),

  updateStats: (gameId, result, score = 0) => {
    const state = get();
    const currentStats = state.user.stats[gameId];
    const newStats: GameStats = {
      wins: result === 'WIN' ? currentStats.wins + 1 : currentStats.wins,
      losses: result === 'LOSS' ? currentStats.losses + 1 : currentStats.losses,
      highScore: Math.max(currentStats.highScore, score),
      played: currentStats.played + 1
    };
    if (gameId === 'NPAT') get().updateQuest('q2', score);
    set({ user: { ...state.user, stats: { ...state.user.stats, [gameId]: newStats } } });
  },

  updateQuest: (id, amount) => set((state) => ({
    dailyQuests: state.dailyQuests.map(q => {
      if (q.id === id && !q.completed) {
        const newProgress = q.progress + amount;
        const completed = newProgress >= q.total;
        if (completed) {
          get().addXP(q.rewardXP);
          get().addCoins(q.rewardCoins);
        }
        return { ...q, progress: newProgress, completed };
      }
      return q;
    })
  })),

  sendMessage: (text) => {
    const state = get();
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: state.user.id,
      senderName: state.user.username,
      senderTitle: state.user.title,
      text,
      timestamp: new Date().toISOString()
    };
    set({ globalChat: [...state.globalChat, newMessage].slice(-50) });
    get().updateQuest('q1', 1);
  },

  translateMessage: async (msgId) => {
    const state = get();
    const msg = state.globalChat.find(m => m.id === msgId);
    if (!msg || msg.translatedText) return;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [`Translate this message into authentic Nigerian Street Pidgin: "${msg.text}". Use deep slang if possible. Just return the translation.`]
      });
      const text = result.text;

      set({
        globalChat: state.globalChat.map(m => m.id === msgId ? { ...m, translatedText: text } : m)
      });
    } catch (e) {
      console.error(e);
    }
  },

  joinVillage: (id) => set((state) => ({ user: { ...state.user, villageId: id } })),

  buyItem: (itemId, price) => {
    const state = get();
    if (state.user.coins >= price && !state.user.inventory.includes(itemId)) {
      set({
        user: { ...state.user, coins: state.user.coins - price, inventory: [...state.user.inventory, itemId] }
      });
      get().updateQuest('q3', 1);
      return true;
    }
    return false;
  },

  triggerAIBanter: async (context) => {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [`You are Chidi, a street-smart Nigerian kid. Comment on: ${context}. One sentence, Pidgin only.`]
      });
      const text = result.text;

      set({ aiBanter: { text: text || "Oya!", visible: true } });
      setTimeout(() => get().closeBanter(), 8000);
    } catch (e) { }
  },

  closeBanter: () => set((state) => ({ aiBanter: { ...state.aiBanter, visible: false } })),
  updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  // Fix: Implemented updateProfile
  updateProfile: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
  completeOnboarding: () => set((state) => ({ user: { ...state.user, hasCompletedOnboarding: true } }))
}));
