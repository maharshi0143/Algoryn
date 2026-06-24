const knex = require("knex");
const config = require("../../knexfile");

const env = process.env.NODE_ENV || "development";

const envConfig = config[env] || config.development;
if (!envConfig) {
    throw new Error(
        `Knex config not found for environment "${env}" and no "development" fallback available`
    );
}

const db = knex(envConfig);

module.exports = db;
