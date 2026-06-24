const githubSyncJob = require("./githubSyncJob");
const leetcodeSyncJob = require("./leetcodeSyncJob");
const codeforcesSyncJob = require("./codeforcesSyncJob");
const codechefSyncJob = require("./codechefSyncJob");
const gfgSyncJob = require("./gfgSyncJob");
const achievementJob = require("./achievementJob");
const dailyStatsJob = require("./dailyStatsJob");
const weeklyReportJob = require("./weeklyReportJob");
const contestReminderJob = require("./contestReminderJob");

const initializeJobs = () => {
    githubSyncJob();
    leetcodeSyncJob();
    codeforcesSyncJob();
    codechefSyncJob();
    gfgSyncJob();
    achievementJob();
    dailyStatsJob();
    weeklyReportJob();
    contestReminderJob();
};

module.exports = initializeJobs;
