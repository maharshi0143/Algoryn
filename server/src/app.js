const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const Sentry = require("@sentry/node");
const apiLimiter = require("./middlewares/apiLimiter");
const HTTP_STATUS = require("./constants/httpStatus");
const healthController = require("./controllers/healthController");
const logger = require("./utils/logger");

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
const activityLogRoutes = require("./routes/activityLogRoutes");


const notFoundMiddleware = require('./middlewares/notFoundMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.set("trust proxy", 1);
const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", ...(process.env.CLIENT_URL || "http://localhost:5173").split(",").map(s => s.trim())],
};

app.use(helmet({
    contentSecurityPolicy: {
        directives: cspDirectives,
    },
}));

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(s => s.trim())
    : ["http://localhost:5173"];

app.use(cors({
        origin: (origin, callback) => {
            if (!origin && process.env.NODE_ENV !== "development") return callback(new Error("Not allowed by CORS"));
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());
app.use(morgan("combined", {
    skip: (req) => req.url === "/api/health",
    stream: { write: (msg) => logger.info(msg.trim()) },
}));
app.use(cookieParser());
app.use(apiLimiter);

// Health check route
app.get("/api/health", healthController.health);

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
app.use("/api/activity-logs", activityLogRoutes);


Sentry.setupExpressErrorHandler(app);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;