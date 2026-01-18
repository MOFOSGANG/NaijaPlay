import { PrismaClient } from '../src/generated/client/client.js';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding the Street... 🌳");

    // Create Villages
    const villages = [
        { name: 'Lekki Lions', region: 'Lagos', icon: '🦁' },
        { name: 'Abuja Eagles', region: 'FCT', icon: '🦅' },
        { name: 'PH Sharks', region: 'Rivers', icon: '🦈' },
    ];

    for (const v of villages) {
        await prisma.village.upsert({
            where: { name: v.name },
            update: {},
            create: v,
        });
    }

    // Create Shop Items
    const items = [
        { name: 'Ankara Stone', category: 'SKIN', price: 200, icon: '🪨', rarity: 'RARE' },
        { name: 'Golden Agbada', category: 'OUTFIT', price: 1500, icon: '👘', rarity: 'LEGENDARY' },
        { name: 'Poco Legwork', category: 'EMOTE', price: 600, icon: '🕺', rarity: 'RARE' },
        { name: 'Royal Palace', category: 'THEME', price: 1000, icon: '🏰', rarity: 'LEGENDARY', value: 'royal' },
    ];

    for (const item of items) {
        await prisma.shopItem.create({ data: item });
    }

    console.log("Street don set! ✅");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
