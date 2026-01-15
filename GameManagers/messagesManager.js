/**
 * Play a Morse code message using morse.mp3 for dits and dahs
 * @param {MorseMessage|object} message - MorseMessage object or compatible
 */
function playMorseMessage(message) {
  if (!message || !message.symbols || !Array.isArray(message.symbols)) return;
  log(`[MorseMessage] Play: id=${message.id}, text="${message.text}", encrypted=${message.encrypted}`);
  const BASE_DIT = 120; // ms, base short beep
  const BASE_DAH = Math.round(BASE_DIT * 2.25); // ms, base dah
  const BASE_SYMBOL_PAUSE = 120; // ms, base pause between symbols
  const BASE_WORD_PAUSE = 480; // ms, base pause between words
  const DIT = BASE_DIT * shortLength;
  const DAH = BASE_DAH * longLength;
  const SYMBOL_PAUSE = BASE_SYMBOL_PAUSE * shortLength;
  const WORD_PAUSE = BASE_WORD_PAUSE * shortLength;
  let idx = 0;
  if (!playMorseMessage._oscillators) playMorseMessage._oscillators = [];
  function clearHighlight() {
    const symbolSpans = document.querySelectorAll(`.morse-symbols[data-msg-id='${message.id}'] .morse-symbol`);
    symbolSpans.forEach(span => { span.style.background = ''; span.style.color = ''; });
  }
  if (playMorseMessage._playing) {
    playMorseMessage._playing = false;
    if (playMorseMessage._oscillators) {
      playMorseMessage._oscillators.forEach(o => { try { o.stop(); } catch(e){} });
      playMorseMessage._oscillators = [];
    }
    clearHighlight();
    log(`[MorseMessage] Stopped playback`);
    return;
  }
  playMorseMessage._playing = true;
  playMorseMessage._oscillators = [];
  clearHighlight();
  function playNext() {
    if (!playMorseMessage._playing) return;
    if (idx >= message.symbols.length) {
      playMorseMessage._playing = false;
      if (playMorseMessage._oscillators) {
        playMorseMessage._oscillators.forEach(o => { try { o.stop(); } catch(e){} });
        playMorseMessage._oscillators = [];
      }
      clearHighlight();
      return;
    }
    const symbol = message.symbols[idx];
    if (idx > 0) {
      const prevSpan = document.querySelector(`.morse-symbols[data-msg-id='${message.id}'] .morse-symbol[data-symbol-idx='${idx-1}']`);
      if (prevSpan) {
        prevSpan.style.background = '';
        prevSpan.style.color = '';
      }
    }
    if (symbol.type === 'dit' || symbol.type === 'dah') {
      const symbolSpan = document.querySelector(`.morse-symbols[data-msg-id='${message.id}'] .morse-symbol[data-symbol-idx='${idx}']`);
      if (symbolSpan) {
        symbolSpan.style.background = '#ffb300';
        symbolSpan.style.color = '#222';
      }
    }
    if (symbol.type === 'dit') {
      const audio = new Audio('Resources/Audio/dit.mp3');
      playMorseMessage._audios = playMorseMessage._audios || [];
      playMorseMessage._audios.push(audio);
      audio.currentTime = 0;
      audio.play();
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        idx++;
        setTimeout(playNext, SYMBOL_PAUSE);
      }, DIT);
    } else if (symbol.type === 'dah') {
      const audio = new Audio('Resources/Audio/dah.mp3');
      playMorseMessage._audios = playMorseMessage._audios || [];
      playMorseMessage._audios.push(audio);
      audio.currentTime = 0;
      audio.play();
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        idx++;
        setTimeout(playNext, SYMBOL_PAUSE);
      }, DAH);
    } else if (symbol.type === 'space') {
      idx++;
      setTimeout(playNext, SYMBOL_PAUSE);
    } else if (symbol.type === 'wordspace') {
      idx++;
      setTimeout(playNext, WORD_PAUSE);
    } else {
      idx++;
      playNext();
    }
  }
  playNext();
}

// ...removed Web Audio API beep generation...

// Morse timing variables
let shortLength = 1; // affects dits and character pauses
let longLength = 1.2 // affects dahs

// messagesManager.js
// Handles opening, closing, and interacting with the messages menu

