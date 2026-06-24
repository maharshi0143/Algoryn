const logger = require("./logger");

const locks = new Map();

const withLock = (name, fn) => {
    return async (...args) => {
        if (locks.get(name)) {
            logger.warn(`Job "${name}" skipped — already running`);
            return;
        }

        locks.set(name, true);
        try {
            await fn(...args);
        } catch (error) {
            logger.error(`Job "${name}" failed:`, error);
        } finally {
            locks.set(name, false);
        }
    };
};

module.exports = { withLock };
