const exportService = require("../services/exportService");

const asyncHandler = require("../utils/asyncHandler");
const apiResponse = require("../utils/apiResponse");

const HTTP_STATUS = require("../constants/httpStatus");

const exportJson = asyncHandler(async (req, res) => {
    const report = await exportService.generateJsonReport(req.user.id);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=DevTrack_Report_${req.user.id}.json`);
    res.json(report);
});

const exportPdf = asyncHandler(async (req, res) => {
    const pdf = await exportService.generatePdfReport(req.user.id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=DevTrack_Report_${req.user.id}.pdf`);
    res.send(pdf);
});

const exportPng = asyncHandler(async (req, res) => {
    const png = await exportService.generatePngReport(req.user.id);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename=DevTrack_Report_${req.user.id}.png`);
    res.send(png);
});

module.exports = {
    exportPdf,
    exportJson,
    exportPng,
};