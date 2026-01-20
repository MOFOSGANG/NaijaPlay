# Redis Setup for NaijaPlay Production

## Issue
The backend is currently configured with `REDIS_URL="redis://localhost:6379"` which won't work in production (Render deployment).

## Solutions

### Option 1: Use Render's Redis Service (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create a new **Redis** instance
3. Copy the **Internal Redis URL** (starts with `redis://red-...`)
4. Add it to your Render environment variables as `REDIS_URL`

### Option 2: Use Upstash (Free Tier Available)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the connection string
4. Add it to your Render environment variables

### Option 3: Make Redis Optional (Temporary Fix)
The code already handles Redis being unavailable gracefully - matchmaking will work in-memory but rooms won't persist across server restarts.

## Current Status
- ✅ Code supports Redis being optional
- ⚠️ Production deployment needs Redis URL configured
- 🔧 Matchmaking improvements added (timeouts, better queue management)
