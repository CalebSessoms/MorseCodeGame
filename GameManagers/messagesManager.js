// messagesManager.js
// Handles opening, closing, and interacting with the messages menu

const { hidePlayerOptions, showPlayerOptions } = require('./playerOptions');

function openMessages() {
  // Hide inventory grid and close-inventory button if open
  document.getElementById('inventory-grid-container').style.display = 'none';
  document.getElementById('close-inventory-btn').style.display = 'none';
  document.getElementById('inventory-btn').style.display = 'inline-block';

  // Hide player options
  hidePlayerOptions();

  // Show messages grid
  const messagesGrid = document.getElementById('messages-grid-container');
  messagesGrid.innerHTML = '';
  messagesGrid.style.display = 'block';
  // Blank area for future messages
  const blank = document.createElement('div');
  blank.style.height = '120px';
  messagesGrid.appendChild(blank);

  // Show/hide correct buttons in button row
  const invBtn = document.getElementById('inventory-btn');
  const closeInvBtn = document.getElementById('close-inventory-btn');
  const messagesBtn = document.getElementById('messages-btn');
  let closeMessagesBtn = document.getElementById('close-messages-btn');
  let invMessagesBtn = document.getElementById('inv-messages-btn');

  // Create if not present
  if (!closeMessagesBtn) {
    closeMessagesBtn = document.createElement('button');
    closeMessagesBtn.id = 'close-messages-btn';
    closeMessagesBtn.className = messagesBtn.className; // match style
    closeMessagesBtn.style.cssText = messagesBtn.style.cssText; // match inline style
    closeMessagesBtn.textContent = 'Close Messages';
    closeMessagesBtn.onclick = closeMessages;
    messagesBtn.parentNode.insertBefore(closeMessagesBtn, messagesBtn.nextSibling);
  }
  if (!invMessagesBtn) {
    invMessagesBtn = document.createElement('button');
    invMessagesBtn.id = 'inv-messages-btn';
    invMessagesBtn.className = invBtn.className; // match style
    invMessagesBtn.style.cssText = invBtn.style.cssText; // match inline style
    invMessagesBtn.textContent = 'Inventory';
    invMessagesBtn.onclick = () => {
      closeMessages();
      invBtn.click();
    };
    closeMessagesBtn.parentNode.insertBefore(invMessagesBtn, closeMessagesBtn);
  }

  // Show only messages-related buttons
  invBtn.style.display = 'none';
  closeInvBtn.style.display = 'none';
  messagesBtn.style.display = 'none';
  closeMessagesBtn.style.display = 'inline-block';
  invMessagesBtn.style.display = 'inline-block';
}

function closeMessages() {
  document.getElementById('messages-grid-container').style.display = 'none';
  // Show player options again
  showPlayerOptions();
  // Restore button row to default (Inventory, Messages)
  const invBtn = document.getElementById('inventory-btn');
  const closeInvBtn = document.getElementById('close-inventory-btn');
  const messagesBtn = document.getElementById('messages-btn');
  const closeMessagesBtn = document.getElementById('close-messages-btn');
  const invMessagesBtn = document.getElementById('inv-messages-btn');
  invBtn.style.display = 'inline-block';
  closeInvBtn.style.display = 'none';
  messagesBtn.style.display = 'inline-block';
  if (closeMessagesBtn) closeMessagesBtn.style.display = 'none';
  if (invMessagesBtn) invMessagesBtn.style.display = 'none';
}


// In-memory messages array
let messages = [];
let nextMessageId = 1;

/**
 * Add a message to the messages array
 * @param {string|object} msg - Message text or object
 * @returns {object} The added message object
 */
function addMessage(msg) {
  const messageObj = typeof msg === 'object' ? { ...msg } : { text: msg };
  messageObj.id = nextMessageId++;
  messages.push(messageObj);
  return messageObj;
}



/**
 * Delete a message by id
 * @param {number} id - The id of the message to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deleteMessage(id) {
  const idx = messages.findIndex(m => m.id === id);
  if (idx !== -1) {
    messages.splice(idx, 1);
    return true;
  }
  return false;
}

module.exports = {
  openMessages,
  closeMessages,
  addMessage,
  deleteMessage
};
