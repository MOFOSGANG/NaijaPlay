import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, User as UserIcon, ShoppingBag, LayoutDashboard,
  Settings as SettingsIcon, MessageCircle, Play, Users, ArrowLeft,
  Zap, Star, Shield, Music, Check, X, Send, Crown, Eye,
  Edit2, Construction, Sparkles, Volume2, Smartphone, Languages,
  Home, MapPin, SkipForward, PlayCircle, PauseCircle, Laugh, Target,
  LogOut, ShieldCheck, Search, Filter, Calendar, TrendingUp, ChevronRight
} from 'lucide-react';

import { useGameStore } from './store';
import { useMultiplayerStore } from './multiplayerStore';
import { GAMES_CONFIG, SHOP_ITEMS, RADIO_PLAYLIST, CULTURAL_REACTIONS, VILLAGES, XP_PER_LEVEL } from './constants';
import { GameType, AppView, GameStats } from './types';
import { connectSocket } from './socketService';

// Components
import ToastProvider, { useToasts } from './components/ToastProvider';
import ConnectionStatus from './components/ConnectionStatus';
import MatchmakingQueue from './components/MatchmakingQueue';
import { StreetGuide } from './components/StreetGuide';
import { CertificateGenerator } from './components/CertificateGenerator';
import LobbyBrowser from './components/LobbyBrowser';
import CreateRoomModal from './components/CreateRoomModal';
import SpectatorMode from './components/SpectatorMode';
import OnlinePlayersList from './components/OnlinePlayersList';
import ErrorBoundary from './components/ErrorBoundary';
import AuthModal from './components/AuthModal';
import RegionalWars from './components/RegionalWars';
import QuestBoard from './components/QuestBoard';
import SocialHub from './components/SocialHub';
import DailyRewardModal from './components/DailyRewardModal';

// --- THEME DEFINITIONS ---
const THEMES = {
  classic: { primary: '#008751', accent: '#00ff88', bg: '#0a0a0f', name: 'Classic Green' },
  indigo: { primary: '#1a237e', accent: '#3f51b5', bg: '#050510', name: 'Adire Indigo' },
  royal: { primary: '#8b0000', accent: '#ff4444', bg: '#0f0505', name: 'Royal Benin Red' },
};

// --- SHARED UI COMPONENTS ---

const AIBanter = () => {
  const banters = [
    "Oga, sharpen your brain! NPAT na for fast thinkers.",
    "The street no dey sleep, why you still dey wait?",
    "If you want to be Agba, you gbat to practice!",
    "Lagos vs Abuja, which side you belong?",
    "Street Pikin today, King of the Compound tomorrow!",
    "No let Danfo catch you for traffic, join the game!",
  ];

  const randomBanter = useMemo(() => banters[Math.floor(Math.random() * banters.length)], []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 max-w-sm mx-auto"
    >
      <div className="w-10 h-10 rounded-full bg-[#008751] flex items-center justify-center text-lg shadow-lg">🤖</div>
      <div className="text-left">
        <p className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest leading-none mb-1">Chidi AI (Pro Coach)</p>
        <p className="text-sm font-bold text-white/70 italic leading-tight">"{randomBanter}"</p>
      </div>
    </motion.div>
  );
};

