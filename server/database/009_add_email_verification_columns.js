exports.up = async function (knex) {
    await knex.schema.alterTable("users", (table) => {
        table.text("verification_token_hash");
        table.timestamp("verification_token_expires_at");
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable("users", (table) => {
        table.dropColumn("verification_token_hash");
        table.dropColumn("verification_token_expires_at");
    });
};