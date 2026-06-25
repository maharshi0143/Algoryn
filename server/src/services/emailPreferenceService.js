const emailPreferenceRepository = require("../repositories/emailPreferenceRepository");

const getPreferences = async (userId) => {
    return emailPreferenceRepository.findByUserId(userId);
};

const updatePreferences = async (userId, preferences) => {
    return emailPreferenceRepository.upsert(userId, preferences);
};

module.exports = {
    getPreferences,
    updatePreferences,
};
