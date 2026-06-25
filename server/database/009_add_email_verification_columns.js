exports.up = async function (knex) {
    // Columns already added manually in Neon.
    // Keeping migration for project history.
};

exports.down = async function (knex) {
    await knex.schema.alterTable("users", (table) => {
        table.dropColumn("verification_token_hash");
        table.dropColumn("verification_token_expires_at");
    });
};