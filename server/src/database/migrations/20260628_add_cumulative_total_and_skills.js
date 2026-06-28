exports.up = async (knex) => {
    const hasCumulativeTotal = await knex.schema.hasColumn("daily_stats", "cumulative_total");
    if (!hasCumulativeTotal) {
        await knex.schema.table("daily_stats", (table) => {
            table.integer("cumulative_total").notNullable().defaultTo(0);
        });
    }

    const hasSkills = await knex.schema.hasColumn("problem_stats", "skills");
    if (!hasSkills) {
        await knex.schema.table("problem_stats", (table) => {
            table.jsonb("skills").defaultTo([]);
        });
    }
};

exports.down = async (knex) => {
    await knex.schema.table("daily_stats", (table) => {
        table.dropColumn("cumulative_total");
    });

    await knex.schema.table("problem_stats", (table) => {
        table.dropColumn("skills");
    });
};
