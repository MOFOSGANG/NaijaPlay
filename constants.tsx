import { GameType, ShopItem, DailyQuest, Village } from './types';

export const GAMES_CONFIG = {
  NPAT: {
    id: 'NPAT' as GameType,
    title: 'Name Place Animal Thing',
    description: 'The ultimate vocabulary challenge! Fill categories starting with the secret letter.',
    icon: '📝',
    color: 'bg-blue-600',
    difficulty: 'HARD',
    culturalFact: 'In Nigerian schools, this is played during free periods using just paper and pen.',
    isUnderDevelopment: false
  },
  AFTER: {
    id: 'AFTER' as GameType,
    title: 'After',
    description: 'Predict the sum of fingers shown in the circle.',
    icon: '✋',
    color: 'bg-red-500',
    difficulty: 'MEDIUM',
    culturalFact: 'Features the iconic chant "After round one, original Panadol extra!"',
    isUnderDevelopment: true
  },
  SUWE: {
    id: 'SUWE' as GameType,
    title: 'Suwe',
    description: 'Traditional hopscotch. Toss your stone and hop through the grid to victory.',
    icon: '🧱',
    color: 'bg-orange-500',
    difficulty: 'EASY',
    culturalFact: 'The "Suwe" stone is precious to every player.',
    isUnderDevelopment: true
  },
  GARDEN: {
    id: 'GARDEN' as GameType,
    title: 'Who is in the Garden?',
    description: 'Call and response guessing game. Can you find the visitor?',
    icon: '🏡',
    color: 'bg-yellow-500',
    difficulty: 'EASY',
    culturalFact: 'Features a beautiful traditional folk song.',
    isUnderDevelopment: true
  }
};

export const CULTURAL_TITLES = [
  "Street Trainee", "Street Pikin", "Senior Man", "Island Big Boy", "Compound Chief", "Naija Legend",
  "Street Legend", "Agba Gamer", "I Too Know", "Compound Boss", "Street King", "Area Master"
];

export const DAILY_QUESTS: DailyQuest[] = [
  { id: 'q1', title: 'Street Cred', description: 'Send 5 chat messages', type: 'DAILY', target: 5, rewardXP: 600, rewardCoins: 300, progress: 0, completed: false, claimed: false },
  { id: 'q2', title: 'Sharp Brain', description: 'Score 100 in NPAT', type: 'DAILY', target: 100, rewardXP: 1500, rewardCoins: 900, progress: 0, completed: false, claimed: false },
  { id: 'q3', title: 'Market Day', description: 'Buy any item', type: 'DAILY', target: 1, rewardXP: 600, rewardCoins: 300, progress: 0, completed: false, claimed: false }
];

export const RADIO_PLAYLIST = [
  { id: 't1', title: 'Whos Dat Girl (Instrumental)', artist: 'Ayra Starr & Rema', url: '/audio/Ayra-Starr-Rema-Whos-Dat-Girl-Instrumental-Beats.mp3' },
  { id: 't2', title: 'Love (Speed Up Instrumental)', artist: 'Burna Boy', url: '/audio/Burna-Boy-Love-speed-up-instrumental-beats-.mp3' },
  { id: 't3', title: 'With You (Instrumental)', artist: 'Davido ft. Omah Lay', url: '/audio/Davido-With-you-instrumental-Feat.-Omah-Lay-1.mp3' },
  { id: 't4', title: 'Calm Down (Instrumental)', artist: 'Rema', url: '/audio/Rema-Calm-Down-instrumental-beats.mp3' },
  { id: 't5', title: 'Fun (Instrumental)', artist: 'Rema', url: '/audio/Rema-Fun-Instrumental-Beats.mp3' },
  { id: 't6', title: 'Ozeba (Instrumental)', artist: 'Rema', url: '/audio/Rema-Ozeba-Instrumental-beats-.mp3' },
  { id: 't7', title: 'Getting Paid (Instrumental)', artist: 'Sarz ft. Asake & Wizkid', url: '/audio/Sarz-Getting-Paid-feat.-Asake-Wizkid-Skillibeng.mp3' }
];

export const CULTURAL_REACTIONS = [
  { id: 'chai', label: 'Chai!', icon: '😲' },
  { id: 'oshey', label: 'Oshey!', icon: '🔥' },
  { id: 'abeg', label: 'Abeg', icon: '🙏' },
  { id: 'oya', label: 'Oya!', icon: '🚀' }
];

export const VILLAGES: Village[] = [
  { id: 'v1', name: 'Lekki Lions', region: 'Lagos', memberCount: 1200, totalXP: 450000, rank: 1, icon: '🦁' },
  { id: 'v2', name: 'Abuja Eagles', region: 'FCT', memberCount: 950, totalXP: 380000, rank: 2, icon: '🦅' },
  { id: 'v3', name: 'Port Harcourt Sharks', region: 'Rivers', memberCount: 800, totalXP: 290000, rank: 3, icon: '🦈' }
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'ankara_stone', name: 'Ankara Stone', category: 'SKIN', price: 200, icon: '🪨', rarity: 'RARE' },
  { id: 'golden_agbada', name: 'Golden Agbada', category: 'OUTFIT', price: 1500, icon: '👘', rarity: 'LEGENDARY' },
  { id: 'poco_dance', name: 'Poco Legwork', category: 'EMOTE', price: 600, icon: '🕺', rarity: 'RARE' },
  { id: 'classic_theme', name: 'Classic Compound', category: 'THEME', price: 0, icon: '🏠', rarity: 'COMMON', value: 'classic' },
  { id: 'royal_theme', name: 'Royal Palace', category: 'THEME', price: 1000, icon: '🏰', rarity: 'LEGENDARY', value: 'royal' },
  // New Items
  { id: 'agba_agbada', name: "'Agba' Agbada", category: 'OUTFIT', price: 2500, icon: '👔', rarity: 'LEGENDARY' },
  { id: 'danfo_theme', name: "'Danfo' Yellow", category: 'THEME', price: 800, icon: '🚌', rarity: 'RARE', value: 'indigo' },
  { id: 'golden_biro', name: 'Golden Biro', category: 'SKIN', price: 500, icon: '🖊️', rarity: 'EPIC' },
  { id: 'i_too_know_title', name: "'I Too Know'", category: 'THEME', price: 300, icon: '🎓', rarity: 'RARE' },
  { id: 'slang_pack', name: 'Street Slang Pack', category: 'EMOTE', price: 400, icon: '🗣️', rarity: 'COMMON' },
  { id: 'ankara_shoes', name: 'Ankara High-Tops', category: 'SKIN', price: 750, icon: '👟', rarity: 'EPIC' },
  { id: 'jollof_red', name: 'Jollof Red Accent', category: 'THEME', price: 450, icon: '🍛', rarity: 'RARE' },
  { id: 'senior_aura', name: "'Senior Man' Aura", category: 'SKIN', price: 2000, icon: '✨', rarity: 'LEGENDARY' },
  { id: 'no_gree_badge', name: "'No Gree' Badge", category: 'EMOTE', price: 100, icon: '🛡️', rarity: 'COMMON' },
  { id: 'pocket_gen', name: 'Pocket Generator', category: 'SKIN', price: 1200, icon: '🔌', rarity: 'EPIC' },
  { id: 'street_legend_title', name: 'Street Legend', category: 'THEME', price: 3000, icon: '🏆', rarity: 'LEGENDARY' },
  { id: 'agba_gamer_title', name: 'Agba Gamer', category: 'THEME', price: 5000, icon: '👑', rarity: 'LEGENDARY' }
];

export const XP_PER_LEVEL = 1000;
