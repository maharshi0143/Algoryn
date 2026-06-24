const dashboardService = require("./dashboardService");
const analyticsService = require("./analyticsService");
const { generateResponse } = require("../integrations/groq/groqService");

const getInsights = async (userId) => {
    const overview = await dashboardService.getOverview(userId);

    const prompt = `You are a friendly coding buddy. Talk like a human, not a robot. Be warm, encouraging, and conversational. No bullet points, no markdown — just natural chat.

Here are my stats:
- Total Solved: ${overview.totalSolved}
- Easy: ${overview.easy}
- Medium: ${overview.medium}
- Hard: ${overview.hard}
- Contributions: ${overview.contributions}
- Streak: ${overview.streak}

Give me some friendly insights about how I'm doing.`;

    return await generateResponse(prompt);
};

const getRecommendations = async (userId) => {
    const difficulty = await analyticsService.getDifficultyDistribution(userId);

    const prompt = `You are a friendly coding buddy. Talk like a human, not a robot. Be warm, encouraging, and conversational. No bullet points, no markdown — just natural chat.

Here's my difficulty breakdown:
- Easy: ${difficulty.easy}
- Medium: ${difficulty.medium}
- Hard: ${difficulty.hard}

Suggest how I can improve my problem-solving, in a friendly way.`;

    return await generateResponse(prompt);
};

const getWeakness = async (userId) => {
    const overview = await dashboardService.getOverview(userId);

    const prompt = `You are a friendly coding buddy. Talk like a human, not a robot. Be warm, encouraging, and conversational. No bullet points, no markdown — just natural chat.

Here are my stats:
${JSON.stringify(overview, null, 2)}

What areas should I work on? Be honest but kind.`;

    return await generateResponse(prompt);
};

module.exports = {
    getInsights,
    getRecommendations,
    getWeakness,
};