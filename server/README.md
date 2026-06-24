# DevTrack AI — Backend

Your personal developer analytics platform backend.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (NeonDB)
- **Auth:** JWT (access + refresh tokens)
- **AI:** Groq (llama-3.3-70b-versatile)
- **Scheduling:** node-cron
- **Real-time:** Socket.IO

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database (NeonDB or local)

### Installation

```bash
cd server
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Running

```bash
# development
npm run dev

# production
npm start
```

## Project Structure

```
server/src
├── config/          # DB, email, socket config
├── constants/       # HTTP status codes
├── controllers/     # Route handlers
├── integrations/   # External API clients (GitHub, LeetCode, Codeforces, etc.)
├── jobs/           # Scheduled cron jobs
├── middlewares/     # Auth, rate limiting, validation, error handling
├── repositories/   # Data access layer (SQL queries)
├── routes/         # Express route definitions
├── services/       # Business logic layer
├── utils/          # Helpers (logger, tokens, responses)
├── validators/     # express-validator rules
├── app.js          # Express app setup
└── server.js       # Entry point
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| POST | `/api/profiles` | Add coding profile |
| GET | `/api/profiles` | List profiles |
| POST | `/api/sync/github` | Sync GitHub |
| POST | `/api/sync/leetcode` | Sync LeetCode |
| POST | `/api/sync/all` | Sync all platforms |
| GET | `/api/dashboard` | Dashboard overview |
| GET | `/api/analytics/platforms` | Platform comparison |
| GET | `/api/contests/upcoming` | Upcoming contests |
| GET | `/api/ai/insights` | AI insights |
| ... | ... | See routes/ for full list |

## Cron Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| GitHub Sync | Every 6 hours | Sync all GitHub profiles |
| LeetCode Sync | Every 6 hours | Sync all LeetCode profiles |
| Codeforces Sync | Every 6 hours | Sync all Codeforces profiles |
| CodeChef Sync | Every 6 hours | Sync all CodeChef profiles |
| GFG Sync | Every 6 hours | Sync all GFG profiles |
| Daily Stats | Midnight | Populate daily stats |
| Weekly Report | Mon 9 AM | Generate weekly reports |
| Achievements | Midnight | Check for new achievements |
| Contest Reminders | Every hour | Notify about upcoming contests |
