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

module.exports = pool;
