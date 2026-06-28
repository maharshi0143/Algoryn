# Algoryn — Production Readiness Audit & Fix Plan

## Executive Summary

**Project Health Score: 45/100** — Not Production Ready ❌

Critical secrets are committed to the repo, the database schema is out of sync with the code (missing columns will crash the app), auth tokens are stored in localStorage (XSS-vulnerable), JWT secrets are weak defaults, and multiple features (profile edit, export, password change, delete account) are non-functional due to missing API routes.

---

## Phase 1 — Fix Deployment-Critical Issues (BLOCKERS)

### 1.1 Rotate ALL Exposed Secrets
**Severity: CRITICAL**

Secrets committed in `.env.development` and `.env`:
- `DATABASE_URL` — PostgreSQL with credentials
- `GROQ_API_KEY` — AI API access
- `GITHUB_TOKEN` — GitHub PAT
- `RESEND_API_KEY` — Email service
- `SENTRY_DSN` — Error reporting
- `SMTP_PASS` — Gmail app password
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Weak defaults

**Action:** Generate new secrets, update `.env` files, add `.env*` to `.gitignore`, purge from git history.

### 1.2 Fix Missing DB Columns That Crash the App
**Severity: CRITICAL**

Two columns referenced in queries but missing from migrations + schema:
- `daily_stats.cumulative_total` — referenced by `upsertDailyStats` (claims XP will crash)
- `problem_stats.skills` — referenced by `createProblemStats`/`updateProblemStats` (HackerRank sync will crash)

**Action:** Create a proper knex migration `20260628_add_cumulative_total_and_skills.js`:
```js
exports.up = (knex) =>
  knex.schema
    .table("daily_stats", (t) => t.integer("cumulative_total").notNullable().defaultTo(0))
    .table("problem_stats", (t) => t.jsonb("skills").defaultTo([]));
```

Also update `database/schema.sql` to match.

### 1.3 Fix Empty Migration `009_add_email_verification_columns.js`
**Severity: HIGH**

The migration is a no-op (`up` is empty). Anyone running `knex migrate:latest` on a fresh DB will miss `verification_token_hash` and `verification_token_expires_at`.

**Action:** Implement the missing migration body.

### 1.4 Fix Weak JWT Secrets
**Severity: CRITICAL**

Both `.env` files have `your_access_token_secret` and `your_refresh_token_secret`.

**Action:** Generate strong secrets (e.g., `openssl rand -hex 64`) and update.

---

## Phase 2 — Fix Broken User Features

### 2.1 Profile Edit Not Working
**In `client/src/services/userService.js`** — likely missing `updatePlatform(username, platform)` method or the API route isn't registered.

**Check:** 
- Does `userService.updatePlatform()` exist?
- Does `server/src/routes/profileRoutes.js` have a `PUT /profiles/:id` route?
- Does `profileService.updateProfile()` handle username + profile URL correctly?

### 2.2 Export Data Not Working
**Check:**
- Does `client/src/pages/Settings/index.jsx` have export handlers?
- Are export routes registered in `server/src/routes/exportRoutes.js`?
- Does the export controller exist?

### 2.3 Delete Account Not Working
**Check:**
- Settings page delete flow
- Does `DELETE /api/auth/account` route exist?
- Cascade deletes for user data

### 2.4 Password Change Not Working
**Check:**
- Settings page change password handler
- `POST /api/auth/change-password` route
- `authService.changePassword()` implementation

### 2.5 Redirect After Registration
Check if registration redirects to `/intro` instead of `/login`. Fix redirect logic in `authStore` or the Register component.

### 2.6 Friend Requests Not Working
Verify the full friend request flow: send → accept/reject → notification.

### 2.7 Achievements Loading Slowly
Optimize achievement query, add caching, improve skeleton loading.

### 2.8 Add Logout Button to Profile
Add logout button to `client/src/pages/Profile/index.jsx`.

### 2.9 Add Notification Indicator
Add unread count badge to the notification icon in `RootLayout.jsx`.

---

## Phase 3 — Security Fixes

### 3.1 Move Access Token from localStorage to httpOnly Cookie
**Severity: CRITICAL**

Currently: `localStorage.getItem("algoryn-auth")` → attached to axios headers.
Fix: Use httpOnly cookies for access tokens (same as refresh token). Backend already supports `withCredentials: true`.

### 3.2 Fix Refresh Token Rotation Bug
**Severity: HIGH**

