const { updatePlayerOptionsUI } = require('./uiManager');


/**
 * Remove all player options
 */
function clearPlayerOptions() {
  // Remove all options from the array and log each removal
  while (playerOptions.length > 0) {
    const opt = playerOptions.pop();
    log(`[PlayerOption] Removed: id=${opt.id}, label="${opt.label}"`);
  }
  updatePlayerOptionsUI(getPlayerOptions())
}
// playerOptions.js
// Functions to manage player options for the text-based game

const { log } = require('./debugLogger');

/**
 * Player options are objects: { id: string, label: string, action: function }
 */

let playerOptions = [];

/**
 * Create a new player option
 * @param {string} label - The text shown to the player
 * @param {function} action - The function to execute when chosen
 * @returns {object} The created option
 */
function createPlayerOption(label, action) {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const option = { id, label, action };
  playerOptions.push(option);
  log(`[PlayerOption] Added: id=${id}, label="${label}"`);
  updatePlayerOptionsUI(getPlayerOptions());
  return option;
}

/**
 * Remove a player option by id or label
 * @param {string} idOrLabel - The id or label of the option to remove
 * @returns {boolean} True if removed, false if not found
 */
function removePlayerOption(idOrLabel) {
  let index = playerOptions.findIndex(opt => opt.id === idOrLabel);
  if (index === -1) {
    index = playerOptions.findIndex(opt => opt.label === idOrLabel);
  }
  if (index !== -1) {
    const removed = playerOptions[index];
    playerOptions.splice(index, 1);
    log(`[PlayerOption] Removed: id=${removed.id}, label="${removed.label}"`);
    updatePlayerOptionsUI(getPlayerOptions());
    return true;
  }
  return false;
}

/**
 * Edit a player option by its current label
 * @param {string} currentLabel - The label of the option to edit
 * @param {object} updates - { label?: string, action?: function }
 * @returns {boolean} True if edited, false if not found
 */
function editPlayerOption(currentLabel, updates) {
  const option = playerOptions.find(opt => opt.label === currentLabel);
  if (option) {
    let changes = [];
    if (updates.label !== undefined) {
      changes.push(`label: "${option.label}" -> "${updates.label}"`);
      option.label = updates.label;
    }
    if (updates.action !== undefined) {
      changes.push(`action: [function updated]`);
      option.action = updates.action;
    }
    if (changes.length > 0) {
      log(`[PlayerOption] Edited: label="${currentLabel}", ${changes.join(', ')}`);
    }
    return true;
  }
  return false;
}

/**
 * Get all player options
 * @returns {Array} The list of options
 */

function hidePlayerOptions() {
  const optionsContainer = document.getElementById('options-container');
  if (optionsContainer) {
    optionsContainer.style.display = 'none';
  }
}

function showPlayerOptions() {
  const optionsContainer = document.getElementById('options-container');
  if (optionsContainer) {
    optionsContainer.style.display = '';
  }
}

function getPlayerOptions() {
  return playerOptions;
}

// Log all current player options to debug.log
function debugAllPlayerOptions() {
  log('[PlayerOption] Current options:');
  playerOptions.forEach(opt => {
    log(`  id=${opt.id}, label="${opt.label}"`);
  });
}

module.exports = {
  createPlayerOption,
  removePlayerOption,
  editPlayerOption,
  getPlayerOptions,
  hidePlayerOptions,
  showPlayerOptions,
  debugAllPlayerOptions,
  clearPlayerOptions
};
