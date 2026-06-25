CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM TYPES
CREATE TYPE platform_type AS ENUM(
    'leetcode',
    'github',
    'codechef',
    'codeforces',
    'gfg',
    'hackerrank'
);

CREATE TYPE notification_type AS ENUM(
    'achievement',
    'contest',
    'weekly_report',
    'streak',
    'sync',
    'friend'
);


CREATE TYPE achievement_type AS ENUM(
    'streak',
    'problem',
    'contest',
    'contribution'
);

CREATE TYPE friend_status AS ENUM(
    'pending',
    'accepted',
    'rejected',
    'blocked'
);


-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_token_hash TEXT,
    verification_token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email
ON users(email);


-- ==========================================
-- REFRESH TOKENS
-- ==========================================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token_user
ON refresh_tokens(user_id);

-- ==========================================
-- CODING PROFILES
-- ==========================================

CREATE TABLE coding_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform platform_type NOT NULL,
    username VARCHAR(100) NOT NULL,
    profile_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform),
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);


CREATE INDEX idx_profiles_user
ON coding_profiles(user_id);

CREATE INDEX idx_profiles_platform
ON coding_profiles(platform);

-- ==========================================
-- PROBLEM STATS
-- ==========================================

CREATE TABLE problem_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL,
    total_solved INTEGER DEFAULT 0 CHECK (total_solved >= 0),
    easy_count INTEGER DEFAULT 0 CHECK (easy_count >= 0),
    medium_count INTEGER DEFAULT 0 CHECK (medium_count >= 0),
    hard_count INTEGER DEFAULT 0 CHECK (hard_count >= 0),
    rating INTEGER,
    ranking INTEGER,
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    last_synced TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id)
    REFERENCES coding_profiles(id)
    ON DELETE CASCADE
);


-- ==========================================
-- GITHUB STATS
-- ==========================================

CREATE TABLE github_stats (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL,
    repositories INTEGER DEFAULT 0 CHECK (repositories >= 0),
    followers INTEGER DEFAULT 0 CHECK (followers >= 0),
    following INTEGER DEFAULT 0 CHECK (following >= 0),
    stars INTEGER DEFAULT 0 CHECK (stars >= 0),
    commits INTEGER DEFAULT 0 CHECK (commits >= 0),
    contributions INTEGER DEFAULT 0 CHECK (contributions >= 0),
    languages JSONB,
    last_synced TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id)
    REFERENCES coding_profiles(id)
    ON DELETE CASCADE
);

-- ==========================================
-- DAILY STATS
-- ==========================================

CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    problems_solved INTEGER DEFAULT 0,
    easy_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    hard_count INTEGER DEFAULT 0,
    github_contributions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date),
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_daily_stats_user
ON daily_stats(user_id);

CREATE INDEX idx_daily_stats_user_date
ON daily_stats(user_id, date);


-- ==========================================
-- CONTEST HISTORY
-- ==========================================

CREATE TABLE contest_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    contest_name VARCHAR(255) NOT NULL,
    rank INTEGER,
    rating_change INTEGER,
    new_rating INTEGER,
    contest_date TIMESTAMP,
    FOREIGN KEY(profile_id)
    REFERENCES coding_profiles(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_contest_profile
ON contest_history(profile_id);


-- ==========================================
-- ACHIEVEMENTS
-- ==========================================

CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type achievement_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_achievement_user
ON achievements(user_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user
ON notifications(user_id);


-- ==========================================
-- GOALS
-- ==========================================

CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target INTEGER NOT NULL CHECK (target > 0),
    current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    year INTEGER CHECK (year >= 2025),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);


-- ==========================================
-- FRIENDS
-- ==========================================

CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    friend_id UUID NOT NULL,
    status friend_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
    FOREIGN KEY(friend_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
    UNIQUE(user_id, friend_id),
    CHECK (user_id <> friend_id)
);

CREATE INDEX idx_friends_friend ON friends(friend_id);


-- ==========================================
-- ACTIVITY LOGS
-- ==========================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);


-- ==========================================
-- EMAIL PREFERENCES
-- ==========================================

CREATE TABLE email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    weekly_report BOOLEAN DEFAULT TRUE,
    contest_reminder BOOLEAN DEFAULT TRUE,
    streak_alert BOOLEAN DEFAULT TRUE,
    achievement_alert BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);


-- ==========================================
-- CONTEST REMINDERS
-- ==========================================

CREATE TABLE contest_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform platform_type NOT NULL,
    minutes_before INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_contest_reminders_user ON contest_reminders(user_id);
CREATE INDEX idx_contest_reminders_active ON contest_reminders(is_active);


-- ==========================================
-- WEEKLY REPORTS
-- ==========================================

CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    summary TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_weekly_reports_user ON weekly_reports(user_id);
CREATE INDEX idx_weekly_reports_week ON weekly_reports(week_start);



CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER update_users_updated_at
BEFORE UPDATE
ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



CREATE INDEX idx_notifications_read
ON notifications(is_read);


CREATE INDEX idx_daily_stats_date
ON daily_stats(date);


CREATE INDEX idx_contest_date
ON contest_history(contest_date);


CREATE INDEX idx_activity_logs_user
ON activity_logs(user_id);


CREATE INDEX idx_goals_user
ON goals(user_id);

CREATE INDEX idx_goals_month_year
ON goals(month, year);


INSERT INTO users (
    name,
    email,
    password
)
VALUES (
    'Demo User',
    'demo@devtrack.ai',
    '$2b$10$5pmqVzLtLding2KPYmsu0OSynkVdYR41heH.yzMo2qjCuFTiVvWae'
);