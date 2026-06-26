const resend = require("../config/email");
const logger = require("../utils/logger");
const verifyEmailTemplate = require("../templates/verifyEmailTemplate");

const FROM = process.env.RESEND_FROM || "Algoryn <onboarding@resend.dev>";

const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.RESEND_API_KEY) {
        logger.info(`Email not sent — Resend not configured (would send to ${to}: ${subject})`);
        return;
    }

    try {
        await resend.emails.send({
            from: FROM,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        logger.error(`Email send failed: ${error.message}`);
        throw error;
    }
};

const escHtml = (s) =>
    String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

const sendWeeklyReportEmail = async (email, name) => {
    await sendEmail({
        to: email,
        subject: "Your Algoryn Weekly Report is Ready",
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

const sendVerificationEmail = async (email, name, verificationUrl) => {
    await sendEmail({
        to: email,
        subject: "Verify your Algoryn account",
        html: verifyEmailTemplate(name, verificationUrl),
    });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendWeeklyReportEmail,
    sendContestReminderEmail,
    sendStreakAlertEmail,
};
