const { Pool } = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    max: 25,
    idleTimeoutMillis: 30000,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false },
});

pool.on("connect", () => {
    logger.info("PostgreSQL Connected");
});

pool.on("error", (err) => {
    logger.error("PostgreSQL Error:", err);
});

const waitForDatabase = async (maxRetries = 10, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const client = await pool.connect();
            await client.query("SELECT 1");
            client.release();
            logger.info("Database connection verified");
            return;
        } catch (err) {
            if (i === maxRetries - 1) {
                logger.error(`Database unreachable after ${maxRetries} retries`);
                throw err;
            }
            const delay = baseDelay * Math.pow(2, i);
            logger.warn(`Database not ready (attempt ${i + 1}/${maxRetries}), retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

module.exports = { pool, waitForDatabase };
