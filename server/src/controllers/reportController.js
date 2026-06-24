const weeklyReportService = require("../services/weeklyReportService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const generateWeeklyReport = asyncHandler(async (req, res) => {
    const report = await weeklyReportService.generateWeeklyReport(req.user.id);

    apiResponse(res, HTTP_STATUS.OK, "Weekly report generated successfully", report);
});

module.exports = {
    generateWeeklyReport,
};