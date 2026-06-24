-- ============================================
-- Migration 001: ENUM types, indexes, constraints
-- Run against existing NeonDB:
--   psql "$DATABASE_URL" -f database/migration_001.sql
-- ============================================

-- Step 1: ENUM type + column changes (transaction-safe)
BEGIN;

DO $$ BEGIN
    CREATE TYPE friend_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE friends
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE friends
    ALTER COLUMN status TYPE friend_status
    USING status::friend_status;

ALTER TABLE friends
    ALTER COLUMN status SET DEFAULT 'pending';

COMMIT;

-- Step 2: Fix any invalid platform values before casting to ENUM
BEGIN;
UPDATE contest_reminders SET platform = 'codeforces' WHERE platform NOT IN (
    'leetcode', 'github', 'codechef', 'codeforces', 'gfg', 'hackerrank'
);
COMMIT;

BEGIN;
ALTER TABLE contest_reminders
    ALTER COLUMN platform TYPE platform_type
    USING platform::platform_type;
COMMIT;

-- Step 3: Missing indexes (outside transaction for safety)
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_goals_month_year ON goals(month, year);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_week ON weekly_reports(week_start);
