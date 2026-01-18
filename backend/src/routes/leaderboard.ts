import { Router } from 'express';
import * as leaderboardService from '../services/leaderboardService.js';

const router = Router();

// --- User Leaderboards ---

router.get('/users/global', async (req, res) => {
    try {
        const users = await leaderboardService.getGlobalUserLeaderboard();
        res.json(users);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to load global rankings" });
    }
});

router.get('/users/regional/:region', async (req, res) => {
    const { region } = req.params;
    if (!region || typeof region !== 'string') return res.status(400).json({ error: "Region required" });
    try {
        const users = await leaderboardService.getRegionalUserLeaderboard(region);
        res.json(users);
    } catch (e: any) {
        res.status(500).json({ error: `Failed to load rankings for ${req.params.region}` });
    }
});

// --- Village Leaderboards ---

router.get('/villages/global', async (req, res) => {
    try {
        const villages = await leaderboardService.getVillageLeaderboard();
        res.json(villages);
    } catch (e: any) {
        res.status(500).json({ error: "Failed to load global village rankings" });
    }
});

router.get('/villages/regional/:region', async (req, res) => {
    const { region } = req.params;
    if (!region || typeof region !== 'string') return res.status(400).json({ error: "Region required" });
    try {
        const villages = await leaderboardService.getRegionalVillageLeaderboard(region);
        res.json(villages);
    } catch (e: any) {
        res.status(500).json({ error: `Failed to load village rankings for ${req.params.region}` });
    }
});

export default router;
