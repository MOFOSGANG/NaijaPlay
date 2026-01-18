export type GameType = 'NPAT' | 'AFTER' | 'TINKO' | 'CATCHER' | 'GARDEN' | 'SUWE';

export type AppView = 'LANDING' | 'DASHBOARD' | 'GAME_PLAY' | 'PROFILE' | 'SOCIAL' | 'MARKET' | 'LEADERBOARDS' | 'LOBBY' | 'SETTINGS' | 'VILLAGES';

export type UserStatus = 'ONLINE' | 'OFFLINE' | 'IN_GAME';

export interface DailyQuest {
  id: string;
  title: string;
  task: string;
  rewardXP: number;
  rewardCoins: number;
  progress: number;
  total: number;
  completed: boolean;
}

export interface Village {
  id: string;
  name: string;
  region: string;
  memberCount: number;
  totalXP: number;
  rank: number;
  icon: string;
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: UserStatus;
  title?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface GameStats {
  wins: number;
  losses: number;
  highScore: number;
  played: number;
}

export interface GameRoom {
  id: string;
  name: string;
  gameType: GameType;
  players: string[];
  maxPlayers: number;
  status: 'WAITING' | 'PLAYING' | 'FINISHED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderTitle?: string;
  text: string;
  translatedText?: string;
  timestamp: string;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'SKIN' | 'OUTFIT' | 'EMOTE' | 'THEME';
  price: number;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  value?: string;
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  coins: number;
  villageId?: string;
  friends: Friend[];
  achievements: Achievement[];
  stats: Record<GameType, GameStats>;
  activeTheme: string;
  inventory: string[];
  bio: string;
  hasCompletedOnboarding: boolean;
}