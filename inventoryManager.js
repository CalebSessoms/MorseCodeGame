/**
 * Move an item from one slot to another in the inventory grid.
 * @param {number} fromRow - Source row index
 * @param {number} fromCol - Source column index
 * @param {number} toRow - Destination row index
 * @param {number} toCol - Destination column index
 * @returns {boolean} True if move succeeded, false otherwise
 */
function moveItem(fromRow, fromCol, toRow, toCol) {
  // Check bounds
  if (
    fromRow < 0 || fromRow >= INVENTORY_ROWS ||
    fromCol < 0 || fromCol >= INVENTORY_COLS ||
    toRow < 0 || toRow >= INVENTORY_ROWS ||
    toCol < 0 || toCol >= INVENTORY_COLS
  ) {
    log(`[Inventory] Move failed: out of bounds (${fromRow},${fromCol}) to (${toRow},${toCol})`);
    return false;
  }
  // Check if source has item and destination is empty
  if (!inventory[fromRow][fromCol]) {
    log(`[Inventory] Move failed: source empty (${fromRow},${fromCol})`);
    return false;
  }
  if (inventory[toRow][toCol]) {
    log(`[Inventory] Move failed: destination not empty (${toRow},${toCol})`);
    return false;
  }
  // Move item
  inventory[toRow][toCol] = inventory[fromRow][fromCol];
  inventory[fromRow][fromCol] = null;
  log(`[Inventory] Moved item from (${fromRow},${fromCol}) to (${toRow},${toCol})`);
  renderInventoryGrid();
  return true;
}
// inventoryManager.js
// Handles opening, closing, and interacting with a basic inventory


const { createPlayerOption, removePlayerOption, getPlayerOptions, hidePlayerOptions, showPlayerOptions, debugAllPlayerOptions } = require('./playerOptions');
const { updatePlayerOptionsUI, updateGameText } = require('./uiManager');
const { getItemData } = require('./itemsDB');
const { log } = require('./debugLogger');


// 5x5 grid inventory (null = empty slot)
const INVENTORY_ROWS = 5;
const INVENTORY_COLS = 5;
let inventory = Array.from({ length: INVENTORY_ROWS }, () => Array(INVENTORY_COLS).fill(null));
let inventoryOpen = false;
let previousGameText = '';
let previousOptions = [];


// Add item to first available slot, returns {row, col} or null if full
function addItem(item) {
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      if (inventory[row][col] === null) {
        inventory[row][col] = item;
        log(`[Inventory] Added item: "${item}" at (${row},${col})`);
        return { row, col };
      }
    }
  }
  log(`[Inventory] Failed to add item: "${item}" (inventory full)`);
  return null;
}


// Remove first occurrence of item, returns {row, col} or null if not found
function removeItem(item) {
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      if (inventory[row][col] === item) {
        inventory[row][col] = null;
        log(`[Inventory] Removed item: "${item}" from (${row},${col})`);
        return { row, col };
      }
    }
  }
  log(`[Inventory] Failed to remove item: "${item}" (not found)`);
  return null;
}

function openInventory() {
  if (inventoryOpen) return;
  inventoryOpen = true;
  previousGameText = document.getElementById('game-text').textContent;
  previousOptions = getPlayerOptions().slice();
  // Hide all player options while inventory is open
  hidePlayerOptions();
  debugAllPlayerOptions();
  // Show/hide inventory and close-inventory buttons
  const invBtn = document.getElementById('inventory-btn');
  const closeInvBtn = document.getElementById('close-inventory-btn');
  if (invBtn) invBtn.style.display = 'none';
  if (closeInvBtn) closeInvBtn.style.display = 'block';
  updateGameText('Inventory:');
  // Show inventory grid
  renderInventoryGrid();
}

function closeInventory() {
  inventoryOpen = false;
  updateGameText(previousGameText);
  // Only use showPlayerOptions to reveal player options
  showPlayerOptions();
  debugAllPlayerOptions();
  // Show inventory button, hide close-inventory button
  const invBtn = document.getElementById('inventory-btn');
  const closeInvBtn = document.getElementById('close-inventory-btn');
  if (invBtn) invBtn.style.display = 'block';
  if (closeInvBtn) closeInvBtn.style.display = 'none';
  // Hide inventory grid
  const grid = document.getElementById('inventory-grid-container');
  if (grid) grid.style.display = 'none';
}
// Render the inventory grid UI
function renderInventoryGrid() {
  const grid = document.getElementById('inventory-grid-container');
  if (!grid) return;
  grid.innerHTML = '';
  grid.style.display = 'grid';
  grid.style.gridTemplateRows = `repeat(${INVENTORY_ROWS}, 1fr)`;
  grid.style.gridTemplateColumns = `repeat(${INVENTORY_COLS}, 1fr)`;
  grid.style.gap = '8px';
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      const cell = document.createElement('div');
      cell.style.background = '#444';
      cell.style.border = '1px solid #ffb300';
      cell.style.borderRadius = '6px';
      cell.style.height = '48px';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '1em';
      cell.style.color = '#ffb300';
      cell.style.cursor = inventory[row][col] ? 'pointer' : 'default';
      cell.textContent = inventory[row][col] ? inventory[row][col] : '';
      if (inventory[row][col]) {
        cell.title = `Options for ${inventory[row][col]}`;
        cell.onclick = () => showItemPopup(row, col);
        // Drag source
        cell.draggable = true;
        cell.ondragstart = (e) => {
          e.dataTransfer.setData('text/plain', JSON.stringify({ fromRow: row, fromCol: col }));
        };
      } else {
        cell.draggable = false;
      }
      // Drag target
      cell.ondragover = (e) => {
        e.preventDefault();
        cell.style.background = '#666';
      };
      cell.ondragleave = (e) => {
        cell.style.background = '#444';
      };
      cell.ondrop = (e) => {
        e.preventDefault();
        cell.style.background = '#444';
        try {
          const { fromRow, fromCol } = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (fromRow !== row || fromCol !== col) {
            moveItem(fromRow, fromCol, row, col);
          }
        } catch (err) {
          log('[Inventory] Invalid drag data');
        }
      };
      grid.appendChild(cell);
    }
  }
}

