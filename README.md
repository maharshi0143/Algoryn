# Algoryn — Developer Analytics Platform

Backend API that aggregates coding activity from GitHub, LeetCode, Codeforces, CodeChef, GFG, and HackerRank into a unified dashboard with AI-powered insights (Groq Llama 3.3), real-time notifications (Socket.IO), friend leaderboards, achievements, contest reminders, weekly reports, and data export (JSON/PDF/PNG).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture & Data Flow](#architecture--data-flow)
- [Layer Descriptions](#layer-descriptions)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Database Enums & Constraints](#database-enums--constraints)
- [Business Logic & Validation Rules](#business-logic--validation-rules)
- [Scheduled Jobs](#scheduled-jobs)
- [Integrations (External APIs)](#integrations-external-apis)
- [Middleware Pipeline](#middleware-pipeline)
- [Real-Time Notifications (Socket.IO)](#real-time-notifications-socketio)
- [Error Handling](#error-handling)
- [Response Format & HTTP Status Codes](#response-format--http-status-codes)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Tech Stack

### Runtime

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Runtime | Node.js | 22 | JavaScript runtime |
| Framework | Express | 5.2 | Web server & routing |
| Database | PostgreSQL | (NeonDB) | Primary data store |
| Cache | Redis | 8 (docker-compose only) | Not wired in app code |

### Core Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `pg` | ^8.22 | PostgreSQL client (connection pool) |
| `knex` | ^3.2.10 | SQL query builder & migration framework |
| `jsonwebtoken` | ^9.0.3 | JWT access + refresh token auth |
| `bcryptjs` | ^3.0.3 | Password hashing (10 rounds) |
| `groq-sdk` | ^1.2.1 | Groq AI (default: Llama 3.3 70B) |
| `socket.io` | ^4.8.3 | Real-time WebSocket notifications |
| `node-cron` | ^4.4.1 | Cron scheduler for background jobs |
| `winston` + `winston-daily-rotate-file` | ^3.19 / ^5.0 | Structured logging with file rotation |
| `morgan` | ^1.11 | HTTP request logging piped to Winston |
| `express-rate-limit` | ^8.5.2 | Rate limiting (4 tiers) |
| `helmet` | ^8.2.0 | HTTP security headers |
| `cors` | ^2.8.6 | CORS (single-origin) |
| `compression` | ^1.8.1 | Gzip response compression |
| `express-validator` | ^7.3.2 | Request body validation |
| `nodemailer` | ^9.0.1 | Email sending via SMTP |
| `pdfkit` | ^0.19.1 | PDF report generation |
| `sharp` | ^0.35.2 | SVG-to-PNG rendering |
| `axios` | ^1.18 | HTTP client for external APIs |
| `@sentry/node` | ^10.59 | Error tracking & performance monitoring |
| `cookie-parser` | ^1.4.7 | Cookie parsing for refresh tokens |
| `dotenv` | ^17.4.2 | Environment variable loading |

---

## Project Structure

```
server/
├── knexfile.js                  # Knex configuration (dev/prod/test)
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env.development
├── .env.production
├── .env.test
├── .env.example
├── logs/                        # Log output (production only)
└── src/
    ├── server.js                # Entry point: DB wait, jobs init, HTTP server, graceful shutdown
    ├── app.js                   # Express app: middleware, routes, error handlers
    │
    ├── config/
    │   ├── db.js                # pg Pool + waitForDatabase() with exponential backoff
    │   ├── knex.js              # Knex query builder instance
    │   ├── email.js             # Nodemailer transporter (no-op if SMTP unconfigured)
    │   └── socket.js            # Socket.IO initialization + JWT auth middleware
    │
    ├── constants/
    │   └── httpStatus.js        # HTTP status code constants
    │
    ├── middlewares/
    │   ├── authMiddleware.js    # JWT verification + user lookup
    │   ├── apiLimiter.js        # Global: 500/15min
    │   ├── authLimiter.js       # Auth: 10/15min
    │   ├── syncLimiter.js       # Sync: 20/hour
    │   ├── aiLimiter.js         # AI: 50/hour
    │   ├── errorMiddleware.js   # Centralized error handler
    │   ├── notFoundMiddleware.js# 404 catch-all
    │   └── validate.js          # express-validator result checker
    │
    ├── routes/                  # 18 route files (1 per resource)
    ├── controllers/             # 19 controller files
    ├── services/                # 19 service files
    ├── repositories/            # 19 repository files
    ├── validators/              # 6 validator files
    ├── integrations/            # 7 integration modules
    ├── jobs/                    # 9 cron job files + index.js
    ├── database/
    │   └── migrations/
    │       └── 20260624_initial_schema.js  # Full schema (15 tables, 4 enums, triggers)
    └── utils/
        ├── ApiError.js          # Custom error class with statusCode
        ├── apiResponse.js       # Standard JSON envelope
        ├── asyncHandler.js      # Async error wrapper
        ├── cronTracker.js       # Track + stop all cron tasks
        ├── generateAccessToken.js   # JWT access token (15m)
        ├── generateRefreshToken.js  # JWT refresh token (7d)
        ├── jobTracker.js        # withLock() — prevents overlapping cron runs
        └── logger.js            # Winston: colorized console (dev), JSON + daily rotate (prod)
```

---

## Architecture & Data Flow
### Request Lifecycle

1. Incoming request hits Express
2. Middleware stack runs: `helmet` → `cors` → `express.json` → `compression` → `morgan` → `cookieParser` → `apiLimiter`
3. Route matched → route-specific middleware applied (auth, validators, rate limiters)
4. Controller extracts request data, calls Service
5. Service applies business logic, calls Repository(ies)
6. Repository queries PostgreSQL via raw SQL or Knex query builder
7. Response flows back through same middleware chain, formatted via `apiResponse()`:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { ... }
}
```

### Server Startup Sequence (`server.js`)

1. Load environment variables via dotenv
2. Wait for database connection with exponential backoff (`waitForDatabase()` — up to 10 retries)
3. Initialize all 9 cron jobs
4. Create HTTP server
5. Initialize Socket.IO on the server
6. Start listening on PORT (5000 default)
7. Bind graceful shutdown handlers (SIGTERM/SIGINT — stops cron, closes Socket.IO, ends pool)

---

## Layer Descriptions

### Routes (`src/routes/`)
Map HTTP methods + paths to controller functions. Apply middlewares per-route. 18 files, no logic here.

### Controllers (`src/controllers/`)
Parse `req` (params, query, body, user), call service, format response via `apiResponse()`. No business logic.

### Services (`src/services/`)
Contain all business logic, validation, and orchestration. Call repositories as needed. 19 files.

### Repositories (`src/repositories/`)
Data access layer. Run raw SQL via `pg` pool or Knex query builder. Return rows. No business logic.

17 repositories use `const { pool: db } = require("../config/db")` (raw `pg`).
2 repositories use `const db = require("../config/knex")` (Knex query builder):
- `analyticsRepository.js`
- `leaderboardRepository.js`

### Validators (`src/validators/`)
Express-validator rule arrays. Checked via `validate.js` middleware. Return first error as `{ success: false, message: "field: error" }`.

### Integrations (`src/integrations/`)
External API clients. Each platform has its own directory with a service file. 7 integration modules.

### Jobs (`src/jobs/`)
9 cron-scheduled background tasks. All wrapped with `withLock()` to prevent overlapping executions.

### Utils (`src/utils/`)
Shared helpers used across layers.

---

## Environment Variables

The app loads `server/.env.<NODE_ENV>` (e.g., `.env.development`, `.env.production`). NODE_ENV defaults to "development".

### Required (app will not function without)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for access token signing (64-char hex recommended) |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing (64-char hex recommended) |
| `CLIENT_URL` | Frontend origin for CORS + Socket.IO (default: `http://localhost:5173`) |

### Token Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `PORT` | `5000` | HTTP server port |

### Optional (feature-dependant)

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Enables AI insights, recommendations, weaknesses, weekly reports |
| `GITHUB_TOKEN` | — | GitHub PAT for GraphQL contribution data (without it, contributions = 0) |
| `SENTRY_DSN` | — | Sentry error tracking (0.1 trace sample rate in prod, disabled in dev) |
| `SENTRY_ENV` | `development` | Environment tag for Sentry |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_SECURE` | `false` | Use TLS |
| `SMTP_USER` | — | SMTP email address |
| `SMTP_PASS` | — | SMTP app password |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq AI model |
| `LOG_LEVEL` | `info` | Winston log level |

---

## Getting Started

```bash
# 1. Navigate to server directory
cd server

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.development
# Edit with your DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL

# 4. Run database migrations
npm run migrate

# 5. Start dev server (nodemon)
npm run dev
```

### Database Migrations

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run all pending migrations |
| `npm run migrate:make <name>` | Create a new migration file |
| `npm run migrate:rollback` | Roll back the last batch |
| `npm run migrate:status` | Show migration state |

---

## API Reference

All endpoints return the standard envelope. Auth-protected endpoints require `Authorization: Bearer <accessToken>` header.

### Health Check

```
GET /api/health
```

No auth. Returns server status + database connectivity with latency. 503 if DB is down.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 12345,
    "timestamp": "2026-06-24T12:00:00.000Z",
    "components": { "database": { "status": "ok", "latency_ms": 3 } }
  },
  "message": "Server is running"
}
```

---

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Rate Limit | Validators | Description |
|--------|----------|------|------------|------------|-------------|
| POST | `/register` | No | 10/15min | registerValidator | Create account |
| POST | `/login` | No | 10/15min | loginValidator | Login |
| POST | `/logout` | Yes | — | — | Clear refresh token |
| GET | `/me` | Yes | — | — | Get current user |
| POST | `/refresh-token` | No | 10/15min | — | Rotate refresh token |
| PUT | `/password` | Yes | 10/15min | changePasswordValidator | Change password |
| DELETE | `/me` | Yes | 10/15min | — | Delete account |

#### POST `/api/auth/register`

**Body:** `{ "name": "John Doe", "email": "john@gmail.com", "password": "StrongPass1" }`

**Validation rules:**
- `name`: min 2 characters, trimmed
- `email`: must be valid email, normalized, must end with `@gmail.com`
- `password`: min 8 chars, must contain uppercase + lowercase + digit (regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)`)

**Business logic:**
- Checks for existing user by email → 409 Conflict if exists
- Hashes password with bcrypt (10 rounds)
- Creates user in `users` table
- Generates access token (15m) with `{ userId, email }` payload
- Generates refresh token (7d) with `{ userId }` payload
- Saves refresh token hash to `refresh_tokens` table with 7-day expiry
- Sets `refreshToken` as httpOnly, secure (prod), sameSite=strict cookie (7 days)

**Response (201):**
```json
{
  "user": { "id": "uuid", "name": "John Doe", "email": "john@gmail.com" },
  "accessToken": "eyJ..."
}
```

#### POST `/api/auth/login`

**Body:** `{ "email": "john@gmail.com", "password": "StrongPass1" }`

**Validation rules:** Same email Gmail constraint as register.

**Business logic:**
- Looks up user by email → 401 if not found
- Compares password with bcrypt → 401 if mismatch
- Generates new token pair, saves refresh token, sets cookie

**Response (200):** Same shape as register.

#### POST `/api/auth/logout`

**Auth required.** Reads refresh token from cookie, deletes it from `refresh_tokens`, clears cookie.

#### GET `/api/auth/me`

**Auth required.** Returns user from `users` table (excludes password).

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

Reads `refreshToken` cookie. Verifies JWT signature, looks up in `refresh_tokens`. Rotation: deletes old token, issues new pair, saves + sets cookie.

**Response (200):** `{ accessToken: "eyJ..." }` + new cookie.

#### PUT `/api/auth/change-password`

**Body:** `{ "currentPassword": "OldPass1", "newPassword": "NewPass123!" }`

**Validation:** newPassword same rules as register password.

**Business logic:**
- Looks up user by ID with password field (`findUserByIdForAuth`)
- Verifies current password via bcrypt → 401 if wrong
- Hashes and updates new password

#### DELETE `/api/auth/me`

**Auth + rate limited.** Hard-deletes user from `users` table (CASCADE deletes all related data). Clears cookie.

---

### Coding Profiles — `/api/profiles` (Auth required)

| Method | Endpoint | Validators | Description |
|--------|----------|------------|-------------|
| POST | `/` | createProfileValidator | Create coding profile |
| GET | `/` | — | List profiles (paginated: `?page=1&limit=20`) |
| PUT | `/:id` | updateProfileValidator | Update profile username/URL |
| DELETE | `/:id` | — | Delete profile |

#### POST `/api/profiles`

**Body:** `{ "platform": "leetcode", "username": "myhandle", "profileUrl": "https://..." }`

**Valid platforms:** `leetcode`, `github`, `codeforces`, `codechef`, `gfg`, `hackerrank`

**Business logic:**
- Checks for existing profile on same platform for this user → 409 if exists
- Creates profile in `coding_profiles`

#### PUT `/api/profiles/:id`

**Body:** `{ "username": "newhandle", "profileUrl": "..." }`

**Ownership check:** Only the profile owner can update → 403 if unauthorized.

#### DELETE `/api/profiles/:id`

**Ownership check:** Only the profile owner can delete → 403 if unauthorized.

---

### Sync — `/api/sync` (Auth required, 20/hour)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/github` | Sync GitHub stats |
| POST | `/leetcode` | Sync LeetCode stats |
| POST | `/codeforces` | Sync Codeforces stats |
| POST | `/codechef` | Sync CodeChef stats |
| POST | `/gfg` | Sync GFG stats |
| POST | `/hackerrank` | Sync HackerRank stats |
| POST | `/all` | Sync all platforms |

**Business logic:**
- Each platform sync requires an existing profile for that platform → 404 if missing
- Fetches live data from external API
- Creates or updates `problem_stats` or `github_stats` record
- Sends "sync" type notification (fire-and-forget, errors logged only)
- `/all` runs each sync independently — individual failures are isolated and logged, remaining syncs continue

#### GitHub Sync Details
- Fetches: profile (repos, followers, following), repositories (multi-page, up to 500), contributions (GraphQL)
- Aggregates: total stars across repos, language distribution (count per language)
- Creates/updates `github_stats` with: repositories, followers, following, stars, contributions, languages (JSONB), commits

#### LeetCode Sync Details
- Fetches: totalSolved, easySolved, mediumSolved, hardSolved, ranking, submissionCalendar
- Computes streak from `submissionCalendar` JSON:
  - Parses calendar (supports both object and string JSON)
  - Sorts timestamps descending
  - Counts consecutive days backwards from today matching calendar entries
  - Breaks on first gap

#### Codeforces Sync Details
- Fetches: user rating, rating history
- Updates `problem_stats` with current rating
- Additionally syncs contest history (calls `contestService.syncContestHistory`)

#### CodeChef Sync Details
- Fetches: profile with currentRating
- Updates `problem_stats` rating only (no problem counts from CodeChef API)

#### GFG Sync Details
- Fetches: totalProblemsSolved, Easy, Medium, Hard counts
- Creates/updates `problem_stats` with all four counts

#### HackerRank Sync Details
- Fetches: profile (totalSolved), badges (star rating from badge IDs)
- Star rating = max of parsed badge IDs (e.g., "star:5" → 5)
- Creates/updates `problem_stats` with totalSolved and ranking (= stars)

---

### Dashboard — `/api/dashboard` (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Combined overview (problem stats + GitHub stats) |
| GET | `/charts` | Overview + weekly + monthly combined |
| GET | `/weekly` | Last 7 days daily stats |
| GET | `/monthly` | Last 30 days daily stats |
| GET | `/heatmap` | All dates with problems_solved |

**GET `/` response:**
```json
{
  "totalSolved": 150,
  "easy": 60,
  "medium": 70,
  "hard": 20,
  "streak": 14,
  "repositories": 25,
  "followers": 10,
  "contributions": 200
}
```

Data sourced from `problemStatsRepository.findProblemStatsByUserId()` (SUM across platforms) and `githubStatsRepository.findGithubStatsByUserId()`.

Heatmap/Weekly/Monthly data from `daily_stats` table.

---

### Analytics — `/api/analytics` (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/platforms` | Per-platform total solved |
| GET | `/difficulty` | Aggregated Easy/Medium/Hard counts |
| GET | `/contributions` | Daily GitHub contribution history |
| GET | `/yearly` | Monthly problem-solving progress (current year) |

All 4 endpoints use Knex query builder via `analyticsRepository.js`.

**GET `/difficulty` response:**
```json
{ "easy": 60, "medium": 70, "hard": 20 }
```

**GET `/yearly` response:**
```json
[
  { "month": 1, "problems_solved": 30 },
  { "month": 2, "problems_solved": 25 }
]
```

---

### Notifications — `/api/notifications` (Auth required)

| Method | Endpoint | Validators | Description |
|--------|----------|------------|-------------|
| POST | `/` | createNotificationValidator | Create a notification |
| GET | `/` | — | List notifications (`?page=1&limit=20`) |
| PATCH | `/:id` | — | Mark as read |
| DELETE | `/:id` | — | Delete notification |

**Valid types:** `achievement`, `contest`, `weekly_report`, `streak`, `sync`

**Business logic:**
- Creation emits `notification:new` event to user's Socket.IO room
- Real-time emit failures are non-blocking (logged only)
- Mark-as-read and delete check ownership → 403 if unauthorized

---

### Achievements — `/api/achievements` (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all earned achievements |
| POST | `/` | Check and unlock new achievements |

**Achievement definitions:**

| Title | Type | Condition |
|-------|------|-----------|
| Problem Solver 🥉 | `problem` | `totalSolved >= 100` |
| Advanced Problem Solver 🥈 | `problem` | `totalSolved >= 500` |
| Problem Master 🥇 | `problem` | `totalSolved >= 1000` |
| 7-Day Streak 🔥 | `streak` | `streak >= 7` |
| GitHub Explorer ⭐ | `contribution` | `contributions >= 100` |

**Business logic:**
- `checkAchievements` runs all checks and unlocks any new ones
- Idempotent: `unlockAchievement` checks for existing title first → no duplicate unlocks
- Unlocking sends "achievement" notification

---

### Contests — `/api/contests`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Contest history (`?page=1&limit=20`) |
| GET | `/upcoming` | No (500/15min) | Upcoming Codeforces contests |
| GET | `/rating` | Yes | Rating graph data |
| POST | `/sync` | Yes | Sync contest history from Codeforces |

**Business logic:**
- Contest history requires Codeforces profile → 404 if missing
- `syncContestHistory` fetches ratings from Codeforces API, deduplicates by contest name
- Upcoming contests filtered by phase="BEFORE", sorted by start time

---

### AI Insights — `/api/ai` (Auth required, 50/hour)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/insights` | AI-generated analysis of coding stats |
| GET | `/recommendations` | Personalized improvement suggestions |
| GET | `/weakness` | Honest-but-kind areas to improve |

**Business logic:**
- Each endpoint builds a prompt from current stats and sends to Groq AI
- System prompt sets "friendly coding buddy" persona
- Temperature: 0.8 (no system prompt) or 0.3 (with system prompt)
- Insights/Weakness use overview stats; Recommendations use difficulty distribution
- Newlines stripped from response (unless system prompt is provided)

---

### Daily Stats — `/api/daily-stats` (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Last 7 days of daily stats |
| POST | `/populate` | Snapshot today's stats |

**Business logic:**
- `populate` fetches current overview stats and upserts into `daily_stats` for today's date
- Uses `INSERT ... ON CONFLICT (user_id, date) DO UPDATE` — idempotent if run multiple times

---

### Goals — `/api/goals` (Auth required)

| Method | Endpoint | Validators | Description |
|--------|----------|------------|-------------|
| POST | `/` | createGoalValidator | Create goal |
| GET | `/` | — | List all goals |
| GET | `/:id` | — | Get single goal |
| PATCH | `/:id/progress` | updateGoalValidator | Update progress |
| DELETE | `/:id` | — | Delete goal |

#### POST `/api/goals`

**Body:** `{ "target": 100, "month": 6, "year": 2026 }`

**Validation:** target >= 1, month 1-12 (optional), year >= 2025 (optional).

#### PATCH `/api/goals/:id/progress`

**Body:** `{ "current_progress": 50 }`

**Validation:** current_progress >= 0.

**Ownership check** enforced via `getGoalById` → 403 if not owner.

---

### Friends — `/api/friends` (Auth required)

| Method | Endpoint | Validators | Description |
|--------|----------|------------|-------------|
| POST | `/` | sendFriendRequestValidator | Send friend request |
| GET | `/` | — | List accepted friends |
| GET | `/pending` | — | List incoming pending requests |
| PATCH | `/:id/accept` | — | Accept pending request |
| PATCH | `/:id/reject` | — | Reject pending request |
| PATCH | `/:id/block` | — | Block friend |
| DELETE | `/:id` | — | Remove friend |

#### POST `/api/friends`

**Body:** `{ "friendEmail": "friend@gmail.com" }`

**Business logic:**
- Looks up friend by email → 404 if not found
- Cannot send request to yourself → 400
- Checks for existing bidirectional friendship → 409 if exists
- Creates friendship with status `pending`
- Sends "friend" notification to recipient

#### PATCH `/:id/accept` / `reject`

**Business logic:**
- Only the recipient (`friend_id`) can accept/reject → 403 if not recipient
- Status must be `pending` → 400 if already accepted/rejected/blocked

#### PATCH `/:id/block`

**Business logic:** Either party can block → checks `user_id` or `friend_id` match.

#### DELETE `/:id`

**Business logic:** Either party can remove. Hard deletes from `friends` table.

---

### Leaderboard — `/api/leaderboard` (500/15min)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Global leaderboard (`?page=1&limit=50`) |
| GET | `/friends` | Yes | Friends-only leaderboard |
| GET | `/platform/:platform` | No | Platform-specific leaderboard |
| GET | `/streaks` | No | Top 10 streaks |
| GET | `/contributions` | No | Top 10 contributors |

**Ranking logic (all use Knex query builder via `leaderboardRepository.js`):**

| Endpoint | Sort | Filter |
|----------|------|--------|
| Global | `SUM(ps.total_solved) DESC` | Users with at least one coding profile |
| Friends | `SUM(ps.total_solved) DESC` | Only accepted friendships |
| Platform | `ps.total_solved DESC` | Filtered by `cp.platform = :platform` |
| Streaks | `MAX(ps.streak) DESC` | Top 10 across all users |
| Contributions | `MAX(gs.contributions) DESC` | Top 10 across all users |

**Global leaderboard response shape:**
```json
{
  "data": [
    { "id": "uuid", "name": "John", "avatar": null, "total_solved": 150, "streak": 14, "contributions": 200 }
  ],
  "page": 1,
  "limit": 50,
  "total": 100,
  "totalPages": 2
}
```

---

### Reports — `/api/reports` (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate AI-powered weekly report |

**Business logic:**
- Gathers: overview stats, achievements, goals, recent activities (10 most recent)
- Builds prompt requesting JSON: `{ "summary": "...", "recommendations": "..." }`
- Sends to Groq AI with system prompt: "always respond in valid JSON, no markdown"
- Parses response with 3 fallback strategies:
  1. Direct `JSON.parse` after cleaning markdown fences
  2. Extract first `{...}` block
  3. Regex extraction of summary/recommendations strings
  4. Fallback to truncated raw text
- Saves to `weekly_reports` table with computed week_start/week_end (previous Monday-Sunday)

---

### Contest Reminders — `/api/contest-reminders` (Auth required)

| Method | Endpoint | Validators | Description |
|--------|----------|------------|-------------|
| POST | `/` | createReminderValidator | Create reminder |
| GET | `/` | — | List reminders |
| DELETE | `/:id` | — | Delete reminder |

#### POST `/api/contest-reminders`

**Body:** `{ "platform": "codeforces", "minutes_before": 30 }`

**Valid platforms:** `leetcode`, `codeforces`, `codechef`
**minutes_before:** 10-60

---

### Public Profile — `/api/public` (500/15min)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:username` | Get public profile by name |

**Business logic:**
- Looks up user by name (case-insensitive?) → 404 if not found
- Gathers: profiles, achievements, recent activities, aggregated stats
- Returns safe subset: id, name, avatar, bio (no email, no password)

---

### Export — `/api/export` (Auth required)

| Method | Endpoint | Content-Type | Description |
|--------|----------|-------------|-------------|
| GET | `/json` | `application/json` | Download all user data as JSON |
| GET | `/pdf` | `application/pdf` | Download PDF report |
| GET | `/png` | `image/png` | Download PNG stats card |

**JSON Export:** Gathers user info + stats + profiles + achievements + activities in parallel, returns combined object.

**PDF Export:** Uses PDFKit to generate document with:
- Title page "DEVTRACK AI REPORT"
- Name, email, total solved, streak, contributions
- Profiles list
- Achievements list
- Recent activities descriptions

**PNG Export:** Renders an SVG card via Sharp to PNG (600×400), containing:
- Dark theme header with "DEVTRACK AI" branding
- User name, email
- Stats: Total Solved, Streak, GitHub Contributions
- Up to 3 connected platforms with usernames

---

### Email Preferences — `/api/email-preferences` (Auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get current preferences |
| PUT | `/` | Update preferences |

**Body:** `{ "weekly_report": true, "contest_reminder": false, "streak_alert": true, "achievement_alert": true }`

All fields optional booleans. Unset fields keep existing values (upsert behavior).

Default preferences created on first access: all true.

---

## Database Schema

### Tables (15 total)

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default `gen_random_uuid()` |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE, indexed |
| password | TEXT | NOT NULL |
| avatar | TEXT | nullable |
| bio | TEXT | nullable |
| is_verified | BOOLEAN | default false |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated via trigger |

#### `refresh_tokens`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| token | TEXT | NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | default now() |

#### `coding_profiles`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| platform | platform_type | NOT NULL (enum) |
| username | VARCHAR(100) | NOT NULL |
| profile_url | TEXT | nullable |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated |
| UNIQUE(user_id, platform) | | |
| INDEX(platform) | | |

#### `problem_stats`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| profile_id | UUID | NOT NULL, UNIQUE, FK → coding_profiles(id) ON DELETE CASCADE |
| total_solved | INTEGER | default 0 |
| easy_count | INTEGER | default 0 |
| medium_count | INTEGER | default 0 |
| hard_count | INTEGER | default 0 |
| rating | INTEGER | nullable |
| ranking | INTEGER | nullable |
| streak | INTEGER | default 0 |
| last_synced | TIMESTAMP | nullable |
| updated_at | TIMESTAMP | default now(), auto-updated |

#### `github_stats`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| profile_id | UUID | NOT NULL, UNIQUE, FK → coding_profiles(id) ON DELETE CASCADE |
| repositories | INTEGER | default 0 |
| followers | INTEGER | default 0 |
| following | INTEGER | default 0 |
| stars | INTEGER | default 0 |
| commits | INTEGER | default 0 |
| contributions | INTEGER | default 0 |
| languages | JSONB | nullable |
| last_synced | TIMESTAMP | nullable |
| updated_at | TIMESTAMP | default now(), auto-updated |

#### `daily_stats`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| date | DATE | NOT NULL |
| problems_solved | INTEGER | default 0 |
| easy_count | INTEGER | default 0 |
| medium_count | INTEGER | default 0 |
| hard_count | INTEGER | default 0 |
| github_contributions | INTEGER | default 0 |
| created_at | TIMESTAMP | default now() |
| UNIQUE(user_id, date) | | |
| INDEX(user_id, date) | | |
| INDEX(date) | | |

#### `contest_history`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| profile_id | UUID | NOT NULL, FK → coding_profiles(id) ON DELETE CASCADE, indexed |
| contest_name | VARCHAR(255) | NOT NULL |
| rank | INTEGER | nullable |
| rating_change | INTEGER | nullable |
| new_rating | INTEGER | nullable |
| contest_date | TIMESTAMP | nullable, indexed |

#### `achievements`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| type | achievement_type | NOT NULL (enum) |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| icon | TEXT | nullable |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated |

#### `notifications`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| type | notification_type | NOT NULL (enum) |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | default false, indexed |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated |

#### `goals`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| target | INTEGER | NOT NULL, CHECK(target > 0) |
| current_progress | INTEGER | default 0, CHECK(current_progress >= 0) |
| month | INTEGER | nullable, CHECK(1-12) |
| year | INTEGER | nullable, CHECK(>= 2025) |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated |
| INDEX(month, year) | | |

#### `friends`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE |
| friend_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| status | friend_status | default 'pending' (enum) |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated |
| UNIQUE(user_id, friend_id) | | |
| CHECK(user_id <> friend_id) | | |

#### `activity_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| action | VARCHAR(255) | NOT NULL |
| metadata | JSONB | nullable |
| created_at | TIMESTAMP | default now() |

#### `email_preferences`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, UNIQUE, FK → users(id) ON DELETE CASCADE |
| weekly_report | BOOLEAN | default true |
| contest_reminder | BOOLEAN | default true |
| streak_alert | BOOLEAN | default true |
| achievement_alert | BOOLEAN | default true |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | default now(), auto-updated |

#### `contest_reminders`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| platform | platform_type | NOT NULL (enum) |
| minutes_before | INTEGER | default 10 |
| is_active | BOOLEAN | default true, indexed |
| created_at | TIMESTAMP | default now() |

#### `weekly_reports`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | NOT NULL, FK → users(id) ON DELETE CASCADE, indexed |
| week_start | DATE | NOT NULL |
| week_end | DATE | NOT NULL |
| summary | TEXT | nullable |
| recommendations | TEXT | nullable |
| created_at | TIMESTAMP | default now() |
| INDEX(week_start) | | |

---

## Database Enums & Constraints

### Enums

| Name | Values |
|------|--------|
| `platform_type` | `'leetcode', 'github', 'codechef', 'codeforces', 'gfg', 'hackerrank'` |
| `notification_type` | `'achievement', 'contest', 'weekly_report', 'streak', 'sync', 'friend'` |
| `achievement_type` | `'streak', 'problem', 'contest', 'contribution'` |
| `friend_status` | `'pending', 'accepted', 'rejected', 'blocked'` |

### Unique Constraints

| Table | Constraint |
|-------|------------|
| `coding_profiles` | UNIQUE(user_id, platform) — one profile per platform per user |
| `daily_stats` | UNIQUE(user_id, date) — one snapshot per day per user |
| `friends` | UNIQUE(user_id, friend_id) — no duplicate friendships |
| `email_preferences` | UNIQUE(user_id) — one preference row per user |
| `problem_stats` | UNIQUE(profile_id) — one stats row per profile |
| `github_stats` | UNIQUE(profile_id) — one stats row per profile |
| `users` | UNIQUE(email) |

### Check Constraints

| Table | Constraint |
|-------|------------|
| `friends` | CHECK(user_id <> friend_id) — no self-friendships |
| `goals` | CHECK(target > 0) |
| `users` | CHECK(char_length(name) >= 2) |

### Triggers

The `update_updated_at_column()` function fires on `BEFORE UPDATE` for:
`users`, `coding_profiles`, `problem_stats`, `github_stats`, `notifications`, `achievements`, `goals`, `friends`, `email_preferences`

### Foreign Key Cascades

All FKs use `ON DELETE CASCADE` — deleting a user removes all related data.

---

## Business Logic & Validation Rules

### Authentication
- **Email format:** Only `@gmail.com` addresses accepted (validated at both validator and normalization level)
- **Password policy:** Min 8 chars, must contain uppercase + lowercase + digit
- **Bcrypt rounds:** 10 salt rounds
- **Access token:** 15m expiry, payload `{ userId, email }`, signed with `JWT_SECRET`
- **Refresh token:** 7d expiry, payload `{ userId }`, signed with `JWT_REFRESH_SECRET`
- **Token rotation:** Each refresh invalidates old token, issues new pair
- **Deactivated accounts:** Blocked at auth middleware level (`is_active = false` → 403)

### Profile Management
- **Uniqueness:** One profile per platform per user (unique constraint + explicit check)
- **Ownership:** Update/delete require `profile.user_id === req.user.id` → 403
- **Valid platforms:** `leetcode`, `github`, `codeforces`, `codechef`, `gfg`, `hackerrank`

### Sync Rules
- **Profile required:** Each platform sync requires an existing linked profile → 404
- **Streak calculation:** Consecutive days backwards from today using LeetCode's `submissionCalendar`
- **Contribution fallback:** Without `GITHUB_TOKEN`, contributions = 0 (warn logged)
- **Error isolation:** `/all` sync catches per-platform errors individually — one failure doesn't stop others
- **Notifications:** Sync completion fires fire-and-forget notification (errors logged, not propagated)

### Achievements
- **5 predefined achievements** with fixed thresholds
- **Idempotent unlocking:** Checks for existing title before creating duplicate
- **Auto-notification:** Each unlock fires an "achievement" notification

### Friend System
- **Bidirectional check:** `findFriendship` checks both `(user_id, friend_id)` orientations
- **Self-request blocked:** Check `friend.id === userId` → 400
- **Status lifecycle:** `pending` → `accepted` | `rejected` | `blocked`
- **Access control for accept/reject:** Only the recipient (`friend_id`) can accept/reject
- **Access control for block/remove:** Either party can block or remove
- **Status validation:** Accept/reject requires current status = `pending`

### Contest Reminders
- **Deduplication:** Checks for existing notification for same contest within last hour before sending
- **Platform restriction:** Only `leetcode`, `codeforces`, `codechef` available (validated)
- **Time window:** `minutes_before` must be between 10-60
- **Ownership:** Delete checks `reminder.user_id === userId` → 403

### Goal Tracking
- **Ownership enforced:** All read/update/delete operations check `goal.user_id === userId` → 403
- **Validation:** target >= 1, month 1-12 (optional), year >= 2025 (optional), progress >= 0

### Leaderboard
- **Global:** Includes only users with at least one coding profile (uses `WHERE EXISTS`)
- **Friends:** Uses `f.status = 'accepted'` filter with bidirectional user matching
- **Top 10 limits:** Streaks and contributions capped at top 10; global supports pagination

### Weekly Reports
- **AI fallback chain:** Direct JSON parse → brace extraction → regex extraction → truncated fallback
- **Week boundary:** Computed as previous Monday 00:00:00 to Sunday 23:59:59
- **Period check:** `diffToMonday` handles Sunday edge case (day 0 → 6 days back to Monday)

### Export
- **Format-specific content:** JSON = raw data dump; PDF = PDFKit document; PNG = SVG rendered via Sharp
- **Parallel queries:** All export types gather user info + stats + profiles + achievements + activities concurrently

### Email Service
- **No-op mode:** Without SMTP_USER/PASS, all emails silently log and skip
- **Template functions:** `sendWeeklyReportEmail`, `sendContestReminderEmail`, `sendStreakAlertEmail`
- **HTML escaping:** `escHtml()` used in all email templates

### Socket.IO
- **JWT auth at handshake:** Token from `socket.handshake.auth.token`
- **Room join on `join` event:** Only allows joining own userId room
- **Real-time push:** `notification:new` emitted when notifications created

---

## Scheduled Jobs

All jobs are initialized in `server.js` via `initializeJobs()` and started once the DB is connected.

| Job | File | Cron Schedule | Lock Name | Description |
|-----|------|---------------|-----------|-------------|
| GitHub Sync | `jobs/githubSyncJob.js` | `0 */6 * * *` (every 6 hours) | `github-sync` | Syncs GitHub stats for all active users |
| LeetCode Sync | `jobs/leetcodeSyncJob.js` | `0 */6 * * *` (every 6 hours) | `leetcode-sync` | Syncs LeetCode stats for all active users |
| Codeforces Sync | `jobs/codeforcesSyncJob.js` | `0 */6 * * *` (every 6 hours) | `codeforces-sync` | Syncs Codeforces stats + contest history for all active users |
| CodeChef Sync | `jobs/codechefSyncJob.js` | `0 */6 * * *` (every 6 hours) | `codechef-sync` | Syncs CodeChef stats for all active users |
| GFG Sync | `jobs/gfgSyncJob.js` | `0 */6 * * *` (every 6 hours) | `gfg-sync` | Syncs GFG stats for all active users |
| Achievements | `jobs/achievementJob.js` | `0 0 * * *` (daily at midnight) | `achievement` | Checks and unlocks achievements for all active users |
| Daily Stats | `jobs/dailyStatsJob.js` | `0 0 * * *` (daily at midnight) | `daily-stats` | Snapshots today's stats for all active users |
| Weekly Report | `jobs/weeklyReportJob.js` | `0 9 * * 1` (Mondays 9 AM) | `weekly-report` | Generates AI weekly reports for all active users |
| Contest Reminder | `jobs/contestReminderJob.js` | `*/5 * * * *` (every 5 minutes) | `contest-reminder` | Checks Codeforces upcoming contests, sends notifications for matching reminders |

### Lock Mechanism (`jobTracker.js`)

All jobs are wrapped with `withLock(name, fn)` which uses an in-memory `Map` to prevent overlapping executions:

```javascript
if (locks.get(name)) {
    logger.warn(`Job "${name}" skipped — already running`);
    return;
}
locks.set(name, true);
try { await fn(); } finally { locks.set(name, false); }
```

If a job's execution takes longer than its cron interval, subsequent ticks are silently skipped and logged.

### Cron Tracking (`cronTracker.js`)

All cron tasks are registered via `track(task)` and stopped on graceful shutdown via `stopAll()`.

---

## Integrations (External APIs)

### GitHub — `integrations/github/githubService.js`

| Method | Endpoint | Type | Description |
|--------|----------|------|-------------|
| `fetchGithubProfile` | `GET https://api.github.com/users/{username}` | REST | Repos count, followers, following |
| `fetchGithubRepositories` | `GET .../users/{username}/repos?per_page=100&page=N` | REST | Multi-page (up to 5 pages = 500 repos), aggregates stars + languages |
| `fetchGithubContributions` | `POST https://api.github.com/graphql` | GraphQL | Contributions calendar total (via `contributionsCollection`) |

- **Auth:** Optional `GITHUB_TOKEN` in `Authorization: Bearer` header
- **Without token:** Contributions returns 0, profile/repos still work at lower rate limit
- **Multi-page:** `fetchAllPages` loops while page <= 5 and response has 100 items

### LeetCode — `integrations/leetcode/leetcodeService.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `fetchLeetCodeProfile` | `GET https://alfa-leetcode-api.onrender.com/{username}` | Returns totalSolved, easySolved, mediumSolved, hardSolved, ranking, submissionCalendar |

- **No auth required** (uses public render.com API)
- **submissionCalendar:** Used for streak calculation (object of `{ timestamp: count }`)

### Codeforces — `integrations/codeforces/codeforcesService.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `fetchCodeforcesProfile` | `GET https://codeforces.com/api/user.info?handles={handle}` | Current rating |
| `fetchCodeforcesRatingHistory` | `GET https://codeforces.com/api/user.rating?handle={handle}` | Full contest history with rating changes |
| `fetchCodeforcesUpcomingContests` | `GET https://codeforces.com/api/contest.list?gym=false` | Filtered to phase="BEFORE" |

- **Validation:** Accepts both 200 and 400 responses (400 means user not found)
- **Error handling:** Checks `data.status === "FAILED"` explicitly

### CodeChef — `integrations/codechef/codechefService.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `fetchCodeChefProfile` | `GET https://codechef-stats-api-two.vercel.app/profile/{username}` | Profile with currentRating |

### GFG — `integrations/gfg/gfgService.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `fetchGFGProfile` | `GET https://gfg-stats.tashif.codes/{username}` | totalProblemsSolved, Easy, Medium, Hard |

### HackerRank — `integrations/hackerrank/hackerrankService.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `fetchHackerRankProfile` | `GET https://hackerrank-stats-api.vercel.app/{username}` | totalSolved |
| `fetchHackerRankBadges` | `GET https://hackerrank-stats-api.vercel.app/{username}/badges` | Badges with IDs like "star:5" for ranking |

### Groq AI — `integrations/groq/groqService.js`

| Method | Model | Default | Description |
|--------|-------|---------|-------------|
| `generateResponse` | `GROQ_MODEL` | `llama-3.3-70b-versatile` | Chat completion with system prompt support |

- **Timeout:** 30 seconds
- **Temperature:** 0.3 (structured/system prompts) or 0.8 (creative)
- **System prompt (default):** "friendly coding buddy" persona
- **Error handling:** Wraps Groq SDK errors with 503 status

---

## Middleware Pipeline

Order of middleware execution in `app.js`:

```
1. helmet()                    → Security headers (CSP, X-Frame-Options, etc.)
2. cors()                      → CORS restricted to CLIENT_URL, credentials enabled
3. express.json(10kb)          → JSON body parsing, 10KB limit
4. express.urlencoded(10kb)    → URL-encoded body parsing, 10KB limit
5. compression()               → Gzip response compression
6. morgan("combined")          → HTTP request logging via Winston stream (skips /api/health)
7. cookieParser()              → Cookie parsing
8. apiLimiter                  → Global rate limit: 500/15min
9. app routes                  → Route-matched middlewares + controllers
10. Sentry.setupExpressErrorHandler() → Sentry error handler
11. notFoundMiddleware         → 404 catch-all
12. errorMiddleware            → Centralized error handler
```

### Rate Limiters

| Limiter | Window | Max | Applied To |
|---------|--------|-----|------------|
| `apiLimiter` (global) | 15 min | 500 | All routes (applied in app.js) |
| `authLimiter` | 15 min | 10 | POST /api/auth/register, login, refresh-token, password, delete |
| `syncLimiter` | 1 hour | 20 | POST /api/sync/* |
| `aiLimiter` | 1 hour | 50 | GET /api/ai/* |

All rate limiters use in-memory store (default MemoryStore), standard headers, no legacy headers.

### Auth Middleware

`protect` middleware:
1. Checks `Authorization: Bearer <token>` header
2. Verifies JWT signature with `JWT_SECRET`
3. Checks presence of `userId` in decoded payload
4. Looks up user by ID in database → 401 if not found
5. Checks `is_active` → 403 if deactivated
6. Attaches `req.user` for downstream use

### Validation Middleware

`validate` middleware:
1. Runs `validationResult(req)` from express-validator
2. Returns first error as `400 { success: false, message: "field: error msg" }`
3. Passes through if no errors

---

## Real-Time Notifications (Socket.IO)

### Initialization (`config/socket.js`)

- CORS set to `CLIENT_URL` with credentials
- JWT auth middleware on handshake: verifies token from `socket.handshake.auth.token`
- On connection: listens for `join` event → joins room matching `socket.userId`
- Room join is self-only (rejects joining another user's room)

### Notification Emission (`services/notificationService.js`)

When `sendNotification` is called:
1. Saves notification to database
2. Gets Socket.IO instance via `getIO()`
3. Emits `notification:new` event to user's room: `io.to(userId).emit("notification:new", notification)`
4. If Socket.IO not initialized, logs warning but doesn't fail the request

---

## Error Handling

### ApiError Class (`utils/ApiError.js`)

Custom error with `statusCode` property:

```javascript
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
```

### Async Handler (`utils/asyncHandler.js`)

Wraps async route handlers to catch rejected promises and forward to Express error middleware:

```javascript
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
```

### Error Middleware (`middlewares/errorMiddleware.js`)

1. **JSON Syntax Error:** `entity.parse.failed` → 400 "Invalid JSON in request body"
2. **Payload Too Large:** `entity.too.large` → 413 "Request body too large"
3. **ApiError or other errors:** Uses `err.statusCode || err.response?.status || 500`
4. **5xx errors:** Logs full stack trace via Winston
5. Returns: `{ success: false, data: null, message: err.message }`

### Sentry Integration

- Initialized in `app.js` with `Sentry.expressIntegration()`
- DSN from `SENTRY_DSN` env var
- 0.1 trace sample rate in production, 0.0 in development
- Profiling sample rate same as traces
- `Sentry.setupExpressErrorHandler(app)` registered before our error middleware
- Unhandled rejections and exceptions captured via Sentry in `server.js`

### Server-Level Error Handlers (`server.js`)

- `unhandledRejection`: Captures via Sentry, logs, exits with code 1
- `uncaughtException`: Captures via Sentry, logs, exits with code 1

### Not Found Middleware (`middlewares/notFoundMiddleware.js`)

Returns 404 with `{ success: false, message: "Route <originalUrl> not found" }`.

---

## Response Format & HTTP Status Codes

### Standard Success Response

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Standard Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

### HTTP Status Codes Used

| Status | Constant | When |
|--------|----------|------|
| 200 | `OK` | Successful GET, PUT, PATCH, DELETE, POST (login, logout, etc.) |
| 201 | `CREATED` | Successful POST (register, create profile, goal, notification, etc.) |
| 204 | `NO_CONTENT` | Defined but not used in current code |
| 400 | `BAD_REQUEST` | Validation errors, self-friend-request, invalid JSON, payload too large |
| 401 | `UNAUTHORIZED` | Missing/invalid JWT, wrong credentials |
| 403 | `FORBIDDEN` | Ownership check failed, deactivated account |
| 404 | `NOT_FOUND` | Resource not found, unmatched route |
| 409 | `CONFLICT` | Duplicate user, duplicate profile, existing friendship |
| 413 | `PAYLOAD_TOO_LARGE` | Request body exceeds 10KB |
| 422 | `UNPROCESSABLE_ENTITY` | Defined but not used in current code |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Unhandled server errors |
| 503 | `SERVICE_UNAVAILABLE` | DB down, external API unavailable, health check degraded |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-restart on changes) |
| `npm start` | Production start (`node src/server.js`) |
| `npm run migrate` | Run pending knex migrations |
| `npm run migrate:make <name>` | Create a new migration file |
| `npm run migrate:rollback` | Roll back the last migration batch |
| `npm run migrate:status` | Show migration completion status |

---

## Deployment

**Live URL:** [https://algoryn.onrender.com](https://algoryn.onrender.com)

**Dashboard:** [https://dashboard.render.com](https://dashboard.render.com)

### Render (current host)

1. Create a new Web Service, connect your GitHub repo
2. Set **Root Directory** to `server/`
3. Render auto-detects the **Dockerfile** — build and start are automatic
4. Add environment variables in Render dashboard (see [Environment Variables](#environment-variables))
5. Set `NODE_ENV=production` explicitly
6. Set health check path to `/api/health`

**Note:** Render's free tier sleeps after 15 minutes of inactivity. Cron jobs won't run while sleeping. Use an uptime monitor (e.g., UptimeRobot, pinging every 5 minutes) to keep the service awake.

### Local Docker

```bash
cd server
docker build -t algoryn-server .
docker run -p 5000:5000 --env-file .env.production algoryn-server
```

### Environment File Loading

The app loads `server/.env.<NODE_ENV>` on startup:
- Development: `server/.env.development`
- Production: `server/.env.production` (Render injects these via dashboard — no file needed)
- Test: `server/.env.test`

NODE_ENV defaults to `"development"` if not set.
