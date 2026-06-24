const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const Sentry = require("@sentry/node");
const apiLimiter = require("./middlewares/apiLimiter");

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0.0,
    enabled: !!process.env.SENTRY_DSN,
    integrations: [Sentry.expressIntegration()],
});

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const syncRoutes = require('./routes/syncRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const contestRoutes = require("./routes/contestRoutes");
const aiRoutes = require("./routes/aiRoutes");
const dailyStatsRoutes = require("./routes/dailyStatsRoutes");
const goalRoutes = require("./routes/goalRoutes");
const friendRoutes = require("./routes/friendRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const contestReminderRoutes = require("./routes/contestReminderRoutes");
const publicProfileRoutes = require("./routes/publicProfileRoutes");
const exportRoutes = require("./routes/exportRoutes");
const emailPreferenceRoutes = require("./routes/emailPreferenceRoutes");


const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.set("trust proxy", 1);
app.use(helmet());

app.use(cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());
app.use(morgan("dev", { skip: (req) => req.url === "/api/health" }));
app.use(cookieParser());
app.use(apiLimiter);

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        data: null,
        message: "Server is running"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/daily-stats", dailyStatsRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/contest-reminders", contestReminderRoutes);
app.use("/api/public", publicProfileRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/email-preferences", emailPreferenceRoutes);


Sentry.setupExpressErrorHandler(app);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;