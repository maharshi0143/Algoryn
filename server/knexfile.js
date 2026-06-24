require("dotenv").config({ path: require("path").resolve(__dirname, `.env.${process.env.NODE_ENV || "development"}`) });

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
