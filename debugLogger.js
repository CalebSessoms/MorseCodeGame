// debugLogger.js
// Simple logger to append debug messages to debug.log

const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'debug.log');

function log(message) {
  fs.appendFileSync(logPath, message + '\n', { encoding: 'utf8' });
}

function logAppLaunch() {
  log(''); // Empty line for separation
  log(`[${new Date().toISOString()}] App launched.`);
}

module.exports = {
  log,
  logAppLaunch
};
