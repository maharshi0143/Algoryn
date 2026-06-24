const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 30000,
});

const generateResponse = async (prompt, systemPrompt) => {
    try {
        const response = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
            temperature: systemPrompt ? 0.3 : 0.8,
            messages: [
                {
                    role: "system",
                    content: systemPrompt || "You are a friendly coding buddy. Always respond in natural, conversational language like a human. No bullet points, no markdown, no numbered lists. Be warm, encouraging, and keep it concise.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const content = response.choices?.[0]?.message?.content || "";
        return systemPrompt ? content : content.replace(/\n/g, " ");
    } catch (error) {
        const err = new Error(`Groq AI error: ${error.message}`);
        err.statusCode = 503;
        throw err;
    }
};

module.exports = {
    generateResponse,
};
