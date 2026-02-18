// debugLogger.js
// Simple logger to append debug messages to debug.log


const isRenderer = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';
let log;
if (isRenderer) {
  // Renderer: send log to main via IPC
  const { ipcRenderer } = require('electron');
  log = function(...args) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    ipcRenderer.send('debug-log', msg);
  };
} else {
  // Main process: write directly
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, '..', 'debug.log');
  log = function(...args) {
    const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    fs.appendFileSync(logPath, msg + '\n', { encoding: 'utf8' });
  };
}

function logAppLaunch() {
  log(''); // Empty line for separation
  log(`[${new Date().toISOString()}] App launched.`);
}

module.exports = {
  log,
  logAppLaunch
};
