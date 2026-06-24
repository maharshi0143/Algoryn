const weeklyReportRepository = require("../repositories/weeklyReportRepository");
const activityLogService = require("./activityLogService");
const achievementService = require("./achievementService");
const goalService = require("./goalService");
const dashboardService = require("./dashboardService");
const { generateResponse } = require("../integrations/groq/groqService");
const logger = require("../utils/logger");

const generateWeeklyReport = async (userId) => {
    const [overview, achievements, goals, activities] = await Promise.all([
        dashboardService.getOverview(userId),
        achievementService.getAchievements(userId),
        goalService.getGoals(userId),
        activityLogService.getRecentActivities(userId, 10),
    ]);

    const prompt = `
Developer Weekly Report

Total Problems Solved:
${overview.totalSolved}

Current Streak:
${overview.streak}

GitHub Contributions:
${overview.contributions}

Achievements:
${(achievements || []).map(a => a.title).join(", ")}

Goals:
${(goals || []).map(g => `Target: ${g.target}, Progress: ${g.current_progress}/${g.target}`).join(", ")}

Recent Activities:
${(activities || []).map(a => a.metadata?.description || a.action).join(", ")}

Respond with valid JSON only (no markdown, no code fences):
{
  "summary": "Your weekly summary here",
  "recommendations": "Your recommendations here"
}
`;

    const response = await generateResponse(prompt, "You are a helpful assistant that always responds with valid JSON. No markdown, no code fences, no explanation — just the raw JSON object.");
    const cleaned = response.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    let parsed;

    try {
        parsed = JSON.parse(cleaned);
    } catch {
        const braceStart = cleaned.indexOf("{");
        const braceEnd = cleaned.lastIndexOf("}");
        let jsonBlock = cleaned;

        if (braceStart !== -1 && braceEnd > braceStart) {
            jsonBlock = cleaned.slice(braceStart, braceEnd + 1);
        }

        try {
            parsed = JSON.parse(jsonBlock);
        } catch {
            const summaryMatch = jsonBlock.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
            const recMatch = jsonBlock.match(/"recommendations"\s*:\s*"((?:[^"\\]|\\.)*)"/);

            if (summaryMatch || recMatch) {
                parsed = {
                    summary: summaryMatch ? summaryMatch[1] : "No summary available",
                    recommendations: recMatch ? recMatch[1] : "No recommendations available",
                };
            } else {
                logger.warn("Weekly report JSON parse failed, using fallback text");
                parsed = {
                    summary: cleaned.length > 0 ? cleaned.slice(0, 200) : "No summary available",
                    recommendations: "No recommendations available",
                };
            }
        }
    }

    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday - 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return await weeklyReportRepository.createWeeklyReport(
        userId, weekStart, weekEnd,
        parsed.summary || "No summary available",
        parsed.recommendations || "No recommendations available",
    );
};

module.exports = {
    generateWeeklyReport,
};