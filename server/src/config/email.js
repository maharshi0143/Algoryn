const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

let transporter;

if (process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
} else {
    transporter = { sendMail: async () => logger.info("SMTP not configured: email skipped") };
}

module.exports = transporter;
