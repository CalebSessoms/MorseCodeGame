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
  // Hide main game area
  const mainArea = document.getElementById('game-main-area');
  if (mainArea) mainArea.style.display = 'none';

  // Show messages grid
  const messagesGrid = document.getElementById('messages-grid-container');
  messagesGrid.style.display = 'block';
  // Show toggle row and sections
  const encryptedBtn = document.getElementById('encrypted-btn');
  const decryptedBtn = document.getElementById('decrypted-btn');
  const encryptedSection = document.getElementById('encrypted-messages-section');
  const decryptedSection = document.getElementById('decrypted-messages-section');
  if (encryptedBtn && decryptedBtn && encryptedSection && decryptedSection) {
    encryptedBtn.onclick = () => {
      encryptedSection.style.display = 'block';
      decryptedSection.style.display = 'none';
      encryptedBtn.style.background = '#ffb300';
      encryptedBtn.style.color = '#222';
      decryptedBtn.style.background = '#333';
      decryptedBtn.style.color = '#fff';
    };
    decryptedBtn.onclick = () => {
      encryptedSection.style.display = 'none';
      decryptedSection.style.display = 'block';
      decryptedBtn.style.background = '#ffb300';
      decryptedBtn.style.color = '#222';
      encryptedBtn.style.background = '#333';
      encryptedBtn.style.color = '#fff';
    };
    // Default to encrypted view
    encryptedBtn.click();
  }

  // Render messages in the sections
  renderMessagesSections();

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
  // Show main game area again
  const mainArea = document.getElementById('game-main-area');
  if (mainArea) mainArea.style.display = 'block';
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

// Render messages in the encrypted and decrypted sections
function renderMessagesSections() {
  const encryptedSection = document.getElementById('encrypted-messages-section');
  const decryptedSection = document.getElementById('decrypted-messages-section');
  if (!encryptedSection || !decryptedSection) return;
  // For now, just show a placeholder if empty
  if (messages.length === 0) {
    encryptedSection.innerHTML = '<div style="color:#888;">No encrypted messages yet.</div>';
    decryptedSection.innerHTML = '<div style="color:#888;">No decrypted messages yet.</div>';
    return;
  }
  // Example: split messages by a property (future: encrypted/decrypted)
  const encryptedMsgs = messages.filter(m => m.encrypted !== false);
  const decryptedMsgs = messages.filter(m => m.encrypted === false);
  encryptedSection.innerHTML = encryptedMsgs.length ? encryptedMsgs.map(m => `<div style='margin-bottom:0.5em;'>${m.text}</div>`).join('') : '<div style="color:#888;">No encrypted messages yet.</div>';
  decryptedSection.innerHTML = decryptedMsgs.length ? decryptedMsgs.map(m => `<div style='margin-bottom:0.5em;'>${m.text}</div>`).join('') : '<div style="color:#888;">No decrypted messages yet.</div>';
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