const { hidePlayerOptions, showPlayerOptions } = require('./playerOptions');
const { log } = require('./debugLogger');

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
    // Split messages by encrypted/decrypted
    const encryptedMsgs = messages.filter(m => m.encrypted !== false);
    const decryptedMsgs = messages.filter(m => m.encrypted === false);
    // Render Morse visually (dots/dashes) and text
    function renderMorseSymbols(symbols, msgId) {
      let html = '';
      for (let i = 0; i < symbols.length; i++) {
        const s = symbols[i];
        if (s.type === 'dit' || s.type === 'dah') {
          html += `<span class='morse-symbol' data-symbol-idx='${i}' style='padding:0 2px;'>${s.type === 'dit' ? '•' : '–'}</span>`;
        } else if (s.type === 'space') {
          html += ' ';
        } else if (s.type === 'wordspace') {
          html += '  ';
        }
      }
      return `<span class='morse-symbols' data-msg-id='${msgId}'>${html}</span>`;
    }
    encryptedSection.innerHTML = encryptedMsgs.length ? encryptedMsgs.map((m, i) => `
      <div class='morse-message-box' style='margin-bottom:0.5em; border:2px solid #ffb300; border-radius:8px; padding:1em; background:#222; cursor:pointer;' data-msg-idx='enc-${i}'>
        <div><b>From:</b> ${m.sender || 'Unknown'} <b>Time:</b> ${new Date(m.timestamp).toLocaleString()}</div>
      </div>
    `).join('') : '<div style="color:#888;">No encrypted messages yet.</div>';
    decryptedSection.innerHTML = decryptedMsgs.length ? decryptedMsgs.map((m, i) => `
      <div class='morse-message-box' style='margin-bottom:0.5em; border:2px solid #ffb300; border-radius:8px; padding:1em; background:#222; cursor:pointer;' data-msg-idx='dec-${i}'>
        <div><b>From:</b> ${m.sender || 'Unknown'} <b>Time:</b> ${new Date(m.timestamp).toLocaleString()}</div>
        <div><b>Text:</b> ${m.text}</div>
      </div>
    `).join('') : '<div style="color:#888;">No decrypted messages yet.</div>';

    // Add click listeners to open message modal
    Array.from(encryptedSection.querySelectorAll('.morse-message-box')).forEach((box, i) => {
      box.onclick = () => {
        openMessageModal(encryptedMsgs[i]);
      };
    });
    Array.from(decryptedSection.querySelectorAll('.morse-message-box')).forEach((box, i) => {
      box.onclick = () => {
        openMessageModal(decryptedMsgs[i]);
      };
    });
