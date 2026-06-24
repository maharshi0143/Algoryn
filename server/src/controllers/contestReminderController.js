const contestReminderService = require("../services/contestReminderService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const createReminder = asyncHandler(async (req, res) => {
    const { platform, minutes_before } = req.body;
    const reminder = await contestReminderService.createReminder(req.user.id, platform, minutes_before);

    apiResponse(res, HTTP_STATUS.CREATED, "Contest reminder created successfully", reminder);
});

const getReminders = asyncHandler(async (req, res) => {
    const reminders = await contestReminderService.getReminders(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Contest reminders fetched successfully", reminders);
});

const deleteReminder = asyncHandler(async (req, res) => {
    await contestReminderService.deleteReminder(req.user.id, req.params.id);

    apiResponse(res, HTTP_STATUS.OK, "Contest reminder deleted successfully");
});

module.exports = {
    createReminder,
    getReminders,
    deleteReminder,
};