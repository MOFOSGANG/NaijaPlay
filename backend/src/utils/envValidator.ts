const REQUIRED_ENV = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GEMINI_API_KEY'
];

export const validateEnv = () => {
    const missing = REQUIRED_ENV.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error("========================================");
        console.error("❌ MISSING REQUIRED ENVIRONMENT VARIABLES:");
        missing.forEach(m => console.error(`   - ${m}`));
        console.error("========================================");

        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    } else {
        console.log("✅ All required environment variables are set.");
    }
};
