const emailPreferenceService = require("../services/emailPreferenceService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const getPreferences = asyncHandler(async (req, res) => {
    const prefs = await emailPreferenceService.getPreferences(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Email preferences fetched successfully", prefs);
});

const updatePreferences = asyncHandler(async (req, res) => {
    const { weekly_report, contest_reminder, streak_alert, achievement_alert } = req.body;

    const prefs = await emailPreferenceService.updatePreferences(req.user.id, {
        weekly_report,
        contest_reminder,
        streak_alert,
        achievement_alert,
    });

    apiResponse(res, HTTP_STATUS.OK, "Email preferences updated successfully", prefs);
});

module.exports = {
    getPreferences,
    updatePreferences,
};