// Modal for viewing and controlling a single message
function openMessageModal(message) {
  // Remove any existing modal
  let oldModal = document.getElementById('morse-message-modal');
  if (oldModal) oldModal.remove();
  // Create modal
  const modal = document.createElement('div');
  modal.id = 'morse-message-modal';
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = '#222';
  modal.style.border = '2px solid #ffb300';
  modal.style.borderRadius = '10px';
  modal.style.padding = '2em';
  modal.style.zIndex = '9999';
  modal.style.minWidth = '320px';
  modal.style.maxWidth = '90vw';
  modal.style.boxShadow = '0 0 24px #000';
  // Message content
  modal.innerHTML = `
    <div style='margin-bottom:1em;'>
      <b>From:</b> ${message.sender || 'Unknown'}<br>
      <b>Time:</b> ${new Date(message.timestamp).toLocaleString()}<br>
      ${message.encrypted === false && message.text ? `<b>Text:</b> ${message.text}<br>` : ''}
      <div style='margin-top:1em;'>${renderMorseSymbols(message.symbols, 'modal-' + message.id)}</div>
    </div>
    <div style='display:flex; gap:1em; margin-bottom:1em;'>
      <button id='play-pause-message-btn' style='flex:1; padding:0.5em 1em; background:#ffb300; color:#222; border:none; border-radius:6px; font-weight:bold; cursor:pointer;'>Play</button>
      <button id='close-message-btn' style='flex:1; padding:0.5em 1em; background:#333; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;'>Close</button>
    </div>
    ${message.encrypted ? `
      <div style='margin-top:1em; display:flex; gap:0.5em;'>
        <input id='decrypt-input' type='text' placeholder='Enter decrypted text...' style='flex:2; padding:0.5em; border-radius:6px; border:1px solid #888; background:#111; color:#fff;'>
        <button id='decrypt-btn' style='flex:1; padding:0.5em 1em; background:#2196f3; color:#fff; border:none; border-radius:6px; font-weight:bold; cursor:pointer;'>Decrypt</button>
      </div>
    ` : ''}
  `;
  document.body.appendChild(modal);
  // Decrypt logic for encrypted messages
  if (message.encrypted) {
    const decryptBtn = document.getElementById('decrypt-btn');
    const decryptInput = document.getElementById('decrypt-input');
    if (decryptBtn && decryptInput) {
      decryptBtn.onclick = () => {
        const val = decryptInput.value.trim();
        log("test1");
        if (val) {
          log("test2");
          if (decryptHelper(val)) {
            modal.remove();
            openMessages(); // refresh message list
          } else {
            decryptInput.style.border = '2px solid #f00';
            decryptInput.value = '';
            decryptInput.placeholder = 'Incorrect, try again...';
          }
        }
      };
    }
  }
  // Play/pause logic
  let isPlaying = false;
  const playPauseBtn = document.getElementById('play-pause-message-btn');
  // Patch playMorseMessage to highlight in modal
  const highlightId = 'modal-' + message.id;
  function playMorseMessageInModal(msg) {
    if (!msg || !msg.symbols || !Array.isArray(msg.symbols)) return;
    log(`[MorseMessage] Play: id=${msg.id}, text="${msg.text}", encrypted=${msg.encrypted}`);
    const BASE_DIT = 120;
    const BASE_DAH = Math.round(BASE_DIT * 2.25);
    const BASE_SYMBOL_PAUSE = 120;
    const BASE_WORD_PAUSE = 480;
    const DIT = BASE_DIT * shortLength;
    const DAH = BASE_DAH * longLength;
    const SYMBOL_PAUSE = BASE_SYMBOL_PAUSE * shortLength;
    const WORD_PAUSE = BASE_WORD_PAUSE * shortLength;
    let idx = 0;
    if (!playMorseMessageInModal._audios) playMorseMessageInModal._audios = [];
    function clearHighlight() {
      const symbolSpans = document.querySelectorAll(`.morse-symbols[data-msg-id='${highlightId}'] .morse-symbol`);
      symbolSpans.forEach(span => { span.style.background = ''; span.style.color = ''; });
    }
    if (playMorseMessageInModal._playing) {
      playMorseMessageInModal._playing = false;
      playMorseMessageInModal._audios.forEach(a => { try { a.pause(); a.currentTime = 0; } catch(e){} });
      playMorseMessageInModal._audios = [];
      clearHighlight();
      log(`[MorseMessage] Stopped playback`);
      return;
    }
    playMorseMessageInModal._playing = true;
    playMorseMessageInModal._audios = [];
    clearHighlight();
    function playNext() {
      if (!playMorseMessageInModal._playing) return;
      if (idx >= msg.symbols.length) {
        playMorseMessageInModal._playing = false;
        playMorseMessageInModal._audios.forEach(a => { try { a.pause(); a.currentTime = 0; } catch(e){} });
        playMorseMessageInModal._audios = [];
        clearHighlight();
        return;
      }
      const symbol = msg.symbols[idx];
      if (idx > 0) {
        const prevSpan = document.querySelector(`.morse-symbols[data-msg-id='${highlightId}'] .morse-symbol[data-symbol-idx='${idx-1}']`);
        if (prevSpan) {
          prevSpan.style.background = '';
          prevSpan.style.color = '';
        }
      }
      if (symbol.type === 'dit' || symbol.type === 'dah') {
        const symbolSpan = document.querySelector(`.morse-symbols[data-msg-id='${highlightId}'] .morse-symbol[data-symbol-idx='${idx}']`);
        if (symbolSpan) {
          symbolSpan.style.background = '#ffb300';
          symbolSpan.style.color = '#222';
        }
      }
      if (symbol.type === 'dit') {
        const audio = new Audio('Resources/Audio/dit.mp3');
        playMorseMessageInModal._audios.push(audio);
        audio.currentTime = 0;
        audio.play();
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          idx++;
          setTimeout(playNext, SYMBOL_PAUSE);
        }, DIT);
      } else if (symbol.type === 'dah') {
        const audio = new Audio('Resources/Audio/dah.mp3');
        playMorseMessageInModal._audios.push(audio);
        audio.currentTime = 0;
        audio.play();
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          idx++;
          setTimeout(playNext, SYMBOL_PAUSE);
        }, DAH);
      } else if (symbol.type === 'space') {
        idx++;
        setTimeout(playNext, SYMBOL_PAUSE);
      } else if (symbol.type === 'wordspace') {
        idx++;
        setTimeout(playNext, WORD_PAUSE);
      } else {
        idx++;
        playNext();
      }
    }
    playNext();
  }
  playPauseBtn.onclick = () => {
    if (!isPlaying) {
      playMorseMessageInModal(message);
      playPauseBtn.textContent = 'Pause';
      isPlaying = true;
    } else {
      playMorseMessageInModal(message); // toggles stop
      playPauseBtn.textContent = 'Play';
      isPlaying = false;
    }
  };
  // Close logic
  document.getElementById('close-message-btn').onclick = () => {
    if (isPlaying) playMorseMessageInModal(message); // ensure playback stops
    modal.remove();
  };
}
}



