const { pool } = require("../config/db");
const HTTP_STATUS = require("../constants/httpStatus");

const health = async (req, res) => {
    const components = { database: { status: "unknown" } };

    try {
        const start = Date.now();
        const client = await pool.connect();
        await client.query("SELECT 1");
        client.release();
        components.database = { status: "ok", latency_ms: Date.now() - start };
    } catch (error) {
        components.database = { status: "error", message: error.message };
    }

    const allHealthy = Object.values(components).every(c => c.status === "ok");
    const statusCode = allHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
        success: allHealthy,
        data: {
            status: allHealthy ? "healthy" : "degraded",
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            components,
        },
        message: allHealthy ? "Server is running" : "One or more services are degraded",
    });
};

module.exports = { health };
