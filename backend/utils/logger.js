// A simple console logger for now. You can replace this with a more robust
// logger like Winston later if needed.
const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  error: (message) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  },
};

module.exports = logger;
