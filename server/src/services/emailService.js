const transporter = require("../config/email");
const logger = require("../utils/logger");

const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.info(`Email not sent — SMTP not configured (would send to ${to}: ${subject})`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"DevTrack AI" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
    }
};

const escHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const sendWeeklyReportEmail = async (email, name) => {
    await sendEmail({
        to: email,
        subject: "Your DevTrack Weekly Report is Ready",
        html: `<h2>Hi ${escHtml(name)},</h2><p>Your weekly developer report is ready. Check it out on your dashboard.</p>`,
    });
};

const sendContestReminderEmail = async (email, name, contestName, platform) => {
    await sendEmail({
        to: email,
        subject: `Upcoming Contest: ${contestName}`,
        html: `<h2>Hi ${escHtml(name)},</h2><p>Reminder: <strong>${escHtml(contestName)}</strong> on ${escHtml(platform)} is starting soon!</p>`,
    });
};

const sendStreakAlertEmail = async (email, name, streak) => {
    await sendEmail({
        to: email,
        subject: "Don't Lose Your Streak!",
        html: `<h2>Hi ${escHtml(name)},</h2><p>You're on a <strong>${streak}-day streak</strong>. Solve a problem today to keep it going!</p>`,
    });
};

module.exports = {
    sendEmail,
    sendWeeklyReportEmail,
    sendContestReminderEmail,
    sendStreakAlertEmail,
};
