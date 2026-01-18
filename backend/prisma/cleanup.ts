import { PrismaClient } from '../src/generated/client/client.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("🔗 Connecting to:", process.env.DATABASE_URL);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanup() {
    console.log("🧹 Starting Street Cleanup...");

    try {
        // Truncate tables to remove all demo/mock accounts and match history
        await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE;`;
        await prisma.$executeRaw`TRUNCATE TABLE "Match" CASCADE;`;
        await prisma.$executeRaw`TRUNCATE TABLE "InventoryItem" CASCADE;`;

        console.log("✅ All demo data wiped. The Compound is fresh!");
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

cleanup();
