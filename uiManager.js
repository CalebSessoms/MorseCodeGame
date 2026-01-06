// uiManager.js
// Handles updating and changing visuals for the text-based game

const { log } = require("./debugLogger");

/**
 * Updates the list of player options displayed in the UI.
 * @param {Array} options - Array of player option objects
 */
function updatePlayerOptionsUI(options) {
  const optionsContainer = document.getElementById('options-container');
  if (!optionsContainer) return;
  optionsContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.label;
    btn.onclick = () => opt.action();
    btn.className = 'option-btn';
    optionsContainer.appendChild(btn);
  });
}

/**
 * Updates the main game text displayed to the player.
 * @param {string} text - The text to display
 */
function updateGameText(text) {
  const textContainer = document.getElementById('game-text');
  if (textContainer) {
    textContainer.textContent = text;
    log(`[GameText] Updated text: "${text.substring(0, 30)}..."`);
  } else log(`[GameText] Did not update text: "${text.substring(0, 30)}..."`);
}

module.exports = {
  updatePlayerOptionsUI,
  updateGameText
};
