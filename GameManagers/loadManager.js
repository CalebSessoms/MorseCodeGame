// loadManager.js
// Handles loading the saved game state from playerData/currentGameStates.txt

const fs = require('fs');
const path = require('path');
const savePath = path.join(__dirname, '../playerData/currentGameStates.txt');

function loadGame() {
  try {
    if (!fs.existsSync(savePath)) return null;
    const data = fs.readFileSync(savePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading game state:', err);
    return null;
  }
}

module.exports = { loadGame };