// MorseMessage class for structured Morse code messages
class MorseMessage {
  constructor({ text, morse, symbols, encrypted = true, sender = '', timestamp = Date.now() }) {
    this.id = MorseMessage.nextId++;
    this.text = text; // Plain text
    this.morse = morse; // Morse code string
    this.symbols = symbols || MorseMessage.parseMorse(morse); // Array of {type: 'dit'|'dah'|'space'}
    this.encrypted = encrypted;
    this.sender = sender;
    this.timestamp = timestamp;
  }
  // Parse a morse string into symbols array
  static parseMorse(morseStr) {
    if (!morseStr) return [];
    const symbols = [];
    for (const char of morseStr) {
      if (char === '.') symbols.push({ type: 'dit' });
      else if (char === '-') symbols.push({ type: 'dah' });
      else if (char === ' ') symbols.push({ type: 'space' });
      else if (char === '/') symbols.push({ type: 'wordspace' });
    }
    return symbols;
  }
}
MorseMessage.nextId = 1;

// In-memory messages array
let messages = [];




/**
 * Add a MorseMessage to the messages array
 * @param {string|object|MorseMessage} input - Plain text, options object, or MorseMessage
 * @returns {MorseMessage} The added message object
 */
function addMessage(input) {
  let messageObj;
  if (input instanceof MorseMessage) {
    messageObj = input;
  } else if (typeof input === 'object') {
    // If object, use its properties
    // If no morse, auto-generate from text
    const morse = input.morse || encodeToMorse(input.text || '');
    messageObj = new MorseMessage({ ...input, morse });
  } else if (typeof input === 'string') {
    // If just a string, treat as encrypted by default
    const morse = encodeToMorse(input);
    messageObj = new MorseMessage({ text: input, morse, encrypted: true });
  } else {
    throw new Error('Invalid input to addMessage');
  }
  messages.push(messageObj);
  log(`[MorseMessage] Added: id=${messageObj.id}, text="${messageObj.text}", encrypted=${messageObj.encrypted}`);
  return messageObj;
}

// Simple Morse code encoder (A-Z, 0-9, space)
const MORSE_TABLE = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  ' ': '/',
};
function encodeToMorse(text) {
  return (text || '').toUpperCase().split('').map(ch => MORSE_TABLE[ch] || '').join(' ');
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

/**
 * Decrypt a MorseMessage by id or object
 * @param {number|MorseMessage} msgOrId - The message object or its id
 * @param {string} [decryptedText] - Optional decrypted text to set
 * @returns {boolean} True if decrypted, false if not found
 */
function decryptMessage(msgOrId, decryptedText) {
  let msg = null;
  if (typeof msgOrId === 'number') {
    msg = messages.find(m => m.id === msgOrId);
  } else if (typeof msgOrId === 'object' && msgOrId instanceof MorseMessage) {
    msg = msgOrId;
  }
  if (!msg) return false;
  msg.encrypted = false;
  if (decryptedText) msg.text = decryptedText;
  log(`[MorseMessage] Decrypted: id=${msg.id}, text="${msg.text}", encrypted=${msg.encrypted}`);
  return true;
}

/**
 * Helper to decrypt a message by matching user input to encrypted message text
 * @param {string} candidateText - The user input to match against encrypted messages' text
 * @returns {boolean} True if a message was decrypted, false otherwise
 */
function decryptHelper(candidateText) {
  const encryptedTexts = messages.filter(m => m.encrypted).map(m => m.text);
  log(`[MorseMessage] DecryptHelper: candidate="${candidateText}", all_encrypted_texts=${JSON.stringify(encryptedTexts)}`);
  const msg = messages.find(m => m.encrypted && m.text === candidateText);
  if (msg) {
    log(`[MorseMessage] DecryptHelper: matched actual="${msg.text}"`);
  }
  if (msg) {
    return decryptMessage(msg, candidateText);
  }
  return false;
}

module.exports = {
  openMessages,
  closeMessages,
  addMessage,
  deleteMessage,
  playMorseMessage,
  decryptMessage,
  decryptHelper
};