In `authService.refreshUserToken()` — delete the OLD token FIRST, then save the NEW one. Currently reversed, allowing both tokens to remain valid on delete failure.

### 3.3 Add Content Security Policy (Helmet)
**Severity: HIGH**

Helmet is used but CSP is disabled by default. Configure `helmet.contentSecurityPolicy()` with appropriate directives.

### 3.4 Add Missing `trust proxy` for Rate Limiters
**Severity: MEDIUM**

IP-based rate limiting behind a reverse proxy (Render/Railway) sees all traffic as the proxy IP. Ensure `app.set("trust proxy", 1)` is set (already done) and rate limiters use `validate: { xForwardedForHeader: true }`.

### 3.5 Sanitize Error Messages in Production
**Severity: MEDIUM**

`errorMiddleware.js` returns raw `err.message` — could leak DB details, stack traces, internal paths.

### 3.6 Fix Missing Input Length Validation
**Severity: LOW**

Add max-length validation to username, bio, and other string fields in express-validators.

---

## Phase 4 — Database & Performance Fixes

### 4.1 Fix N+1 Queries in Cron Jobs
All 8 cron jobs call `findAllUsers()` then iterate with individual queries. Fetch all profiles in one batch query per platform instead.

### 4.2 Add Missing Indexes
- `friends(user_id)` — missing, causes full table scans for friend queries
- `daily_stats(user_id, date)` — already unique, good

### 4.3 Add Database Transactions
Wrap multi-table operations (sync functions, registration, friend requests) in BEGIN/COMMIT/ROLLBACK.

### 4.4 Reduce JWT Access Token Expiry to 15m
Change `JWT_EXPIRES_IN` from `1d` to `15m` in the active `.env`.

### 4.5 Increase bcrypt Rounds to 12
Change `bcrypt.hash(password, 10)` → `bcrypt.hash(password, 12)`.

---

## Phase 5 — Frontend Fixes

### 5.1 Fix Tooltip Memory Leak
Use `useRef` for the timeout variable instead of local `let`.

### 5.2 Remove Dead Code
- Unused CSS: `App.css`, `index.css` (never imported)
- Unused assets: `image.png` (97KB), `hero.png`, `react.svg`, `vite.svg`
- Unused npm deps: `path`, `react-hook-form`, `@hookform/resolvers`, `zod`
- Dead files: `useToast.js`, `PlatformIcons.jsx` (unused exports)
- Duplicated code: `AnimatedNumber` component, `useMediaQuery` hook

### 5.3 Add Page-Level Error + Suspense Boundaries
Currently one `<ErrorBoundary>` and one `<Suspense>` wrap ALL routes. A crash on any page crashes the entire app. Add per-route-group boundaries.

### 5.4 Fix `SidebarItem` Keyboard Accessibility
`<div onClick={...}>` should be `<button>` or have `role="button"`, `tabIndex`, and `onKeyDown` handlers.

### 5.5 Add Page Titles
Use `document.title` or a hook to set per-page titles (e.g., "Dashboard — Algoryn").

### 5.6 Fix Inline Style Inconsistencies
`constants/theme.js` defines `COLORS.primary`, `FONTS.heading`, etc. but almost every component hardcodes their own values. Refactor to use theme constants.

---

## Severity Distribution

| Severity | Count |
|----------|-------|
| CRITICAL | 6 |
| HIGH     | 12 |
| MEDIUM   | 18 |
| LOW      | 14+ |
| **Total**| **50+** |

---

## Estimated Effort

| Phase | Effort | Priority |
|-------|--------|----------|
| P1 — Deployment blockers | 2-4 hours | 🔴 Immediate |
| P2 — Broken features | 4-6 hours | 🔴 Immediate |
| P3 — Security | 3-5 hours | 🟡 High |
| P4 — Database/Perf | 2-3 hours | 🟡 High |
| P5 — Frontend cleanup | 4-6 hours | 🟢 Medium |

**Total estimated fix time:** 15-24 hours

---

## Recommendation

**Do NOT deploy to production without completing Phases 1-3.**

The exposed secrets alone make any production deployment a catastrophic risk. The missing DB columns will crash the application on key user flows (XP claiming, HackerRank sync). The broken features (edit profile, password change, delete account, export) mean core user flows are non-functional.

Begin with Phase 1 (rotate secrets + fix DB columns + fix JWT secrets) before making any other changes.
