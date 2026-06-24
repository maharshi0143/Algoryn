exports.up = async (knex) => {
    await knex.raw(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await knex.raw(`
        CREATE TYPE platform_type AS ENUM(
            'leetcode', 'github', 'codechef', 'codeforces', 'gfg', 'hackerrank'
        )
    `);

    await knex.raw(`
        CREATE TYPE notification_type AS ENUM(
            'achievement', 'contest', 'weekly_report', 'streak', 'sync', 'friend'
        )
    `);

    await knex.raw(`
        CREATE TYPE achievement_type AS ENUM('streak', 'problem', 'contest', 'contribution')
    `);

    await knex.raw(`
        CREATE TYPE friend_status AS ENUM('pending', 'accepted', 'rejected', 'blocked')
    `);

    await knex.schema.createTable("users", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.string("name", 100).notNullable();
        table.string("email", 255).notNullable().unique();
        table.text("password").notNullable();
        table.text("avatar");
        table.text("bio");
        table.boolean("is_verified").defaultTo(false);
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.index("email");
    });

    await knex.schema.createTable("refresh_tokens", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.text("token").notNullable();
        table.timestamp("expires_at").notNullable();
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("user_id");
    });

    await knex.schema.createTable("coding_profiles", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.specificType("platform", "platform_type").notNullable();
        table.string("username", 100).notNullable();
        table.text("profile_url");
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "platform"]);
        table.index("user_id");
        table.index("platform");
    });

    await knex.schema.createTable("problem_stats", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("profile_id").notNullable().unique().references("id").inTable("coding_profiles").onDelete("CASCADE");
        table.integer("total_solved").defaultTo(0);
        table.integer("easy_count").defaultTo(0);
        table.integer("medium_count").defaultTo(0);
        table.integer("hard_count").defaultTo(0);
        table.integer("rating");
        table.integer("ranking");
        table.integer("streak").defaultTo(0);
        table.timestamp("last_synced");
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("github_stats", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("profile_id").notNullable().unique().references("id").inTable("coding_profiles").onDelete("CASCADE");
        table.integer("repositories").defaultTo(0);
        table.integer("followers").defaultTo(0);
        table.integer("following").defaultTo(0);
        table.integer("stars").defaultTo(0);
        table.integer("commits").defaultTo(0);
        table.integer("contributions").defaultTo(0);
        table.jsonb("languages");
        table.timestamp("last_synced");
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("daily_stats", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.date("date").notNullable();
        table.integer("problems_solved").defaultTo(0);
        table.integer("easy_count").defaultTo(0);
        table.integer("medium_count").defaultTo(0);
        table.integer("hard_count").defaultTo(0);
        table.integer("github_contributions").defaultTo(0);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "date"]);
        table.index("user_id");
        table.index(["user_id", "date"]);
        table.index("date");
    });

    await knex.schema.createTable("contest_history", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("profile_id").notNullable().references("id").inTable("coding_profiles").onDelete("CASCADE");
        table.string("contest_name", 255).notNullable();
        table.integer("rank");
        table.integer("rating_change");
        table.integer("new_rating");
        table.timestamp("contest_date");
        table.index("profile_id");
        table.index("contest_date");
    });

    await knex.schema.createTable("achievements", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.specificType("type", "achievement_type").notNullable();
        table.string("title", 255).notNullable();
        table.text("description");
        table.text("icon");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.index("user_id");
    });

    await knex.schema.createTable("notifications", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.specificType("type", "notification_type").notNullable();
        table.text("message").notNullable();
        table.boolean("is_read").defaultTo(false);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.index("user_id");
        table.index("is_read");
    });

    await knex.schema.createTable("goals", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.integer("target").notNullable();
        table.integer("current_progress").defaultTo(0);
        table.integer("month");
        table.integer("year");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.index("user_id");
        table.index(["month", "year"]);
    });

    await knex.schema.createTable("friends", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.uuid("friend_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.specificType("status", "friend_status").defaultTo("pending");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
        table.unique(["user_id", "friend_id"]);
        table.index("friend_id");
    });

    await knex.schema.createTable("activity_logs", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.string("action", 255).notNullable();
        table.jsonb("metadata");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("user_id");
    });

    await knex.schema.createTable("email_preferences", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().unique().references("id").inTable("users").onDelete("CASCADE");
        table.boolean("weekly_report").defaultTo(true);
        table.boolean("contest_reminder").defaultTo(true);
        table.boolean("streak_alert").defaultTo(true);
        table.boolean("achievement_alert").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    await knex.schema.createTable("contest_reminders", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.specificType("platform", "platform_type").notNullable();
        table.integer("minutes_before").defaultTo(10);
        table.boolean("is_active").defaultTo(true);
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("user_id");
        table.index("is_active");
    });

    await knex.schema.createTable("weekly_reports", (table) => {
        table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
        table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
        table.date("week_start").notNullable();
        table.date("week_end").notNullable();
        table.text("summary");
        table.text("recommendations");
        table.timestamp("created_at").defaultTo(knex.fn.now());
        table.index("user_id");
        table.index("week_start");
    });

    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    `);

    const tablesWithUpdatedAt = [
        "users", "coding_profiles", "problem_stats", "github_stats",
        "notifications", "achievements", "goals", "friends",
        "email_preferences",
    ];

    for (const table of tablesWithUpdatedAt) {
        await knex.raw(`
            CREATE TRIGGER ${table}_updated_at
            BEFORE UPDATE ON ${table}
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
    }
};

exports.down = async (knex) => {
    const tables = [
        "weekly_reports", "contest_reminders", "email_preferences",
        "activity_logs", "friends", "goals", "notifications",
        "achievements", "contest_history", "daily_stats", "github_stats",
        "problem_stats", "coding_profiles", "refresh_tokens", "users",
    ];

    for (const table of tables) {
        await knex.schema.dropTableIfExists(table);
    }

    await knex.raw("DROP TYPE IF EXISTS friend_status");
    await knex.raw("DROP TYPE IF EXISTS achievement_type");
    await knex.raw("DROP TYPE IF EXISTS notification_type");
    await knex.raw("DROP TYPE IF EXISTS platform_type");
    await knex.raw("DROP FUNCTION IF EXISTS update_updated_at_column CASCADE");
};
