require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

(async () => {
    try {
        await pool.query("ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS cumulative_total INTEGER NOT NULL DEFAULT 0");
        console.log("Migration applied: cumulative_total column added");
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
    await pool.end();
})();
