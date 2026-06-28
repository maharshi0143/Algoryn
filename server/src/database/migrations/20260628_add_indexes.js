exports.up = async (knex) => {
    await knex.schema.table("friends", (table) => {
        table.index(["user_id", "status"]);
        table.index(["friend_id", "status"]);
    });

    await knex.schema.table("notifications", (table) => {
        table.index(["user_id", "is_read"]);
    });

    await knex.schema.table("activity_logs", (table) => {
        table.index(["user_id", "created_at"]);
    });
};

exports.down = async (knex) => {
    await knex.schema.table("activity_logs", (table) => {
        table.dropIndex(["user_id", "created_at"]);
    });

    await knex.schema.table("notifications", (table) => {
        table.dropIndex(["user_id", "is_read"]);
    });

    await knex.schema.table("friends", (table) => {
        table.dropIndex(["friend_id", "status"]);
        table.dropIndex(["user_id", "status"]);
    });
};
