const axios = require("axios");

const BASE = "http://localhost:5000/api";
let token = "";
let userEmail = "";
let profileId = "";
let notificationId = "";
let goalId = "";
let friendId = "";
let reminderId = "";
let secondToken = "";

let passed = 0;
let failed = 0;
let skipped = 0;

const test = async (name, fn) => {
    try {
        await fn();
        console.log(`  PASS  ${name}`);
        passed++;
    } catch (err) {
        const msg = err.response ? `[${err.response.status}] ${JSON.stringify(err.response.data).slice(0, 100)}` : err.message;
        if (err.skipped) {
            console.log(`  SKIP  ${name} — ${msg}`);
            skipped++;
        } else {
            console.log(`  FAIL  ${name} — ${msg}`);
            failed++;
        }
    }
};

const api = (method, path, data = null, extraHeaders = {}) => {
    const headers = { ...extraHeaders };
    if (token) headers.Authorization = `Bearer ${token}`;
    return axios({ method, url: `${BASE}${path}`, data, headers, validateStatus: () => true, timeout: 30000 });
};

const skip = (msg) => {
    const e = new Error(msg);
    e.skipped = true;
    throw e;
};

const main = async () => {
    console.log("\n=== HEALTH ===\n");

    await test("GET /health", async () => {
        const res = await api("get", "/health");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== AUTH ===\n");

    await test("POST /auth/register", async () => {
        userEmail = `test${Date.now()}@example.com`;
        const res = await api("post", "/auth/register", {
            name: "Test User",
            email: userEmail,
            password: "TestPass123",
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
        token = res.data.data.accessToken;
    });

    await test("POST /auth/login", async () => {
        const res = await api("post", "/auth/login", {
            email: userEmail,
            password: "TestPass123",
        });
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
        token = res.data.data.accessToken;
    });

    await test("GET /auth/me", async () => {
        const res = await api("get", "/auth/me");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("POST /auth/refresh-token (no cookie)", async () => {
        const res = await api("post", "/auth/refresh-token");
        if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
    });

    await test("PUT /auth/password", async () => {
        const res = await api("put", "/auth/password", {
            currentPassword: "TestPass123",
            newPassword: "NewTestPass456",
        });
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("PUT /auth/password (wrong current)", async () => {
        const res = await api("put", "/auth/password", {
            currentPassword: "WrongPass",
            newPassword: "NewTestPass456",
        });
        if (res.status !== 401) throw new Error(`Expected 401 got ${res.status}`);
    });

    console.log("\n=== PROFILES ===\n");

    await test("POST /profiles (leetcode)", async () => {
        const res = await api("post", "/profiles", {
            platform: "leetcode",
            username: "testuser",
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
        profileId = res.data.data.id;
    });

    await test("POST /profiles (github)", async () => {
        const res = await api("post", "/profiles", {
            platform: "github",
            username: "testuser",
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
    });

    await test("POST /profiles (codeforces)", async () => {
        const res = await api("post", "/profiles", {
            platform: "codeforces",
            username: "feecIeR", // low-activity user for fast API response
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
    });

    await test("POST /profiles (codechef)", async () => {
        const res = await api("post", "/profiles", {
            platform: "codechef",
            username: "testuser",
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
    });

    await test("POST /profiles (gfg)", async () => {
        const res = await api("post", "/profiles", {
            platform: "gfg",
            username: "testuser",
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
    });

    await test("GET /profiles", async () => {
        const res = await api("get", "/profiles");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
        if (!Array.isArray(res.data.data.data)) throw new Error("Expected array");
    });

    await test("PUT /profiles/:id", async () => {
        const res = await api("put", `/profiles/${profileId}`, { username: "updateduser" });
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("DELETE /profiles/:id", async () => {
        const res = await api("delete", `/profiles/${profileId}`);
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== SYNC ===\n");

    await test("POST /sync/github", async () => {
        const res = await api("post", "/sync/github");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /sync/leetcode", async () => {
        const res = await api("post", "/sync/leetcode");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /sync/codeforces", async () => {
        const res = await api("post", "/sync/codeforces");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /sync/codechef", async () => {
        const res = await api("post", "/sync/codechef");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /sync/gfg", async () => {
        const res = await api("post", "/sync/gfg");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /sync/hackerrank", async () => {
        const res = await api("post", "/sync/hackerrank");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /sync/all", async () => {
        const res = await api("post", "/sync/all");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== DASHBOARD ===\n");

    await test("GET /dashboard", async () => {
        const res = await api("get", "/dashboard");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /dashboard/charts", async () => {
        const res = await api("get", "/dashboard/charts");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /dashboard/weekly", async () => {
        const res = await api("get", "/dashboard/weekly");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /dashboard/monthly", async () => {
        const res = await api("get", "/dashboard/monthly");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /dashboard/heatmap", async () => {
        const res = await api("get", "/dashboard/heatmap");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== ANALYTICS ===\n");

    await test("GET /analytics/platforms", async () => {
        const res = await api("get", "/analytics/platforms");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /analytics/difficulty", async () => {
        const res = await api("get", "/analytics/difficulty");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /analytics/contributions", async () => {
        const res = await api("get", "/analytics/contributions");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /analytics/yearly", async () => {
        const res = await api("get", "/analytics/yearly");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== NOTIFICATIONS ===\n");

    await test("POST /notifications", async () => {
        const res = await api("post", "/notifications", {
            type: "sync",
            message: "Test notification",
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
        notificationId = res.data.data.id;
    });

    await test("GET /notifications", async () => {
        const res = await api("get", "/notifications");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
        if (!Array.isArray(res.data.data.data)) throw new Error("Expected array");
    });

    await test("PATCH /notifications/:id", async () => {
        if (!notificationId) return skip("No notification ID");
        const res = await api("patch", `/notifications/${notificationId}`);
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("DELETE /notifications/:id", async () => {
        if (!notificationId) return skip("No notification ID");
        const res = await api("delete", `/notifications/${notificationId}`);
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== ACHIEVEMENTS ===\n");

    await test("GET /achievements", async () => {
        const res = await api("get", "/achievements");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
        if (!Array.isArray(res.data.data)) throw new Error("Expected array");
    });

    await test("POST /achievements", async () => {
        const res = await api("post", "/achievements");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== CONTESTS ===\n");

    await test("GET /contests", async () => {
        const res = await api("get", "/contests");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("GET /contests/upcoming", async () => {
        const res = await api("get", "/contests/upcoming");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
        if (!Array.isArray(res.data.data)) throw new Error("Expected array");
    });

    await test("GET /contests/rating", async () => {
        const res = await api("get", "/contests/rating");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    await test("POST /contests/sync", async () => {
        const res = await api("post", "/contests/sync");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    console.log("\n=== AI ===\n");

    await test("GET /ai/insights", async () => {
        const res = await api("get", "/ai/insights");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /ai/recommendations", async () => {
        const res = await api("get", "/ai/recommendations");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /ai/weakness", async () => {
        const res = await api("get", "/ai/weakness");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== DAILY STATS ===\n");

    await test("GET /daily-stats", async () => {
        const res = await api("get", "/daily-stats");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("POST /daily-stats/populate", async () => {
        const res = await api("post", "/daily-stats/populate");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== GOALS ===\n");

    await test("POST /goals", async () => {
        const res = await api("post", "/goals", {
            title: "Solve 100 problems",
            target: 100,
            month: 6,
            year: 2026,
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
        goalId = res.data.data.id;
    });

    await test("GET /goals", async () => {
        const res = await api("get", "/goals");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /goals/:id", async () => {
        if (!goalId) return skip("No goal ID");
        const res = await api("get", `/goals/${goalId}`);
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("PATCH /goals/:id/progress", async () => {
        if (!goalId) return skip("No goal ID");
        const res = await api("patch", `/goals/${goalId}/progress`, { current_progress: 50 });
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("DELETE /goals/:id", async () => {
        if (!goalId) return skip("No goal ID");
        const res = await api("delete", `/goals/${goalId}`);
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== FRIENDS ===\n");

    await test("POST /friends (send request)", async () => {
        const reg = await api("post", "/auth/register", {
            name: "Friend User",
            email: `friend${Date.now()}@example.com`,
            password: "FriendPass123",
        });
        if (reg.status !== 201) throw new Error(`Friend register failed: ${reg.status}`);
        secondToken = reg.data.data.accessToken;
        const res = await api("post", "/friends", { friendEmail: reg.data.data.user.email });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
        friendId = res.data.data.id;
    });

    await test("GET /friends", async () => {
        const res = await api("get", "/friends");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /friends/pending", async () => {
        const res = await api("get", "/friends/pending");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("PATCH /friends/:id/accept", async () => {
        if (!friendId) return skip("No friend ID");
        if (!secondToken) return skip("No second token");
        const res = await axios({
            method: "patch",
            url: `${BASE}/friends/${friendId}/accept`,
            headers: { Authorization: `Bearer ${secondToken}` },
            validateStatus: () => true,
            timeout: 15000,
        });
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== LEADERBOARD ===\n");

    await test("GET /leaderboard", async () => {
        const res = await api("get", "/leaderboard");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /leaderboard/friends", async () => {
        const res = await api("get", "/leaderboard/friends");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /leaderboard/platform/:platform", async () => {
        const res = await api("get", "/leaderboard/platform/leetcode");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /leaderboard/streaks", async () => {
        const res = await api("get", "/leaderboard/streaks");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /leaderboard/contributions", async () => {
        const res = await api("get", "/leaderboard/contributions");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== REPORTS ===\n");

    await test("POST /reports/generate", async () => {
        const res = await api("post", "/reports/generate");
        if (res.status === 429) return skip("Rate limited");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== CONTEST REMINDERS ===\n");

    await test("POST /contest-reminders", async () => {
        const res = await api("post", "/contest-reminders", {
            platform: "codeforces",
            minutes_before: 30,
        });
        if (res.status !== 201) throw new Error(`Expected 201 got ${res.status}`);
        reminderId = res.data.data.id;
    });

    await test("GET /contest-reminders", async () => {
        const res = await api("get", "/contest-reminders");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("DELETE /contest-reminders/:id", async () => {
        if (!reminderId) return skip("No reminder ID");
        const res = await api("delete", `/contest-reminders/${reminderId}`);
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== PUBLIC PROFILE ===\n");

    await test("GET /public/:username", async () => {
        const res = await api("get", "/public/Test User");
        if (res.status !== 200 && res.status !== 404) throw new Error(`Expected 200/404 got ${res.status}`);
    });

    console.log("\n=== EXPORT ===\n");

    await test("GET /export/json", async () => {
        const res = await api("get", "/export/json");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /export/pdf", async () => {
        const res = await api("get", "/export/pdf");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("GET /export/png", async () => {
        const res = await api("get", "/export/png");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== EMAIL PREFERENCES ===\n");

    await test("GET /email-preferences", async () => {
        const res = await api("get", "/email-preferences");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("PUT /email-preferences", async () => {
        const res = await api("put", "/email-preferences", {
            weekly_report: false,
            contest_reminder: true,
            streak_alert: true,
            achievement_alert: false,
        });
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n=== AUTH (logout + delete) ===\n");

    await test("POST /auth/logout", async () => {
        const res = await api("post", "/auth/logout");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    await test("DELETE /auth/me", async () => {
        const res = await api("delete", "/auth/me");
        if (res.status !== 200) throw new Error(`Expected 200 got ${res.status}`);
    });

    console.log("\n========================");
    console.log(`  RESULTS`);
    console.log(`  PASS: ${passed}`);
    console.log(`  FAIL: ${failed}`);
    console.log(`  SKIP: ${skipped}`);
    console.log(`  TOTAL: ${passed + failed + skipped}`);
    console.log("========================\n");

    process.exit(failed > 0 ? 1 : 0);
};

main().catch((err) => {
    console.error("FATAL:", err.message);
    process.exit(1);
});
