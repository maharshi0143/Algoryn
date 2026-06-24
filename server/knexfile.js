if (process.env.NODE_ENV !== "production") {
    const envFile = `.env.${process.env.NODE_ENV || "development"}`;
    const envPath = require("path").resolve(__dirname, envFile);
    require("dotenv").config({ path: envPath });
}

module.exports = {
    development: {
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        },
        pool: { min: 2, max: 10 },
        migrations: {
            directory: "./src/database/migrations",
            extension: "js",
        },
    },
    production: {
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: true },
        },
        pool: { min: 2, max: 10 },
        migrations: {
            directory: "./src/database/migrations",
            extension: "js",
        },
    },
    test: {
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        },
        pool: { min: 2, max: 10 },
        migrations: {
            directory: "./src/database/migrations",
            extension: "js",
        },
    },
};