// Show a popup for item actions
function showItemPopup(row, col) {
  const item = inventory[row][col];
  if (!item) return;
  let popup = document.getElementById('inventory-item-popup');
  if (popup) popup.remove();
  popup = document.createElement('div');
  popup.id = 'inventory-item-popup';
  popup.style.position = 'fixed';
  popup.style.left = '0';
  popup.style.top = '0';
  popup.style.width = '100vw';
  popup.style.height = '100vh';
  popup.style.background = 'rgba(0,0,0,0.5)';
  popup.style.display = 'flex';
  popup.style.alignItems = 'center';
  popup.style.justifyContent = 'center';
  popup.style.zIndex = '1000';

  const box = document.createElement('div');
  box.style.background = '#222';
  box.style.border = '2px solid #ffb300';
  box.style.borderRadius = '10px';
  box.style.padding = '2em';
  box.style.minWidth = '260px';
  box.style.textAlign = 'center';

  const data = getItemData(item) || { name: item, description: '', actions: [{ actionText: 'Use', actionFunction: () => {} }, { actionText: 'Drop', actionFunction: () => {} }] };
  const title = document.createElement('h2');
  title.textContent = data.name;
  title.style.color = '#ffb300';
  box.appendChild(title);
  if (data.description) {
    const desc = document.createElement('p');
    desc.textContent = data.description;
    desc.style.color = '#eee';
    box.appendChild(desc);
  }
  data.actions.forEach(actionObj => {
    const btn = document.createElement('button');
    btn.textContent = actionObj.actionText;
    btn.className = 'option-btn';
    btn.style.margin = '0.5em 0.5em 0 0';
    btn.onclick = () => handleItemAction(actionObj, row, col);
    box.appendChild(btn);
  });
  const cancel = document.createElement('button');
  cancel.textContent = 'Cancel';
  cancel.className = 'option-btn';
  cancel.style.margin = '1em 0 0 0';
  cancel.onclick = () => popup.remove();
  box.appendChild(cancel);
  popup.appendChild(box);
  document.body.appendChild(popup);
}

// Handle item action from popup
function handleItemAction(actionObj, row, col) {
  const item = inventory[row][col];
  if (!item) return;
  // Debug item action selection
  log(`[Inventory] Item action selected: item="${item}", actionText="${actionObj.actionText}", functionFile="${actionObj.functionFile}", functionName="${actionObj.functionName}"`);
  // Dynamically require and call the correct function if specified
  let called = false;
  if (actionObj.functionFile && actionObj.functionName) {
    try {
      // Only allow requiring from the current directory for safety
      const mod = require('./' + actionObj.functionFile.replace('.js', ''));
      if (typeof mod[actionObj.functionName] === 'function') {
        mod[actionObj.functionName](item, row, col);
        called = true;
      }
    } catch (e) {
      log(`[Inventory] Failed to call ${actionObj.functionName} from ${actionObj.functionFile}: ${e}`);
    }
  }
  // Fallback to actionFunction if present and not already called
  if (!called && typeof actionObj.actionFunction === 'function') {
    actionObj.actionFunction(item, row, col);
  }
  // For demo, treat all as drop: remove item and update grid
  removeItem(item);
  renderInventoryGrid();
  const popup = document.getElementById('inventory-item-popup');
  if (popup) popup.remove();
}


// Use item at specific grid location
function useItemAt(row, col) {
  const item = inventory[row][col];
  if (item) {
    updateGameText(`You used ${item}.`);
    removeItem(item);
    closeInventory();
  }
}

function clearOptions() {
  // Remove all current options
  const options = getPlayerOptions();
  options.forEach(opt => removePlayerOption(opt.id));
}

/**
 * Check if the inventory contains a given item string
 * @param {string} itemName - The item to check for
 * @returns {boolean} True if found, false otherwise
 */
function hasItem(itemName) {
  for (let row = 0; row < INVENTORY_ROWS; row++) {
    for (let col = 0; col < INVENTORY_COLS; col++) {
      if (inventory[row][col] === itemName) {
        return true;
      }
    }
  }
  return false;
}

module.exports = {
  addItem,
  removeItem,
  openInventory,
  closeInventory,
  useItemAt,
  moveItem,
  getInventory: () => inventory,
  hasItem,
  INVENTORY_ROWS,
  INVENTORY_COLS
};
