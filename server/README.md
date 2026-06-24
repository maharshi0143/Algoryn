# DevTrack AI — Developer Analytics Platform

Backend API for aggregating coding activity from multiple programming platforms into a unified dashboard with AI-powered insights, real-time notifications, friend leaderboards, achievements, contest reminders, and data export.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Business Rules & Logic](#business-rules--logic)
- [Scheduled Jobs](#scheduled-jobs)
- [Integrations](#integrations)
- [Security](#security)
- [Deployment](#deployment)

---

## Tech Stack

### Runtime
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22 | JavaScript runtime |
| Express | 5.2 | Web framework |
| PostgreSQL | (NeonDB) | Relational database |
| Redis | 8 (compose only) | Caching (configured but not wired) |

### Key Packages

| Package | Purpose |
|---------|---------|
| `pg` | PostgreSQL client (connection pool) |
| `knex` | SQL query builder & migration framework |
| `jsonwebtoken` | JWT access + refresh token auth |
| `bcryptjs` | Password hashing (10 rounds) |
| `groq-sdk` | Groq AI (Llama 3.3) for insights/recommendations |
| `socket.io` | Real-time notifications |
| `node-cron` | Scheduled job runner |
| `winston` + `winston-daily-rotate-file` | Structured logging with file rotation |
| `morgan` | HTTP request logging |
| `express-rate-limit` | Rate limiting (4 tiers) |
| `helmet` | HTTP security headers |
| `cors` | Cross-Origin Resource Sharing |
| `compression` | Gzip response compression |
| `express-validator` | Request body validation |
| `nodemailer` | Email sending via SMTP |
| `pdfkit` | PDF report generation |
| `sharp` | SVG-to-PNG for report images |
| `@sentry/node` | Error tracking & performance monitoring |
| `cookie-parser` | Cookie parsing for refresh tokens |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Frontend)                     │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP / WebSocket
                   ▼
┌─────────────────────────────────────────────────────────┐
│                     Express Server                        │
│                                                          │
│  Middleware Stack:                                        │
│  helmet → cors → json/urlencoded → compression →         │
│  morgan(logging) → cookieParser → rateLimiter            │
│                                                          │
│  Routes → Controllers → Services → Repositories → DB     │
│                     ↕                                    │
│              External APIs (GitHub, LeetCode, etc.)       │
│                     ↕                                    │
│              Groq AI (Llama 3.3)                         │
│                                                          │
│  Background Jobs (node-cron, 9 jobs)                     │
│  Real-time (Socket.IO)                                   │
└─────────────────────────────────────────────────────────┘
```

### Layer Description

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Routes** | `src/routes/` | Map HTTP methods + paths to controllers, attach middleware |
| **Controllers** | `src/controllers/` | Parse request, call service, format response via `apiResponse` |
| **Services** | `src/services/` | Business logic, validation, orchestration |
| **Repositories** | `src/repositories/` | Raw SQL queries + Knex query builder (data access only) |
| **Validators** | `src/validators/` | Express-validator rules for request bodies |
| **Middlewares** | `src/middlewares/` | Auth, rate limiting, error handling, validation result check |
| **Integrations** | `src/integrations/` | External API clients (GitHub, LeetCode, Codeforces, etc.) |
| **Jobs** | `src/jobs/` | Cron-scheduled background tasks |
| **Config** | `src/config/` | DB pool, Knex, Socket.IO, Email transporter |
| **Utils** | `src/utils/` | Helpers: JWT generation, logging, error classes, response formatter |

### Response Format

All API responses follow a standard envelope:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "message": "User already exists"
}
```

---

## Environment Variables

Create a `.env.<environment>` file (e.g., `.env.development`, `.env.production`). The app loads the file matching `NODE_ENV`.

### Required

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string (NeonDB or any pg) |
| `JWT_SECRET` | — | Secret for signing access tokens (random 64-char hex) |
| `JWT_REFRESH_SECRET` | — | Secret for signing refresh tokens (random 64-char hex) |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin for CORS and Socket.IO |

### Auth Tokens

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |

### Optional (feature-dependent)

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Groq AI key (needed for insights/recommendations/weakness) |
| `GITHUB_TOKEN` | — | GitHub PAT for GraphQL contributions fetch |
| `SENTRY_DSN` | — | Sentry DSN for error tracking |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | — | SMTP email |
| `SMTP_PASS` | — | SMTP app password |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model name |
| `LOG_LEVEL` | `info` | Winston log level |

---

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL database (NeonDB or local)
- npm

### Setup

```bash
# 1. Install dependencies
cd server
npm install

# 2. Create environment file
cp .env.example .env.development
# Edit .env.development with your values

# 3. Run database migrations
npm run migrate

# 4. Start development server
npm run dev
```

### Database Migrations

```bash
npm run migrate          # Run pending migrations
npm run migrate:make     # Create new migration
npm run migrate:rollback # Roll back last migration
npm run migrate:status   # Check migration status
```

---

## API Reference

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health + DB connectivity check |

**Response (healthy):** `200`
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 12345,
    "timestamp": "2026-06-24T...",
    "components": { "database": { "status": "ok", "latency_ms": 3 } }
  }
}
```

**Response (degraded):** `503`

---

### Authentication

Base path: `/api/auth`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/register` | No | 10/15min | Create new account |
| POST | `/login` | No | 10/15min | Login with email + password |
| POST | `/logout` | Yes | — | Clear refresh token |
| GET | `/me` | Yes | — | Get current user profile |
| POST | `/refresh-token` | No | 10/15min | Rotate refresh token (cookie) |
| PUT | `/password` | Yes | 10/15min | Change password |
| DELETE | `/me` | Yes | 10/15min | Delete account |

#### POST `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "StrongPass1"
}
```

**Rules:**
- `name`: min 2 characters
- `email`: must be `@gmail.com`, normalized
- `password`: min 8 chars, must contain uppercase + lowercase + digit
- Email must be unique (409 Conflict if duplicate)

**Response (201):** Sets `refreshToken` as httpOnly cookie. Returns:
```json
{
  "user": { "id": "uuid", "name": "John Doe", "email": "john@gmail.com" },
  "accessToken": "eyJ..."
}
```

#### POST `/api/auth/login`

**Body:**
```json
{
  "email": "john@gmail.com",
  "password": "StrongPass1"
}
```

**Rules:** Email must be `@gmail.com`. Invalid credentials return 401.

**Response (200):** Same as register — sets cookie, returns user + accessToken.

#### POST `/api/auth/logout`

**Auth:** Bearer token required. Deletes refresh token from DB, clears cookie.

#### GET `/api/auth/me`

**Auth:** Bearer token required.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@gmail.com",
  "avatar": null,
  "bio": null,
  "is_verified": false,
  "is_active": true
}
```

#### POST `/api/auth/refresh-token`

Requires `refreshToken` cookie. Rotates: invalidates old token, issues new pair.

**Response (200):** New accessToken + sets new refreshToken cookie.

#### PUT `/api/auth/password`

**Auth:** Bearer token + rate limited (10/15min).

**Body:**
```json
{
  "currentPassword": "OldPass1",
  "newPassword": "NewPass123!"
}
```

**Rules:** `newPassword` must be min 8 chars, contain uppercase + lowercase + digit.

#### DELETE `/api/auth/me`

**Auth:** Bearer token + rate limited. Hard-deletes user and all related data (cascade).

---

### Coding Profiles

Base path: `/api/profiles` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create coding profile |
| GET | `/` | List profiles (paginated: `?page=1&limit=20`) |
| PUT | `/:id` | Update profile username |
| DELETE | `/:id` | Delete profile |

#### POST `/api/profiles`

**Body:**
```json
{
  "platform": "leetcode",
  "username": "myhandle",
  "profileUrl": "https://leetcode.com/u/myhandle/"
}
```

**Valid platforms:** `leetcode`, `github`, `codeforces`, `codechef`, `gfg`, `hackerrank`

**Rules:**
- Platform + user_id must be unique (409 if duplicate)
- `profileUrl` is optional

#### PUT `/api/profiles/:id`

**Body:**
```json
{
  "username": "newhandle",
  "profileUrl": "https://..."
}
```

**Rules:** Ownership check — only the profile owner can update. Returns 403 if unauthorized.

#### DELETE `/api/profiles/:id`

**Rules:** Ownership check. Returns 200 on success (no content body).

---

### Sync

Base path: `/api/sync` — **Auth required**, rate limited (20/hour)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/github` | Sync GitHub stats |
| POST | `/leetcode` | Sync LeetCode stats |
| POST | `/codeforces` | Sync Codeforces stats |
| POST | `/codechef` | Sync CodeChef stats |
| POST | `/gfg` | Sync GFG stats |
| POST | `/hackerrank` | Sync HackerRank stats |
| POST | `/all` | Sync all platforms |

**Behavior:**
- Requires a profile for the platform (404 if missing)
- Fetches data from external API, updates or creates stats
- Sends `sync` notification on success
- `/all` runs each platform sync independently — failures are logged but don't stop remaining syncs

---

### Dashboard

Base path: `/api/dashboard` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Combined overview (problem stats + GitHub stats) |
| GET | `/charts` | Overview + weekly + monthly combined |
| GET | `/weekly` | Last 7 days daily stats |
| GET | `/monthly` | Last 30 days daily stats |
| GET | `/heatmap` | All dates with problems_solved |

---

### Analytics

Base path: `/api/analytics` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/platforms` | Per-platform total problems solved |
| GET | `/difficulty` | Aggregated Easy/Medium/Hard counts |
| GET | `/contributions` | Daily GitHub contribution history |
| GET | `/yearly` | Monthly problem-solving progress (current year) |

---

### Notifications

Base path: `/api/notifications` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create notification |
| GET | `/` | List notifications (paginated: `?page=1&limit=20`) |
| PATCH | `/:id` | Mark as read |
| DELETE | `/:id` | Delete notification |

**Valid types:** `achievement`, `contest`, `weekly_report`, `streak`, `sync`

**Real-time:** Created notifications are emitted to the user's Socket.IO room (`notification:new` event).

---

### Achievements

Base path: `/api/achievements` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all earned achievements |
| POST | `/` | Check and unlock new achievements |

**Achievement thresholds:**

| Title | Condition | Type |
|-------|-----------|------|
| Problem Solver | Total solved >= 100 | `problem` |
| Advanced Problem Solver | Total solved >= 500 | `problem` |
| Problem Master | Total solved >= 1000 | `problem` |
| 7-Day Streak | Streak >= 7 | `streak` |
| GitHub Explorer | Contributions >= 100 | `contribution` |

Unlocks are idempotent — duplicate titles are silently skipped.

---

### Contests

Base path: `/api/contests`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Contest history (paginated: `?page=1&limit=20`) |
| GET | `/upcoming` | No | Upcoming Codeforces contests |
| GET | `/rating` | Yes | Rating graph data (contest + rating pairs) |
| POST | `/sync` | Yes | Sync Codeforces contest history |

**Rules:** Requires a linked Codeforces profile. Contest history is deduplicated by contest name.

---

### AI Insights

Base path: `/api/ai` — **Auth required**, rate limited (50/hour)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/insights` | AI-generated analysis of your coding stats |
| GET | `/recommendations` | Personalized improvement suggestions |
| GET | `/weakness` | Honest but kind areas to improve |

**Behind the scenes:** Each endpoint builds a prompt from the user's current stats, sends to Groq AI (Llama 3.3) with a "friendly coding buddy" system prompt, and returns natural language text. Requires `GROQ_API_KEY` to be set.

---

### Daily Stats

Base path: `/api/daily-stats` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Last 7 days of daily stats |
| POST | `/populate` | Snapshot current stats for today |

---

### Goals

Base path: `/api/goals` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create goal |
| GET | `/` | List all goals |
| GET | `/:id` | Get single goal |
| PATCH | `/:id/progress` | Update progress |
| DELETE | `/:id` | Delete goal |

#### POST `/api/goals`

**Body:**
```json
{
  "target": 100,
  "month": 6,
  "year": 2026
}
```

**Rules:**
- `target`: integer >= 1
- `month`: optional, 1-12
- `year`: optional, >= 2025

#### PATCH `/api/goals/:id/progress`

**Body:**
```json
{
  "current_progress": 50
}
```

**Rules:** `current_progress` must be >= 0. Ownership check required.

---

### Friends

Base path: `/api/friends` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Send friend request |
| GET | `/` | List accepted friends |
| GET | `/pending` | List incoming pending requests |
| PATCH | `/:id/accept` | Accept pending request |
| PATCH | `/:id/reject` | Reject pending request |
| PATCH | `/:id/block` | Block friend |
| DELETE | `/:id` | Remove friend |

#### POST `/api/friends`

**Body:**
```json
{
  "friendEmail": "friend@gmail.com"
}
```

**Rules:**
- Cannot send request to yourself (400)
- Friend must exist (404)
- No duplicate friendships (409)
- Recipient gets a notification

**Friend status lifecycle:** `pending` → `accepted` | `rejected` | `blocked`

---

### Leaderboard

Base path: `/api/leaderboard`

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/` | No | 500/15min | Global leaderboard (paginated: `?page=1&limit=50`) |
| GET | `/friends` | Yes | 500/15min | Friends-only leaderboard |
| GET | `/platform/:platform` | No | 500/15min | Platform-specific leaderboard |
| GET | `/streaks` | No | 500/15min | Top 10 streaks |
| GET | `/contributions` | No | 500/15min | Top 10 contributors |

**Ranking logic:**
- **Global/Friends:** Users ranked by `SUM(problem_stats.total_solved)` descending
- **Platform:** Filtered by `coding_profiles.platform`, ranked by `total_solved`
- **Streaks:** Top 10 by `MAX(problem_stats.streak)`
- **Contributions:** Top 10 by `MAX(github_stats.contributions)`

---

### Reports

Base path: `/api/reports` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate AI-powered weekly report |

Uses Groq AI to analyze stats + achievements + goals + activities and produce a structured summary with recommendations. Saves to `weekly_reports` table.

---

### Contest Reminders

Base path: `/api/contest-reminders` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create reminder |
| GET | `/` | List reminders |
| DELETE | `/:id` | Delete reminder |

#### POST `/api/contest-reminders`

**Body:**
```json
{
  "platform": "codeforces",
  "minutes_before": 30
}
```

**Valid platforms for reminders:** `leetcode`, `codeforces`, `codechef`
**Minutes before:** 10-60

---

### Public Profile

Base path: `/api/public` — **No auth required**, rate limited (500/15min)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:username` | Get public profile by name (case-insensitive) |

**Response:** User info + aggregated stats + platforms + achievements + recent activities.

---

### Export

Base path: `/api/export` — **Auth required**

| Method | Endpoint | Content-Type | Description |
|--------|----------|-------------|-------------|
| GET | `/json` | `application/json` | Download all data as JSON file |
| GET | `/pdf` | `application/pdf` | Download PDF report |
| GET | `/png` | `image/png` | Download PNG stats card |

---

### Email Preferences

Base path: `/api/email-preferences` — **Auth required**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current preferences |
| PUT | `/` | Update preferences |

#### PUT `/api/email-preferences`

**Body:**
```json
{
  "weekly_report": true,
  "contest_reminder": false,
  "streak_alert": true,
  "achievement_alert": true
}
```

All fields are optional booleans. Defaults to all `true`.

---

## Database Schema

### Entity Relationship

```
users (1) ──< (N) refresh_tokens
users (1) ──< (N) coding_profiles (1) ── (0..1) problem_stats
                                        └── (0..1) github_stats
                                        └── (N) contest_history
users (1) ──< (N) daily_stats
users (1) ──< (N) achievements
users (1) ──< (N) notifications
users (1) ──< (N) goals
users (1) ──< (N) friends (bidirectional)
users (1) ──< (N) activity_logs
users (1) ── (0..1) email_preferences
users (1) ──< (N) contest_reminders
users (1) ──< (N) weekly_reports
```

### Enums

| Enum | Values |
|------|--------|
| `platform_type` | `leetcode`, `github`, `codechef`, `codeforces`, `gfg`, `hackerrank` |
| `notification_type` | `achievement`, `contest`, `weekly_report`, `streak`, `sync`, `friend` |
| `achievement_type` | `streak`, `problem`, `contest`, `contribution` |
| `friend_status` | `pending`, `accepted`, `rejected`, `blocked` |

### Key Constraints

| Constraint | Where |
|------------|-------|
| `UNIQUE(user_id, platform)` | `coding_profiles` — one profile per platform per user |
| `UNIQUE(user_id, date)` | `daily_stats` — one stats entry per day per user |
| `UNIQUE(user_id, friend_id)` + `CHECK(user_id <> friend_id)` | `friends` — no duplicate or self-friendships |
| `UNIQUE(profile_id)` | `problem_stats`, `github_stats` — one stats row per profile |
| `CHECK(char_length(name) >= 2)` | `users` |
| `CHECK(target > 0)` | `goals` |
| `CHECK(current_progress >= 0)` | `goals`, `problem_stats`, `github_stats` |

### Triggers

An `update_updated_at_column()` function fires on `BEFORE UPDATE` for: `users`, `coding_profiles`, `problem_stats`, `github_stats`, `notifications`, `achievements`, `goals`, `friends`, `email_preferences`.

---

## Business Rules & Logic

### Authentication & Authorization
- Only `@gmail.com` emails can register (business constraint)
- Passwords hashed with bcrypt (10 salt rounds)
- Access tokens expire in 15 minutes, refresh tokens in 7 days
- Refresh tokens are rotated on each use (old token deleted, new one issued)
- JWT payload: access token carries `{ userId, email }`, refresh carries `{ userId }`
- Deactivated accounts (`is_active = false`) are rejected at the auth middleware level

### Profile Management
- Each user can link one account per platform (leetcode, github, codeforces, codechef, gfg, hackerrank)
- Duplicate platform + user combinations are rejected (409)
- Only the profile owner can update or delete their profiles

### Sync Logic
- Each platform sync fetches live data from the respective external API
- GitHub sync aggregates: repos count, followers, following, total stars, contribution calendar (GraphQL), language distribution
- LeetCode sync parses: total solved, easy/medium/hard counts, ranking, submission calendar to compute streak
- Codeforces sync fetches: current rating, contest history
- CodeChef/GFG/HackerRank fetch: problem counts and ratings
- `/api/sync/all` runs all platform syncs with individual error isolation — one failing doesn't block others
- Sync notifications are sent asynchronously (fire-and-forget) — failures are logged but don't abort the sync

### Streak Calculation (LeetCode)
- Parses `submissionCalendar` JSON from LeetCode API
- Converts Unix timestamps to dates
- Counts consecutive days backwards from today where submissions exist
- Breaks on first missing day

### AI Integration (Groq)
- Uses Llama 3.3 70B via the `groq-sdk`
- Three distinct prompts: insights (stats overview), recommendations (difficulty distribution), weakness (comprehensive analysis)
- System prompt sets a "friendly coding buddy" persona — responses are natural language, no markdown/bullet points
- Temperature: 0.3 for structured prompts, 0.8 for creative responses
- Weekly report generation requests structured JSON output with aggressive parsing fallbacks

### Achievement System
- Five predefined achievements with fixed thresholds
- Checked on-demand via POST or automatically at midnight (daily cron)
- Duplicate achievements are prevented by title lookup
- Unlocking triggers a notification

### Friend System
- One-directional friend request (user A sends to user B)
- Recipient must accept or reject; sender cannot accept their own request
- Either party can block or remove the friendship
- Friends lifecycle: `pending` → `accepted` | `rejected` | `blocked`
- Blocked friendships are terminal (no unblock)

### Leaderboard Ranking
- Global: All users with at least one coding profile, ranked by total problems solved
- Friends: Only accepted friendships, same ranking logic
- Platform: Filtered by platform type
- No ties handling — deterministic from `ORDER BY total_solved DESC`

### Goal Tracking
- Goals have a target number and optional month/year scope
- Progress is manually updated via PATCH
- Ownership enforced at the service layer (403 if not the owner)

### Contest Reminders
- Users set reminders per platform with a minutes-before window (10-60 min)
- A cron job runs every 5 minutes checking Codeforces upcoming contests
- Matches reminder platform + time window against upcoming contests
- Deduplicates by checking if a notification was sent in the last hour for the same contest
- Sends notification and email if configured

### Weekly Reports
- Generated every Monday at 9 AM via cron
- Gathers: overview stats, achievements, goals progress, recent activities
- Calls Groq AI to generate a structured summary and recommendations
- Saves to `weekly_reports` table and sends notification
- Parse failures fall back gracefully to default text

### Email Preferences
- Each user has a preferences record (auto-created on demand)
- Controls: weekly report, contest reminder, streak alert, achievement alert
- All default to enabled on new users
- SMTP must be configured for emails to actually send; otherwise, no-op logging

### Daily Stats
- A midnight cron snapshots the day's total problems solved + GitHub contributions
- Uses `INSERT ... ON CONFLICT (user_id, date) DO UPDATE` — safe for multiple runs
- Powers the heatmap, weekly, monthly, and yearly charts

### Export
- JSON: Direct data dump of all user data (parallel queries)
- PDF: PDFKit-generated document with stats, profiles, achievements, activities
- PNG: Sharp-rendered SVG card with stats overview
- All exports include user info + aggregated stats + platform profiles + achievements + recent activities

---

## Scheduled Jobs

| Job | Schedule | Description | Lock Name |
|-----|----------|-------------|-----------|
| GitHub Sync | Every 6 hours | Sync GitHub stats for all users | `github-sync` |
| LeetCode Sync | Every 6 hours | Sync LeetCode stats for all users | `leetcode-sync` |
| Codeforces Sync | Every 6 hours | Sync Codeforces stats for all users | `codeforces-sync` |
| CodeChef Sync | Every 6 hours | Sync CodeChef stats for all users | `codechef-sync` |
| GFG Sync | Every 6 hours | Sync GFG stats for all users | `gfg-sync` |
| Achievements | Daily at midnight | Check + unlock achievements | `achievement` |
| Daily Stats | Daily at midnight | Snapshot today's stats | `daily-stats` |
| Weekly Report | Monday 9 AM | Generate AI weekly reports | `weekly-report` |
| Contest Reminder | Every 5 minutes | Check for upcoming contests | `contest-reminder` |

All jobs use `withLock()` — if a job is still running when the next tick fires, the overlapping execution is silently skipped and logged.

---

## Integrations

### GitHub API
- **REST (profile + repos):** `https://api.github.com/users/{username}`, `.../repos?per_page=100` (multi-page)
- **GraphQL (contributions):** `https://api.github.com/graphql` — `contributionsCollection.contributionCalendar.totalContributions`
- **Auth:** Optional `GITHUB_TOKEN` — increases rate limit and enables contribution data

### LeetCode API
- **Endpoint:** `https://alfa-leetcode-api.onrender.com/{username}`
- **Returns:** totalSolved, easySolved, mediumSolved, hardSolved, ranking, submissionCalendar

### Codeforces API
- **User info:** `https://codeforces.com/api/user.info?handles={handle}`
- **Rating history:** `https://codeforces.com/api/user.rating?handle={handle}`
- **Contests:** `https://codeforces.com/api/contest.list?gym=false` (filtered to phase=BEFORE)
- **Validation:** Accepts 200 and 400 (for non-existent user) responses

### CodeChef API
- **Endpoint:** `https://codechef-stats-api-two.vercel.app/profile/{username}`
- **Returns:** profile with currentRating

### GFG API
- **Endpoint:** `https://gfg-stats.tashif.codes/{username}`
- **Returns:** totalProblemsSolved, Easy, Medium, Hard

### HackerRank API
- **Profile:** `https://hackerrank-stats-api.vercel.app/{username}`
- **Badges:** `https://hackerrank-stats-api.vercel.app/{username}/badges`
- **Returns:** totalSolved + badges (star rating extracted from badge IDs)

### Groq AI
- **SDK:** `groq-sdk`
- **Model:** `llama-3.3-70b-versatile` (configurable)
- **Timeout:** 30 seconds
- **Usage:** Insights, recommendations, weaknesses, weekly reports

---

## Security

### Authentication
- JWT access tokens (15m expiry) in `Authorization: Bearer` header
- JWT refresh tokens (7d expiry) in httpOnly, secure, sameSite=strict cookies
- Password hashing with bcrypt (10 rounds)
- Deactivated accounts blocked at middleware level

### Rate Limiting (all in-memory)

| Limiter | Window | Max Requests | Applied To |
|---------|--------|-------------|------------|
| Global | 15 min | 500 | All routes |
| Auth | 15 min | 10 | `/api/auth/*` |
| Sync | 1 hour | 20 | `/api/sync/*` |
| AI | 1 hour | 50 | `/api/ai/*` |

### HTTP Security
- `helmet` with default CSP policies
- `cors` restricted to `CLIENT_URL`
- JSON body size limited to 10KB
- `trust proxy` enabled (required for Railway/reverse proxy)

### Error Handling
- Centralized `errorMiddleware` catches all errors
- Custom `ApiError` class for structured errors with status codes
- `asyncHandler` wraps all route handlers to forward errors
- Sentry integration for production error tracking (0.1 trace sample rate)

---

## Deployment

### Railway

1. Push to GitHub
2. Create a new Railway project from your repo
3. Set the root directory to `server/`
4. Add all [required environment variables](#required)
5. Deploy — Railway auto-detects Node.js and runs `npm start`

Railway automatically:
- Installs dependencies (`npm install`)
- Runs `npm start` (`node src/server.js`)
- Handles SSL termination
- Provides `PORT` environment variable

### Docker

```bash
docker build -t devtrack-server .
docker run -p 5000:5000 --env-file .env.production devtrack-server
```

### Manual

```bash
NODE_ENV=production npm start
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Production start |
| `npm run migrate` | Run database migrations |
| `npm run migrate:make` | Create new migration |
| `npm run migrate:rollback` | Roll back last migration |
| `npm run migrate:status` | Check migration status |
