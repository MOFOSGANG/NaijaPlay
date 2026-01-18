
import { create } from 'zustand';
import { User, AppView, GameType, GameRoom, ChatMessage, GameStats, DailyQuest, FriendRequest, PrivateMessage, VillageLeaderboardEntry } from './types';
import { XP_PER_LEVEL, DAILY_QUESTS, CULTURAL_TITLES } from './constants';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface GameState {
  user: User;
  currentView: AppView;
  activeGameId: GameType | null;
  activeRoom: GameRoom | null;
  globalChat: ChatMessage[];
  social: {
    friends: User[];
    requests: FriendRequest[];
    messages: Record<string, PrivateMessage[]>;
    activeChatId: string | null;
  };
  leaders: {
    users: User[];
    villages: VillageLeaderboardEntry[];
  };
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

  // Social Actions
  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  sendFriendRequest: (username: string) => Promise<void>;
  respondToRequest: (requestId: string, accept: boolean) => Promise<void>;
  fetchMessages: (friendId: string) => Promise<void>;
  sendPrivateMessage: (receiverId: string, text: string) => Promise<void>;
  setActiveChat: (friendId: string | null) => void;

  // Leaderboard Actions
  fetchLeaderboards: (type: 'USERS' | 'VILLAGES', region?: string) => Promise<void>;
  claimDailyReward: () => Promise<any>;
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
  loginStreak: 1,
  hasCompletedOnboarding: false
};

export const useGameStore = create<GameState>((set, get) => ({
  user: MOCK_USER,
  currentView: 'LANDING',
  activeGameId: null,
  activeRoom: null,
  globalChat: [],
  social: { friends: [], requests: [], messages: {}, activeChatId: null },
  leaders: { users: [], villages: [] },
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
        const completed = newProgress >= q.target;
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
  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    localStorage.setItem('game-settings', JSON.stringify(updated));
    return { settings: updated };
  }),
  // Fix: Implemented updateProfile
  updateProfile: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
  completeOnboarding: () => set((state) => ({ user: { ...state.user, hasCompletedOnboarding: true } })),

  fetchQuests: async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ dailyQuests: DAILY_QUESTS });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/quests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ dailyQuests: data });
      }
    } catch (e) {
      console.error("Failed to fetch quests", e);
    }
  },

  claimQuest: async (questId) => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/quests/${questId}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const { quest } = await res.json();
        set((state) => {
          const updatedQuests = state.dailyQuests.map(q =>
            q.id === questId ? { ...q, claimed: true, completed: true } : q
          );
          const updatedUser = {
            ...state.user,
            xp: state.user.xp + quest.rewardXP,
            coins: state.user.coins + quest.rewardCoins
          };
          return { dailyQuests: updatedQuests, user: updatedUser };
        });
      }
    } catch (e) {
      console.error("Claim failed", e);
    }
  },

  // --- Social Implementation ---

  fetchFriends: async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/social/friends`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const friends = await res.json();
        set(state => ({ social: { ...state.social, friends } }));
      }
    } catch (e) { console.error(e); }
  },

  fetchRequests: async () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/social/requests`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const requests = await res.json();
        set(state => ({ social: { ...state.social, requests } }));
      }
    } catch (e) { console.error(e); }
  },

  sendFriendRequest: async (username) => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error("Not logged in");

    const res = await fetch(`${API_URL}/api/social/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ username })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to send request");
    }
  },

  respondToRequest: async (requestId, accept) => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    await fetch(`${API_URL}/api/social/request/${requestId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ accept })
    });

    // Refresh data
    get().fetchRequests();
    if (accept) get().fetchFriends();
  },

  fetchMessages: async (friendId) => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const res = await fetch(`${API_URL}/api/social/messages/${friendId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const msgs = await res.json();
      set(state => ({
        social: {
          ...state.social,
          messages: { ...state.social.messages, [friendId]: msgs }
        }
      }));
    }
  },

  sendPrivateMessage: async (receiverId, text) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const res = await fetch(`${BACKEND_URL}/api/social/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ receiverId, text })
    });

    if (res.ok) {
      const msg = await res.json();
      set(state => ({
        social: {
          ...state.social,
          messages: {
            ...state.social.messages,
            [receiverId]: [...(state.social.messages[receiverId] || []), msg]
          }
        }
      }));
    }
  },

  setActiveChat: (friendId: string | null) => set(state => ({ social: { ...state.social, activeChatId: friendId } })),

  fetchLeaderboards: async (type, region) => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const path = type === 'USERS'
      ? (region ? `users/regional/${region}` : 'users/global')
      : (region ? `villages/regional/${region}` : 'villages/global');

    try {
      const res = await fetch(`${API_URL}/api/leaderboards/${path}`);
      if (res.ok) {
        const data = await res.json();
        set(state => ({
          leaders: {
            ...state.leaders,
            [type === 'USERS' ? 'users' : 'villages']: data
          }
        }));
      }
    } catch (e) {
      console.error("Failed to fetch leaderboards", e);
    }
  },

  claimDailyReward: async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/daily-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.claimed) {
        set((state) => ({
          user: {
            ...state.user,
            coins: state.user.coins + data.rewardCoins,
            xp: state.user.xp + data.rewardXP,
            loginStreak: data.newStreak
          }
        }));
      }
      return data;
    } catch (e) {
      console.error("Reward claim failed", e);
      return { claimed: false, message: "Street network slow! Try again later. 🏾" };
    }
  }
}));
