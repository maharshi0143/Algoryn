const { Resend } = require("resend");
const logger = require("../utils/logger");

let resend;

if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    resend = { emails: { send: async () => logger.info("Resend not configured: email skipped") } };
}

module.exports = resend;
