const tasks = [];

const track = (task) => tasks.push(task);

const stopAll = () => {
    tasks.forEach((t) => t.stop());
    tasks.length = 0;
};

module.exports = { track, stopAll };
