// saveManager.js
// Handles saving the current game state to playerData/currentGameStates.txt

const fs = require('fs');
const path = require('path');
const savePath = path.join(__dirname, '../playerData/currentGameStates.txt');

function saveGame(gameState) {
  try {
    const data = JSON.stringify(gameState, null, 2);
    fs.writeFileSync(savePath, data, 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving game state:', err);
    return false;
  }
}

module.exports = { saveGame };