const Background = () => {
  const activeThemeId = useGameStore((s) => s.user?.activeTheme) as keyof typeof THEMES;
  const theme = THEMES[activeThemeId] || THEMES.classic;

  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <div className="ankara-pattern" style={{ opacity: 0.05 }} />

      {/* Dynamic Time Overlays */}
      <AnimatePresence>
        {isNight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#050510]/60 z-[1]"
          />
        )}
      </AnimatePresence>

      <motion.div animate={{ x: [0, 50, 0], y: [0, 100, 0] }} transition={{ duration: 20, repeat: Infinity }} className="floating-orb w-[600px] h-[600px] top-[-200px] left-[-200px]" style={{ backgroundColor: `${theme.primary}20` }} />
      <motion.div animate={{ x: [0, -80, 0], y: [0, -50, 0] }} transition={{ duration: 25, repeat: Infinity }} className="floating-orb w-[500px] h-[500px] bottom-[-100px] right-[-100px]" style={{ backgroundColor: `${theme.accent}10` }} />

      {/* Street Lights Effect for Night */}
      {isNight && (
        <div className="absolute inset-0 z-[2]">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 blur-xl rounded-full animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-[#00ff88]/30 blur-2xl rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

const StreetLoader = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-[#0a0a0f] flex flex-col items-center justify-center p-10 overflow-hidden">
    <div className="ankara-pattern opacity-10" />
    <motion.div animate={{ x: [-500, 500] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-8xl mb-8 relative">
      🚌 <span className="absolute top-0 right-0 text-xl animate-bounce">DANFO</span>
    </motion.div>
    <h2 className="text-3xl font-black font-accent animate-pulse">NAIJA TRAFFIC DEY... HOLD ON!</h2>
    <p className="text-white/40 text-xs mt-2 uppercase tracking-widest">Digitalizing Heritage...</p>
  </motion.div>
);

const RadioPlayer = () => {
  const { settings, updateSettings } = useGameStore();
  const track = RADIO_PLAYLIST[settings.radioTrack];
  return (
    <div className="glass px-4 py-2 rounded-2xl flex items-center gap-4 border border-white/5">
      <div className="w-8 h-8 bg-[#00ff88]/20 rounded-lg flex items-center justify-center text-[#00ff88]">
        <Music size={16} className={settings.music ? 'animate-spin' : ''} />
      </div>
      <div className="hidden sm:block">
        <p className="text-[10px] font-black uppercase tracking-tighter truncate w-24">{track.title}</p>
        <p className="text-[8px] text-white/40 truncate w-24">{track.artist}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => updateSettings({ music: !settings.music })} className="text-white/60 hover:text-white transition-colors">
          {settings.music ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
        </button>
        <button onClick={() => updateSettings({ radioTrack: (settings.radioTrack + 1) % RADIO_PLAYLIST.length })} className="text-white/60 hover:text-white transition-colors">
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
};

const AICompanion = () => {
  const { aiBanter } = useGameStore();
  return (
    <AnimatePresence>
      {aiBanter.visible && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-24 right-6 z-[200] flex flex-col items-end">
          <div className="bg-white text-black p-4 rounded-3xl rounded-br-none shadow-2xl max-w-[200px] border-2 border-[#00ff88]">
            <p className="text-xs font-bold leading-tight">{aiBanter.text}</p>
          </div>
          <div className="w-16 h-16 bg-[#008751] rounded-full mt-4 border-4 border-[#00ff88] flex items-center justify-center text-3xl shadow-lg">👦</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Header = ({ isLoggedIn, setShowAuthModal }: { isLoggedIn: boolean; setShowAuthModal: (v: boolean) => void }) => {
  const { user, setView } = useGameStore();
  return (
    <header className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-black font-accent text-[#008751] tracking-tighter cursor-pointer" onClick={() => setView('LANDING')}>NAIJA PLAY</span>
        <RadioPlayer />
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn && user ? (
          <>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black text-[#00ff88] uppercase tracking-widest">{user.title}</span>
              <span className="text-xs font-bold">{user.username}</span>
            </div>
            <button
              onClick={() => setView('PROFILE')}
              className="w-10 h-10 rounded-full bg-[#008751] flex items-center justify-center border-2 border-[#00ff88]"
            >
              {user.avatar}
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2 bg-[#008751] rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

const VillageView = ({ hideTitle = false }: { hideTitle?: boolean }) => {
  const { user, joinVillage } = useGameStore();
  if (!user) return null;
  return (
    <div className="space-y-6">
      {!hideTitle && (
        <div className="text-center">
          <h2 className="text-4xl font-black font-accent">The Compound (Villages)</h2>
          <p className="text-white/40 text-sm">Join a village to dominate the regional boards.</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {VILLAGES.map(v => (
          <div key={v.id} className={`glass p-5 rounded-[30px] border transition-all ${user?.villageId === v.id ? 'border-[#00ff88] bg-[#00ff88]/5 scale-[1.02]' : 'border-white/5 opacity-80'}`}>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{v.icon}</div>
              <div className="flex-grow">
                <h3 className="text-lg font-black uppercase leading-none mb-1">{v.name}</h3>
                <p className="text-[8px] font-black text-white/40 uppercase">{v.region} Region • Rank #{v.rank}</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-black">{(v.totalXP / 1000).toFixed(1)}k</div>
                <div className="text-[8px] text-white/40 uppercase">XP</div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => joinVillage(v.id)}
                disabled={user.villageId === v.id}
                className={`flex-grow py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${user.villageId === v.id ? 'bg-white/5 text-white/20 cursor-default' : 'bg-[#008751] hover:scale-105 active:scale-95'}`}
              >
                {user.villageId === v.id ? 'YOUR COMPOUND' : 'JOIN VILLAGE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ onShowLobbies }: { onShowLobbies?: () => void }) => {
  const { user, setView, dailyQuests } = useGameStore();
  const { isConnected, onlinePlayerCount, joinQueue } = useMultiplayerStore();

  if (!user) return null;

  const handleQuickPlay = (gameId: GameType) => {
    if (gameId === 'NPAT') {
      joinQueue('NPAT');
    } else {
      setView('GAME_PLAY', gameId);
    }
  };
  return (
    <div className="p-6 pb-24 max-w-5xl mx-auto space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section className="glass p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent" />
            <div className="w-24 h-24 bg-white/5 rounded-[35px] border-4 border-[#00ff88] flex items-center justify-center text-6xl shadow-2xl">{user.avatar}</div>
            <div className="flex-grow text-center md:text-left">
              <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em] mb-1 block">{user.title}</span>
              <h2 className="text-4xl font-black font-accent leading-none mb-3">{user.username}</h2>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex-grow max-w-[200px] h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(user.xp / XP_PER_LEVEL) * 100}%` }} className="h-full bg-[#00ff88]" />
                </div>
                <span className="text-[10px] font-black opacity-40">LVL {user.level}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              <div className="flex flex-col items-center justify-center glass px-4 py-2 rounded-2xl border border-white/5 min-w-[80px]">
                <div className={`w-2 h-2 rounded-full mb-1 ${isConnected ? 'bg-[#00ff88] animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[8px] font-black uppercase text-white/40">{isConnected ? 'Online' : 'Offline'}</span>
              </div>
              {/* Villages removed for future update */}
              <button onClick={() => setView('MARKET')} className="glass p-4 rounded-3xl border border-white/5 hover:bg-white/10 transition-all flex flex-col items-center gap-1 min-w-[80px]">
                <ShoppingBag size={20} className="text-[#FFA500]" />
                <span className="text-[9px] font-black uppercase">Market</span>
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.values(GAMES_CONFIG).map((game) => (
              <motion.div key={game.id} whileHover={{ y: -8 }} className="glass p-8 rounded-[40px] border border-white/10 group cursor-pointer relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} opacity-10 blur-[50px] pointer-events-none`} />
                <div className="flex items-center gap-6 mb-6">
                  <div className={`w-20 h-20 ${game.color} rounded-3xl flex items-center justify-center text-5xl relative`}>
                    {game.icon}
                    {game.isUnderDevelopment && <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center"><Construction size={32} className="text-orange-500" /></div>}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">{game.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{game.difficulty} DIFF</span>
                      {!game.isUnderDevelopment && (
                        <span className="text-[10px] font-black uppercase text-[#00ff88] flex items-center gap-1">
                          <div className="w-1 h-1 bg-[#00ff88] rounded-full animate-pulse" />
                          Multiplayer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleQuickPlay(game.id)} className={`w-full py-4 rounded-2xl font-black text-sm text-white ${game.isUnderDevelopment ? 'bg-orange-600/80' : game.color}`}>{game.isUnderDevelopment ? 'COMING SOON' : 'PLAY NOW'}</button>
              </motion.div>
            ))}
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass p-6 rounded-[40px] border border-white/5">
            <h3 className="text-xl font-black font-accent uppercase mb-4 flex items-center gap-2"><MapPin size={18} className="text-[#00ff88]" /> Daily Quests</h3>
            <div className="space-y-4">
              {dailyQuests.map(q => (
                <div key={q.id} className={`p-4 rounded-3xl bg-white/5 border border-white/5 transition-opacity ${q.completed ? 'opacity-40' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-black uppercase">{q.title}</p>
                    {q.completed ? <Check size={14} className="text-[#00ff88]" /> : <span className="text-[9px] font-black text-[#FFA500]">+{q.rewardCoins}C</span>}
                  </div>
                  <p className="text-[10px] text-white/40 mb-3">{q.description}</p>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00ff88]" style={{ width: `${(q.progress / q.target) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ isLoggedIn, setShowAuthModal }: { isLoggedIn: boolean; setShowAuthModal: (v: boolean) => void }) => {
  const { setView, setLoading } = useGameStore();
  const handleStart = () => {
    if (isLoggedIn) {
      setView('DASHBOARD');
    } else {
      setShowAuthModal(true);
    }
  };
  return (
    <div className="flex flex-col items-center pt-20 pb-40 px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative mb-12">
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl animate-bounce">🇳🇬</span>
        <h1 className="text-7xl md:text-9xl font-black font-accent text-white leading-none tracking-tighter mb-4">NAIJA PLAY</h1>
        <div className="bg-[#FFA500] text-black px-4 py-1 rounded-full font-black text-xs inline-block rotate-[-2deg]">DIGITALIZING HERITAGE 🔥</div>
      </motion.div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
        {isLoggedIn ? (
          <button onClick={() => setView('DASHBOARD')} className="px-12 py-6 bg-[#008751] rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-green-900/40">
            Oya! Enter Compound
          </button>
        ) : (
          <>
            <button onClick={() => setShowAuthModal(true)} className="px-12 py-6 bg-[#008751] rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-green-900/40">
              Join the Street
            </button>
            <button onClick={() => setShowAuthModal(true)} className="px-12 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-xl hover:bg-white/10 transition-all">
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Market = () => {
  const { user, buyItem } = useGameStore();

  if (!user) return null;
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'SKIN' | 'OUTFIT' | 'EMOTE' | 'THEME'>('ALL');

  const filteredItems = SHOP_ITEMS.filter(item =>
    activeCategory === 'ALL' || item.category === activeCategory
  );

  const rarityColors = {
    COMMON: 'border-white/10 text-white/40 bg-white/5',
    RARE: 'border-blue-500/30 text-blue-400 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    LEGENDARY: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.2)]',
  };

  const categories = [
    { id: 'ALL', label: 'All Items' },
    { id: 'SKIN', label: 'Skins' },
    { id: 'OUTFIT', label: 'Outfits' },
    { id: 'EMOTE', label: 'Emotes' },
    { id: 'THEME', label: 'Themes' },
  ];

  return (
    <div className="p-6 pb-32 max-w-5xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-black/20 p-8 rounded-[45px] border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#008751]/10 blur-[100px] -z-1" />
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black font-accent leading-none">THE MARKET</h2>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mt-2">Premium Street Gear</p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 px-8 py-4 rounded-3xl border border-white/5 shadow-inner">
          <div className="w-10 h-10 bg-[#FFA500]/20 rounded-xl flex items-center justify-center text-[#FFA500]">
            <Zap size={24} fill="#FFA500" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tabular-nums leading-none">{user.coins.toLocaleString()}</span>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Available Coins</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id
              ? 'bg-[#008751] text-white border-[#00ff88]/20 shadow-lg scale-105'
              : 'bg-white/5 text-white/30 border-white/5 hover:border-white/10 hover:bg-white/10'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const isOwned = user.inventory.includes(item.id);
            const style = rarityColors[item.rarity];

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className={`glass p-8 rounded-[45px] flex flex-col items-center text-center border-2 transition-all group relative overflow-hidden ${style}`}
              >
                {item.rarity === 'LEGENDARY' && (
                  <div className="absolute -top-4 -right-4 bg-yellow-500 text-black px-6 py-2 rotate-12 font-black text-[8px] uppercase tracking-tighter shadow-xl">LEGENDARY</div>
                )}

                <div className="text-8xl mb-6 group-hover:scale-110 transition-transform drop-shadow-2xl">
                  {item.icon}
                </div>

                <div className="space-y-1 mb-8 flex-grow">
                  <h4 className="text-xl font-black uppercase tracking-tight leading-none">{item.name}</h4>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">{item.category} • {item.rarity}</p>
                </div>

                <button
                  onClick={() => !isOwned && buyItem(item.id, item.price)}
                  className={`w-full py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isOwned
                    ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                    : 'bg-[#008751] text-white shadow-xl hover:bg-[#00ff88]/80 hover:text-black'
                    }`}
                >
                  {isOwned ? (
                    <>
                      <Check size={14} />
                      OWNED
                    </>
                  ) : (
                    <>
                      {item.price > 0 && <Zap size={10} fill="currentColor" />}
                      {item.price > 0 ? `${item.price.toLocaleString()}` : 'FREE'}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, updateProfile, logout } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');

  if (!user) return null;

  const totalGamesPlayed = Object.values(user.stats).reduce((acc, s) => acc + s.played, 0);
  const totalWins = Object.values(user.stats).reduce((acc, s) => acc + s.wins, 0);
  const winRate = totalGamesPlayed > 0 ? Math.round((totalWins / totalGamesPlayed) * 100) : 0;

  const handleSave = () => {
    updateProfile({ username: editUsername, bio: editBio });
    setIsEditing(false);
  };

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="glass p-8 rounded-[50px] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#008751]/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-[#008751]/20 to-[#00ff88]/10 rounded-[45px] border-4 border-[#00ff88] flex items-center justify-center text-7xl shadow-[0_0_40px_rgba(0,255,136,0.2)]">
              {user.avatar}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#008751] rounded-xl flex items-center justify-center text-white font-black text-sm border-2 border-[#00ff88]">
              {user.level}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow text-center md:text-left space-y-3">
            {isEditing ? (
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-2xl font-black outline-none focus:border-[#00ff88]"
              />
            ) : (
              <h2 className="text-4xl font-black font-accent leading-none">{user.username}</h2>
            )}
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Crown size={14} className="text-[#FFA500]" />
              <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em]">{user.title}</span>
            </div>

            {/* XP Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-grow max-w-[250px] h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.xp / XP_PER_LEVEL) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#008751] to-[#00ff88]"
                />
              </div>
              <span className="text-[10px] font-black opacity-40">{user.xp}/{XP_PER_LEVEL} XP</span>
            </div>

            {/* Bio */}
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#00ff88] resize-none h-20"
                placeholder="Tell the street about yourself..."
              />
            ) : (
              <p className="text-white/50 text-sm italic">"{user.bio}"</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`p-4 rounded-2xl font-black text-xs uppercase flex items-center gap-2 transition-all ${isEditing ? 'bg-[#00ff88] text-black' : 'glass border border-white/10 hover:bg-white/10'
                }`}
            >
              {isEditing ? <><Check size={16} /> Save</> : <><Edit2 size={16} /> Edit</>}
            </button>
            <button
              onClick={() => logout()}
              className="p-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all border border-red-500/10"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Street Cred Certificate */}
      <div className="glass p-8 rounded-[40px] border border-white/10 bg-[#008751]/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black font-accent">STREET CRED</h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Official Status Certificate</p>
          </div>
          <div className="w-12 h-12 bg-[#00ff88]/20 rounded-2xl flex items-center justify-center text-2xl">📜</div>
        </div>
        <CertificateGenerator />
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-black font-accent px-2 flex items-center gap-2">
          <Trophy className="text-[#FFA500]" size={20} /> BADGES OF THE STREET
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user.achievements.map((achievement: any) => (
            <div key={achievement.id} className="glass p-6 rounded-[35px] border border-white/10 flex flex-col items-center gap-3 relative group">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {achievement.icon || '🏅'}
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest">{achievement.title}</p>
                <p className="text-[8px] font-bold text-white/40 mt-1 uppercase">{achievement.description}</p>
              </div>
              <div className="absolute top-2 right-2">
                <Check size={12} className="text-[#00ff88]" />
              </div>
            </div>
          ))}
          {user.achievements.length === 0 && (
            <div className="col-span-full py-12 text-center text-white/20 font-black uppercase tracking-[0.2em]">
              No badges yet. Keep hustling! 🏾🔥
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-[30px] border border-white/10 text-center">
          <div className="text-3xl font-black text-[#FFA500]">{user.coins.toLocaleString()}</div>
          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Coins</div>
        </div>
        <div className="glass p-6 rounded-[30px] border border-white/10 text-center">
          <div className="text-3xl font-black text-[#00ff88]">{totalGamesPlayed}</div>
          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Games Played</div>
        </div>
        <div className="glass p-6 rounded-[30px] border border-white/10 text-center">
          <div className="text-3xl font-black text-yellow-400">{totalWins}</div>
          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Victories</div>
        </div>
        <div className="glass p-6 rounded-[30px] border border-white/10 text-center">
          <div className="text-3xl font-black text-purple-400">{winRate}%</div>
          <div className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">Win Rate</div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="glass p-6 rounded-[40px] border border-white/10">
        <h3 className="text-xl font-black font-accent uppercase mb-6 flex items-center gap-2">
          <Trophy size={18} className="text-[#FFA500]" /> Game Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(GAMES_CONFIG).map(([id, game]) => {
            const stats = user.stats[id as GameType];
            return (
              <div key={id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className={`w-12 h-12 ${game.color} rounded-xl flex items-center justify-center text-2xl`}>
                  {game.icon}
                </div>
                <div className="flex-grow">
                  <h4 className="font-black text-sm">{game.title}</h4>
                  <p className="text-[10px] text-white/40">
                    {stats.wins}W / {stats.losses}L • High: {stats.highScore}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#00ff88]">{stats.played}</div>
                  <div className="text-[8px] text-white/40 uppercase">Played</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory */}
      <div className="glass p-6 rounded-[40px] border border-white/10">
        <h3 className="text-xl font-black font-accent uppercase mb-6 flex items-center gap-2">
          <ShoppingBag size={18} className="text-[#FFA500]" /> My Collection ({user.inventory.length} items)
        </h3>
        <div className="flex flex-wrap gap-3">
          {user.inventory.length > 0 ? (
            SHOP_ITEMS.filter(item => user.inventory.includes(item.id)).map(item => (
              <div key={item.id} className="glass px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-black">{item.name}</p>
                  <p className="text-[8px] text-white/40 uppercase">{item.rarity}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/40 text-sm">No items yet. Visit the Market to get drip! 🛒</p>
          )}
        </div>
      </div>

      {/* Theme Selector */}
      <div className="glass p-6 rounded-[40px] border border-white/10">
        <h3 className="text-xl font-black font-accent uppercase mb-6 flex items-center gap-2">
          <Sparkles size={18} className="text-[#FFA500]" /> Compound Theme
        </h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(THEMES).map(([id, t]) => (
            <button
              key={id}
              onClick={() => updateProfile({ activeTheme: id })}
              className={`px-6 py-4 glass rounded-2xl border transition-all flex items-center gap-3 ${user.activeTheme === id
                ? 'border-[#00ff88] bg-[#00ff88]/10 scale-105'
                : 'border-white/10 hover:border-white/20'
                }`}
            >
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: t.primary }} />
              <span className="text-xs font-black uppercase" style={{ color: t.accent }}>{t.name}</span>
              {user.activeTheme === id && <Check size={14} className="text-[#00ff88]" />}
            </button>
          ))}
        </div>
      </div>
    </div >
  );
};

const GamePlay = () => {
  const { activeGameId, setView, updateStats, addXP, addCoins, sendMessage, triggerAIBanter } = useGameStore();
  const { currentRoom, leaveRoom } = useMultiplayerStore();
  const game = GAMES_CONFIG[activeGameId as keyof typeof GAMES_CONFIG];
  const [gameState, setGameState] = useState<'IDLE' | 'SPINNING' | 'PLAYING' | 'VALIDATING' | 'RESULT'>('IDLE');
  const [timer, setTimer] = useState(60);
  const [letter, setLetter] = useState('A');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({ name: '', place: '', animal: '', thing: '' });
  const [validationResults, setValidationResults] = useState<Record<string, boolean>>({});
  const [earnedXP, setEarnedXP] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const categories = ['name', 'place', 'animal', 'thing'] as const;

  // Real-time synchronization for Multiplayer
  useEffect(() => {
    if (currentRoom) {
      const socket = connectSocket();

      socket.on('game_started', (data: { letter: string; timer: number }) => {
        setLetter(data.letter);
        setTimer(data.timer);
        setGameState('PLAYING');
      });

      socket.on('timer_update', (t: number) => setTimer(t));

      socket.on('game_over', (data: { message: string }) => {
        handleSubmit();
      });

      // Auto-start if it's a matched room
      if (currentRoom.status === 'WAITING') {
        socket.emit('start_game', { roomId: currentRoom.id, stake: currentRoom.stake });
      }
    }
  }, [currentRoom]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameState === 'PLAYING' && timer > 0 && !currentRoom) {
      // Only run local timer if NOT in a multiplayer room (server handles it there)
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (gameState === 'PLAYING' && timer === 0 && !currentRoom) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [gameState, timer, currentRoom]);

  const handleStart = () => {
    setGameState('SPINNING');
    setAnswers({ name: '', place: '', animal: '', thing: '' });
    setValidationResults({});
    setTimeout(() => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const newLetter = letters[Math.floor(Math.random() * letters.length)];
      setLetter(newLetter);
      setTimer(60);
      setGameState('PLAYING');
      triggerAIBanter(`New NPAT round starting with letter ${newLetter}! Time to show sharpness!`);
    }, 2000);
  };

  const handleInputChange = (category: keyof typeof answers, value: string) => {
    setAnswers(prev => ({ ...prev, [category]: value }));
  };

  const validateAnswer = (answer: string, category: string): boolean => {
    const trimmed = answer.trim().toLowerCase();
    if (!trimmed) return false;
    if (!trimmed.startsWith(letter.toLowerCase())) return false;
    if (trimmed.length < 2) return false;
    return true;
  };

  const handleSubmit = () => {
    setGameState('VALIDATING');

    // Validate each answer
    const results: Record<string, boolean> = {};
    let validCount = 0;

    categories.forEach(cat => {
      const isValid = validateAnswer(answers[cat], cat);
      results[cat] = isValid;
      if (isValid) validCount++;
    });

    setValidationResults(results);

    // Calculate score
    const basePoints = validCount * 25;
    const timeBonus = Math.floor(timer / 10) * 5;
    const totalScore = basePoints + timeBonus;
    const xpEarned = 100 + (validCount * 75) + (validCount === 4 ? 100 : 0);
    const coinsEarned = 20 + (validCount * 20) + (validCount === 4 ? 50 : 0);

    setScore(totalScore);
    setEarnedXP(xpEarned);
    setEarnedCoins(coinsEarned);

    setTimeout(() => {
      setGameState('RESULT');
      updateStats(activeGameId as GameType, validCount >= 2 ? 'WIN' : 'LOSS', totalScore);
      addXP(xpEarned);
      addCoins(coinsEarned);

      if (validCount === 4) {
        triggerAIBanter('OSHEY! Perfect round! You too sharp! 🔥');
      } else if (validCount >= 2) {
        triggerAIBanter('Not bad! Keep grinding, champion!');
      }
    }, 1500);
  };

  if (!game) return null;

  if (game.isUnderDevelopment) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0a0a0f] flex items-center justify-center p-6">
        <Background />
        <div className="glass p-12 rounded-[50px] text-center max-w-md space-y-8 border-2 border-orange-500/30">
          <div className="w-24 h-24 bg-orange-500/10 rounded-full mx-auto flex items-center justify-center text-6xl border-2 border-orange-500/20">🚧</div>
          <h2 className="text-4xl font-black font-accent uppercase leading-none">OGA, HOLD ON!</h2>
          <p className="text-white/60">We still dey "cook" this <span className="text-orange-500 font-black">{game.title}</span> game. E go soon ready!</p>
          <button onClick={() => setView('DASHBOARD')} className="w-full py-5 bg-[#008751] text-white rounded-[25px] font-black uppercase tracking-widest hover:scale-105 transition-all">Back to Compound</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0f] overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button onClick={() => setView('DASHBOARD')} className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            {CULTURAL_REACTIONS.map(r => (
              <button key={r.id} onClick={() => sendMessage(`REACTED: ${r.icon} ${r.label}`)} className="p-3 glass rounded-2xl hover:bg-white/10 transition-all">{r.icon}</button>
            ))}
          </div>
          <div className={`w-14 h-14 glass rounded-full flex items-center justify-center font-black text-xl ${timer <= 10 && gameState === 'PLAYING' ? 'text-red-500 animate-pulse' : ''}`}>
            {gameState === 'PLAYING' ? timer : '--'}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* IDLE State */}
          {gameState === 'IDLE' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass p-10 rounded-[50px] text-center space-y-8">
              <div className={`w-32 h-32 ${game.color} rounded-[40px] mx-auto flex items-center justify-center text-7xl shadow-2xl`}>{game.icon}</div>
              <div>
                <h3 className="text-3xl font-black font-accent">{game.title}</h3>
                <p className="text-white/40 text-sm mt-2">{game.description}</p>
              </div>
              <div className="glass p-4 rounded-2xl text-left space-y-2">
                <h4 className="text-xs font-black uppercase text-[#00ff88]">How to Play:</h4>
                <p className="text-[11px] text-white/60">1. A random letter will be revealed</p>
                <p className="text-[11px] text-white/60">2. Fill in a Name, Place, Animal & Thing starting with that letter</p>
                <p className="text-[11px] text-white/60">3. Submit before the timer runs out!</p>
                <p className="text-[11px] text-white/60">4. Win massive XP & Coins based on your sharpness!</p>
              </div>
              <button onClick={handleStart} className={`w-full py-5 rounded-2xl font-black text-xl text-white ${game.color} shadow-lg hover:scale-105 transition-all`}>
                START GAME 🎮
              </button>
            </motion.div>
          )}

          {/* SPINNING State */}
          {gameState === 'SPINNING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <motion.div
                animate={{ rotate: 360 * 5, scale: [1, 1.2, 1] }}
                transition={{ duration: 2, ease: "circOut" }}
                className="text-9xl font-black text-[#00ff88] font-accent"
              >
                ?
              </motion.div>
              <p className="text-white/40 font-black uppercase tracking-widest mt-4">Spinning Alphabet Wheel...</p>
            </motion.div>
          )}

          {/* PLAYING State */}
          {gameState === 'PLAYING' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              {/* Letter Display */}
              <div className="text-center">
                <div className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Your Letter</div>
                <div className="text-9xl font-black text-[#00ff88] font-accent drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">{letter}</div>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center gap-2">
                {categories.map(cat => (
                  <div
                    key={cat}
                    className={`w-3 h-3 rounded-full transition-all ${answers[cat].trim() ? 'bg-[#00ff88] scale-125' : 'bg-white/10'}`}
                  />
                ))}
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat} className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 ml-4 flex items-center gap-2">
                      {cat}
                      {answers[cat].trim() && answers[cat].toLowerCase().startsWith(letter.toLowerCase()) && (
                        <Check size={12} className="text-[#00ff88]" />
                      )}
                    </label>
                    <input
                      type="text"
                      value={answers[cat]}
                      onChange={(e) => handleInputChange(cat, e.target.value)}
                      placeholder={`Enter ${cat} starting with ${letter}...`}
                      className={`w-full bg-white/5 border-2 rounded-2xl px-6 py-4 text-white font-bold outline-none transition-all ${answers[cat].trim() && answers[cat].toLowerCase().startsWith(letter.toLowerCase())
                        ? 'border-[#00ff88]/50 bg-[#00ff88]/5'
                        : 'border-white/10 focus:border-[#00ff88]'
                        }`}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className={`w-full py-5 rounded-2xl font-black text-xl text-white ${game.color} shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-3`}
              >
                SUBMIT ANSWERS ✓
              </button>
            </motion.div>
          )}

          {/* VALIDATING State */}
          {gameState === 'VALIDATING' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20 space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full mx-auto"
              />
              <p className="text-white/60 font-black uppercase tracking-widest">Checking Answers...</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.3 }}
                    className={`p-4 rounded-2xl border ${validationResults[cat] !== undefined
                      ? validationResults[cat] ? 'bg-[#00ff88]/10 border-[#00ff88]' : 'bg-red-500/10 border-red-500'
                      : 'bg-white/5 border-white/10'}`}
                  >
                    <p className="text-xs font-black uppercase">{cat}</p>
                    {validationResults[cat] !== undefined && (
                      validationResults[cat] ? <Check size={16} className="text-[#00ff88] mx-auto mt-1" /> : <X size={16} className="text-red-500 mx-auto mt-1" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* RESULT State */}
          {gameState === 'RESULT' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-[50px] text-center space-y-8">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full mx-auto flex items-center justify-center text-5xl border-2 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                {Object.values(validationResults).filter(Boolean).length >= 2 ? '🏆' : '💪'}
              </div>
              <h3 className="text-4xl font-black font-accent">
                {Object.values(validationResults).filter(Boolean).length === 4 ? 'PERFECT! 🔥' :
                  Object.values(validationResults).filter(Boolean).length >= 2 ? 'OSHEY! 🎉' : 'Keep Grinding! 💪'}
              </h3>

              {/* Answer Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-left">
                {categories.map(cat => (
                  <div key={cat} className={`p-4 rounded-2xl border ${validationResults[cat] ? 'bg-[#00ff88]/5 border-[#00ff88]/30' : 'bg-red-500/5 border-red-500/30'}`}>
                    <p className="text-[9px] font-black uppercase text-white/40">{cat}</p>
                    <p className="text-sm font-bold truncate">{answers[cat] || '(empty)'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {validationResults[cat] ? (
                        <><Check size={12} className="text-[#00ff88]" /><span className="text-[10px] text-[#00ff88]">+25</span></>
                      ) : (
                        <><X size={12} className="text-red-500" /><span className="text-[10px] text-red-500">+0</span></>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-[#00ff88]">{score}</div>
                  <div className="text-[8px] font-black uppercase text-white/40">Total Score</div>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-[#FFA500]">+{earnedXP}</div>
                  <div className="text-[8px] font-black uppercase text-white/40">XP Earned</div>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-black text-yellow-400">+{earnedCoins}</div>
                  <div className="text-[8px] font-black uppercase text-white/40">Coins</div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl mb-8">
                <div className="text-center mb-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#00ff88]">Vibe Check Passed!</h4>
                  <p className="text-[10px] text-white/40">Share your win with the street</p>
                </div>
                <CertificateGenerator type="WIN" />
              </div>

              <button onClick={handleStart} className={`w-full py-5 rounded-2xl font-black text-xl text-white ${game.color} shadow-lg hover:scale-105 transition-all`}>
                PLAY AGAIN 🔄
              </button>
              <button onClick={() => setView('DASHBOARD')} className="w-full py-4 rounded-2xl bg-white/5 text-white font-black text-sm border border-white/10 hover:bg-white/10 transition-all">
                BACK TO COMPOUND
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Fix: Defined the BottomNav component
const BottomNav = () => {
  const { currentView, setView } = useGameStore();

  const navItems = [
    { id: 'DASHBOARD' as AppView, icon: <LayoutDashboard size={20} />, label: 'Compound' },
    { id: 'QUESTS' as AppView, icon: <Target size={20} />, label: 'Hustle' },
    { id: 'SOCIAL' as AppView, icon: <MessageCircle size={20} />, label: 'Hub' },
    { id: 'MARKET' as AppView, icon: <ShoppingBag size={20} />, label: 'Market' },
    { id: 'VILLAGES' as AppView, icon: <Home size={20} />, label: 'Villages' },
    { id: 'PROFILE' as AppView, icon: <UserIcon size={20} />, label: 'You' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-4 rounded-[35px] border border-white/10 flex items-center gap-2 md:gap-8 shadow-2xl">
      {navItems.filter(i => i.id !== 'VILLAGES').map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${currentView === item.id ? 'bg-[#008751] text-white scale-110' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
        >
          {item.icon}
          <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const AppContent = () => {
  const {
    currentView, isLoading, setView, user, updateProfile,
    completeOnboarding, settings, updateSettings, checkAuth, logout
  } = useGameStore();
  const { connect, isConnected, queue, leaveQueue, currentRoom, leaveRoom, joinRoom } = useMultiplayerStore();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [spectatingRoomId, setSpectatingRoomId] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { addToast } = useToasts();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && user.id) {
      connect(user.id);
    }
  }, [user?.id, connect]);

  // Force Landing if not logged in and trying to access protected views
  useEffect(() => {
    if (!isLoggedIn && currentView !== 'LANDING') {
      setView('LANDING');
    }
  }, [isLoggedIn, currentView, setView]);

  // Update Source when track changes
  useEffect(() => {
    if (audioRef.current) {
      const track = RADIO_PLAYLIST[settings.radioTrack];
      if (track && track.url) {
        audioRef.current.src = track.url;
        if (settings.music) {
          audioRef.current.play().catch(e => console.log('Audio Autoplay Blocked:', e));
        }
      }
    }
  }, [settings.radioTrack]);

  // Toggle Play/Pause when music setting changes
  useEffect(() => {
    if (audioRef.current) {
      if (settings.music) {
        audioRef.current.play().catch(e => console.log('Audio Autoplay Blocked:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [settings.music]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user.id);
    socket.on('achievements_unlocked', (newUnlocks: any[]) => {
      newUnlocks.forEach(ach => {
        addToast(`${ach.title} Unlocked! 🏆`, 'success');
        // Play sound
        import('./soundService.js').then(s => s.playSound('QUEST'));
      });
    });
    return () => {
      socket.off('achievements_unlocked');
    };
  }, [user?.id, addToast]);

  const [dailyRewardData, setDailyRewardData] = useState<any>(null);

  const handleInteraction = () => {
    if (audioRef.current && settings.music && audioRef.current.paused) {
      audioRef.current.play().catch(e => console.log('Audio Autoplay Blocked:', e));
    }
  };

  useEffect(() => {
    if (user && user.id && currentView === 'DASHBOARD') {
      const { claimDailyReward } = useGameStore.getState();
      claimDailyReward().then(data => {
        if (data && data.claimed) {
          setDailyRewardData(data);
        }
      });
    }
  }, [user?.id, currentView]);

  return (
    <div className="min-h-screen relative" onClick={handleInteraction}>
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onEnded={() => {
          const nextTrack = Math.floor(Math.random() * RADIO_PLAYLIST.length);
          updateSettings({ radioTrack: nextTrack });
        }}
      />
      <Background />
      <Header isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} />
      <AICompanion />
      <ConnectionStatus />

      <AnimatePresence>{isLoading && <StreetLoader />}</AnimatePresence>
      <AnimatePresence>
        {dailyRewardData && (
          <DailyRewardModal
            data={dailyRewardData}
            onClose={() => setDailyRewardData(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {user && !user.hasCompletedOnboarding && currentView === 'DASHBOARD' && !isLoading && (
          <StreetGuide onClose={() => completeOnboarding()} />
        )}
      </AnimatePresence>

      {/* Global Multiplayer Overlays */}
      <AnimatePresence>
        {queue.isInQueue && (
          <MatchmakingQueue
            gameType={queue.gameType}
            gameName={GAMES_CONFIG[queue.gameType as keyof typeof GAMES_CONFIG]?.title || 'Game'}
            gameIcon={GAMES_CONFIG[queue.gameType as keyof typeof GAMES_CONFIG]?.icon || '🎮'}
            onClose={() => leaveQueue()}
          />
        )}

        {showCreateRoom && (
          <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
        )}

        {spectatingRoomId && (
          <SpectatorMode
            roomId={spectatingRoomId}
            onLeave={() => setSpectatingRoomId(null)}
          />
        )}
      </AnimatePresence>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={currentView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {currentView === 'LANDING' && <LandingPage isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} />}
            {currentView === 'DASHBOARD' && <Dashboard onShowLobbies={() => setView('VILLAGES')} />}
            {currentView === 'PROFILE' && <ProfilePage />}
            {currentView === 'MARKET' && <Market />}
            {currentView === 'SOCIAL' && <SocialHub />}
            {currentView === 'QUESTS' && (
              <div className="p-6 pb-32 max-w-2xl mx-auto space-y-6">
                <QuestBoard />
              </div>
            )}
            {/* We'll repurpose Villages view for now to show Lobbies or combine them */}
            {currentView === 'VILLAGES' && (
              <div className="p-6 pb-32 max-w-5xl mx-auto space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-10">
                    <header className="mb-8">
                      <h2 className="text-5xl font-black font-accent text-white tracking-tight">Game Lobbies</h2>
                      <p className="text-white/40 text-sm mt-2">Join a room or create your own to dominate the street.</p>
                    </header>
                    <LobbyBrowser
                      onJoinRoom={(id) => joinRoom(id)}
                      onCreateRoom={() => setShowCreateRoom(true)}
                      onSpectate={(id) => setSpectatingRoomId(id)}
                    />

                    {/* Regional Wars (Disabled for future update) */}
                    {/* <RegionalWars /> */}
                  </div>
                  <div className="space-y-10 lg:sticky lg:top-24">
                    <OnlinePlayersList players={[]} />
                    <div className="space-y-4">
                      <h3 className="text-xl font-black font-accent px-2">Top Villages</h3>
                      <VillageView hideTitle={true} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentView === 'GAME_PLAY' && <GamePlay />}
          </motion.div>
        </AnimatePresence>
      </main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData) => {
          updateProfile(userData);
          setView('DASHBOARD');
        }}
      />
      {currentView !== 'LANDING' && currentView !== 'GAME_PLAY' && <BottomNav />}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </ErrorBoundary>
);

export default App;
