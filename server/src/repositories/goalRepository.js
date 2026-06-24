const db = require("../config/db");

const createGoal = async (userId, target, month, year) => {
    const result = await db.query(
        `INSERT INTO goals(user_id, target, month, year) VALUES($1, $2, $3, $4) RETURNING *`,
        [userId, target, month, year],
    );
    return result.rows[0];
};

const findGoalsByUserId = async (userId) => {
    const result = await db.query(
        `SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId],
    );
    return result.rows;
};

const findGoalById = async (goalId) => {
    const result = await db.query(`SELECT * FROM goals WHERE id = $1`, [goalId]);
    return result.rows[0];
};

const updateGoalProgress = async (goalId, currentProgress) => {
    const result = await db.query(
        `UPDATE goals SET current_progress = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [currentProgress, goalId],
    );
    return result.rows[0];
};

const deleteGoal = async (goalId) => {
    await db.query(`DELETE FROM goals WHERE id = $1`, [goalId]);
};

module.exports = {
    createGoal,
    findGoalsByUserId,
    findGoalById,
    updateGoalProgress,
    deleteGoal,
};
