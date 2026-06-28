exports.up = async (knex) => {
    await knex.schema.table("daily_stats", (table) => {
        table.boolean("claimed").notNullable().defaultTo(false);
    });
};

exports.down = async (knex) => {
    await knex.schema.table("daily_stats", (table) => {
        table.dropColumn("claimed");
    });
};
