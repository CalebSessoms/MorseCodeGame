const { log } = require('./debugLogger');
// ...existing code...
let getRandomMessage;
try {
  ({ getRandomMessage } = require('./arcade.js'));
  log('[Require] arcade.js loaded successfully');
} catch (err) {
  log('[Require] arcade.js failed to load:', err);
}
// menuManager.js
// Handles main menu, settings, and pause popup logic



function showMainMenu() {
  hideAllSections();
  inGame = false;
  // Hide game area and button row when menu is shown
  const mainArea = document.getElementById('game-main-area');
  const buttonRow = document.getElementById('button-row');
  if (mainArea) mainArea.style.display = 'none';
  if (buttonRow) buttonRow.style.display = 'none';
  let menu = document.getElementById('main-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'main-menu';
    menu.style.position = 'absolute';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.width = '100vw';
    menu.style.height = '100vh';
    menu.style.background = '#181818';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    menu.style.alignItems = 'center';
    menu.style.justifyContent = 'center';
    menu.style.zIndex = '10000';
    menu.innerHTML = `
      <h1 style='color:#ffb300; margin-bottom:2em;'>Morse Code Game</h1>
      <button id='menu-story-btn' class='menu-btn'>Story</button>
      <button id='menu-survival-btn' class='menu-btn'>Survival</button>
      <button id='menu-practice-btn' class='menu-btn'>Morse Code Practice</button>
      <button id='menu-settings-btn' class='menu-btn'>Settings</button>
    `;
    document.body.appendChild(menu);
    styleMenuButtons();
    document.getElementById('menu-story-btn').onclick = () => {
      // Show story mode popup
      if (document.getElementById('story-popup')) return;
      const popup = document.createElement('div');
      popup.id = 'story-popup';
      popup.style.position = 'fixed';
      popup.style.top = '50%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -50%)';
      popup.style.background = '#222';
      popup.style.border = '2px solid #ffb300';
      popup.style.borderRadius = '10px';
      popup.style.padding = '2em';
      popup.style.zIndex = '10001';
      popup.style.minWidth = '320px';
      popup.style.boxShadow = '0 0 24px #000';
      popup.innerHTML = `
        <button id='story-popup-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
        <h2 style='color:#ffb300; margin-bottom:1em;'>Story Mode</h2>
        <button id='load-saved-game-btn' class='menu-btn'>Load Saved Game</button>
        <button id='start-new-game-btn' class='menu-btn'>Start New Game</button>
      `;
      document.body.appendChild(popup);
      styleMenuButtons();
      document.getElementById('story-popup-close-btn').onclick = () => popup.remove();
      document.getElementById('load-saved-game-btn').onclick = () => {
        const { loadGame } = require('./loadManager');
        const { loadGameState } = require('./gameStateManager');
        const saveObj = loadGame();
        if (saveObj) {
          popup.remove();
          menu.style.display = 'none';
          // Show game area and button row
          const mainArea = document.getElementById('game-main-area');
          const buttonRow = document.getElementById('button-row');
          if (mainArea) mainArea.style.display = 'block';
          if (buttonRow) buttonRow.style.display = 'flex';
          loadGameState(saveObj);
        } else {
          // Optionally show a message: no save found
          alert('No saved game found.');
        }
      };
      document.getElementById('start-new-game-btn').onclick = () => {
        popup.remove();
        menu.style.display = 'none';
        // Show game area and button row
        const mainArea = document.getElementById('game-main-area');
        const buttonRow = document.getElementById('button-row');
        if (mainArea) mainArea.style.display = 'block';
        if (buttonRow) buttonRow.style.display = 'flex';
        // Require here to avoid circular dependency
        const { startGame } = require('./gameStateManager');
        startGame();
      };
    };
    document.getElementById('menu-survival-btn').onclick = () => {};
    document.getElementById('menu-practice-btn').onclick = () => {
      if (document.getElementById('practice-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'practice-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '50%';
      overlay.style.left = '50%';
      overlay.style.transform = 'translate(-50%, -50%)';
      overlay.style.background = '#222';
      overlay.style.border = '2px solid #ffb300';
      overlay.style.borderRadius = '10px';
      overlay.style.padding = '2em';
      overlay.style.zIndex = '10001';
      overlay.style.minWidth = '320px';
      overlay.style.maxWidth = '90vw';
      overlay.style.height = 'auto';
      overlay.style.maxHeight = '80vh';
      overlay.style.boxShadow = '0 0 24px #000';
      overlay.innerHTML = `
        <button id='practice-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
        <h2 style='color:#ffb300; margin-bottom:1em;'>Practice Mode</h2>
        <div id='practice-grid' style='display:grid; grid-template-columns:repeat(3, 64px); grid-template-rows:repeat(3, 64px); gap:18px; margin-top:2em;'>
          <div id='practice-level-1' style='background:#ffb300; color:#222; display:flex; align-items:center; justify-content:center; font-size:2em; font-weight:bold; border-radius:10px; box-shadow:0 2px 8px #000; cursor:pointer;'>1</div>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById('practice-close-btn').onclick = function() {
        overlay.remove();
        showMainMenu();
      };
      // When a level is selected, open telegraph UI and close overlay
      document.getElementById('practice-level-1').onclick = function() {
        // On practice mode launch, generate and add a random message, and notify the user
        try {
          log('[PracticeMode] Starting practice mode, generating and adding first random message');
          const { getMessages, addMessage } = require('./messagesManager');
          const { showNotification } = require('./notification');
          const msgs = getMessages();
          if (msgs.length === 0 && getRandomMessage) {
            const randomMsg = getRandomMessage(1); // Level 1
            addMessage(randomMsg);
            showNotification('Practice message received! Check your incoming messages.', 'achievement');
            log('[PracticeMode] Random message added and user notified.');
          }
        } catch(e) { log('[PracticeMode] Error adding random message:', e); }
        overlay.remove();
        // Hide menu and game area, show only telegraph UI as a full screen
        const menu = document.getElementById('main-menu');
        const mainArea = document.getElementById('game-main-area');
        const buttonRow = document.getElementById('button-row');
        if (menu) menu.style.display = 'none';
        if (mainArea) mainArea.style.display = 'none';
        if (buttonRow) buttonRow.style.display = 'none';
        if (document.getElementById('practice-telegraph-ui')) return;
        const telegraph = document.createElement('div');
        telegraph.id = 'practice-telegraph-ui';
        telegraph.style.position = 'fixed';
        telegraph.style.top = '0';
        telegraph.style.left = '0';
        telegraph.style.width = '100vw';
        telegraph.style.height = '100vh';
        telegraph.style.background = '#181818';
        telegraph.style.display = 'flex';
        telegraph.style.flexDirection = 'column';
        telegraph.style.alignItems = 'center';
        telegraph.style.justifyContent = 'center';
        telegraph.style.zIndex = '10010';
        telegraph.innerHTML = `
          <h2 style='color:#ffb300; margin-bottom:1em;'>Telegraph Practice</h2>
          <div style='display:flex; gap:2em; margin-bottom:2em;'>
            <button id='practice-incoming-btn' class='menu-btn'>View Incoming Messages</button>
            <button id='practice-send-btn' class='menu-btn'>Send Message</button>
          </div>
          <div style='color:#aaa; font-size:1.1em;'>Practice your Morse code skills by receiving and sending messages.</div>
        `;
        document.body.appendChild(telegraph);
        styleMenuButtons();

        // Send Message modal logic
        document.getElementById('practice-send-btn').onclick = function() {
          if (document.getElementById('practice-send-modal')) return;
          const sendModal = document.createElement('div');
          sendModal.id = 'practice-send-modal';
          sendModal.style.position = 'fixed';
          sendModal.style.top = '50%';
          sendModal.style.left = '50%';
          sendModal.style.transform = 'translate(-50%, -50%)';
          sendModal.style.background = '#292929';
          sendModal.style.border = '2px solid #ffb300';
          sendModal.style.borderRadius = '10px';
          sendModal.style.padding = '2em';
          sendModal.style.zIndex = '10020';
          sendModal.style.minWidth = '340px';
          sendModal.style.maxWidth = '90vw';
          sendModal.style.maxHeight = '70vh';
          sendModal.style.overflowY = 'auto';
          sendModal.innerHTML = `
            <button id='practice-send-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
            <h3 style='color:#ffb300; margin-bottom:1em;'>Send Message (Telegraph)</h3>
            <div id='practice-send-display' style='background:#222; color:#fff; border-radius:6px; padding:1em; min-height:2em; margin-bottom:1em; font-size:1.2em;'></div>
            <div style='color:#aaa; font-size:1em;'>Use left/right mouse buttons to enter Morse code. Hold for dah, tap for dit.</div>
          `;
          document.body.appendChild(sendModal);
          document.getElementById('practice-send-close-btn').onclick = () => {
            // On close, store the most recent message if any
            if (currentInput.trim().length > 0) {
              const { setLastSentMessage } = require('./messagesManager');
              setLastSentMessage({ morse: currentInput, timestamp: Date.now(), sender: 'player' });
            }
            sendModal.remove();
          };

          // Basic telegraph input logic

          let currentInput = '';
          const display = sendModal.querySelector('#practice-send-display');
          display.textContent = '';

          let ditInterval = null;
          let dahInterval = null;
          let spacingTimer = null;
          let lastInputTime = null;
          let pauseTimeout = null;
          let inputActive = false;
          const LETTER_SPACE_THRESHOLD = 400; // ms (short pause)
          const WORD_SPACE_THRESHOLD = 800; // ms (medium pause)
          const SEND_TIMEOUT = 2000; // ms (long pause)
          const DIT_HOLD_INTERVAL = 400; // ms (slower dit repeat)
          const DAH_HOLD_INTERVAL = 400; // ms (slower dah repeat)
          const { log } = require('./debugLogger');

          function resetSpacingTimer() {
            if (pauseTimeout) clearTimeout(pauseTimeout);
            pauseTimeout = setTimeout(() => {
              if (currentInput.trim().length > 0) {
                const { setLastSentMessage } = require('./messagesManager');
                setLastSentMessage({ morse: currentInput, timestamp: Date.now(), sender: 'player' });
                log(`[TelegraphInput] Message sent: ${currentInput}`);
                let translated = '';
                try {
                  translated = decodeMorseToText(currentInput);
                } catch(e) {}
                if (!translated || translated === '[Invalid]') {
                  translated = '<span style="color:#f55">Invalid message</span>';
                }
                const { showNotification } = require('./notification');
                let notifMsg = 'Message sent: ';
                notifMsg += translated.replace(/<[^>]+>/g, '');
                showNotification(notifMsg, 'notification');
                currentInput = '';
                display.textContent = '';
                inputActive = false;
                display.classList.remove('active');
              }
            }, SEND_TIMEOUT);
          }

          function resetSendTimer(showPopup = true) {
            if (sendTimer) clearTimeout(sendTimer);
            sendTimer = setTimeout(() => {
              if (currentInput.trim().length > 0) {
                const { setLastSentMessage } = require('./messagesManager');
                setLastSentMessage({ morse: currentInput, timestamp: Date.now(), sender: 'player' });
                log(`[TelegraphInput] Message sent: ${currentInput}`);
                if (showPopup) {
                  // Attempt to translate Morse to text
                  let translated = '';
                  try {
                    translated = decodeMorseToText(currentInput);
                  } catch(e) {}
                  if (!translated || translated === '[Invalid]') {
                    translated = '<span style="color:#f55">Invalid message</span>';
                  }
                  // Show notification (story mode style)
                  const { showNotification } = require('./notification');
                  let notifMsg = 'Message sent: ';
                  notifMsg += translated.replace(/<[^>]+>/g, ''); // Remove HTML tags for notification
                  showNotification(notifMsg, 'notification');
                }
                currentInput = '';
                display.textContent = '';
                inputActive = false;
                display.classList.remove('active');
              }
            }, SEND_TIMEOUT);
          }

          // Click to activate/deactivate input
          display.style.cursor = 'pointer';
          display.title = 'Click to start entering Morse code';
          display.classList.remove('active');
          let activationTimer = null;
          display.onclick = function() {
            if (!inputActive) {
              inputActive = true;
              display.classList.add('active');
              display.title = 'Entering Morse code...';
              log('[TelegraphInput] Input activated');
              // Start activation timeout: if no input, deactivate after SEND_TIMEOUT
              if (activationTimer) clearTimeout(activationTimer);
              activationTimer = setTimeout(() => {
                if (inputActive && currentInput.trim().length === 0) {
                  log('[TelegraphInput] Input deactivated by timeout (no input after activation)');
                  inputActive = false;
                  display.classList.remove('active');
                  display.title = 'Click to start entering Morse code';
                }
              }, SEND_TIMEOUT);
            } else {
              // If already active, treat as user ending input early (reset, no popup)
              log('[TelegraphInput] Input deactivated by user click');
              if (sendTimer) clearTimeout(sendTimer);
              if (activationTimer) clearTimeout(activationTimer);
              currentInput = '';
              display.textContent = '';
              inputActive = false;
              display.classList.remove('active');
              display.title = 'Click to start entering Morse code';
            }
          };

          // Prevent Morse input until activated

          // Morse decoder (simple A-Z, 0-9, space)
          function decodeMorseToText(morse) {
            const MORSE_TABLE = {
              '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
              '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
              '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
              '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
              '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z',
              '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
              '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9'
            };
            let text = '';
            try {
              morse = morse.trim();
              if (!morse) return '[Invalid]';
              // Split by wordspace (three spaces)
              const words = morse.split('   ');
              for (const word of words) {
                if (!word) { text += ' '; continue; }
                // Split by letter (single space)
                let letters = word.split(' ');
                for (const l of letters) {
                  if (!l) continue;
                  text += MORSE_TABLE[l] || '?';
                }
                text += ' ';
              }
              text = text.trim();
              if (!text || text.includes('?')) return '[Invalid]';
              return text;
            } catch(e) { return '[Invalid]'; }
          }

          // Mouse event handlers (left: dit, right: dah)
          sendModal.addEventListener('mousedown', function(e) {
            if (!inputActive) return;
            // Cancel activation timer on first input
            if (activationTimer) {
              clearTimeout(activationTimer);
              activationTimer = null;
            }
            if (pauseTimeout) clearTimeout(pauseTimeout);
            // Check time since last input
            const now = Date.now();
            if (lastInputTime) {
              const elapsed = now - lastInputTime;
              if (elapsed >= SEND_TIMEOUT) {
                // Send message
                if (currentInput.trim().length > 0) {
                  const { setLastSentMessage } = require('./messagesManager');
                  setLastSentMessage({ morse: currentInput, timestamp: Date.now(), sender: 'player' });
                  log(`[TelegraphInput] Message sent: ${currentInput}`);
                  let translated = '';
                  try {
                    translated = decodeMorseToText(currentInput);
                  } catch(e) {}
                  if (!translated || translated === '[Invalid]') {
                    translated = '<span style="color:#f55">Invalid message</span>';
                  }
                  const { showNotification } = require('./notification');
                  let notifMsg = 'Message sent: ';
                  notifMsg += translated.replace(/<[^>]+>/g, '');
                  showNotification(notifMsg, 'notification');
                  currentInput = '';
                  display.textContent = '';
                  inputActive = false;
                  display.classList.remove('active');
                }
              } else if (elapsed >= WORD_SPACE_THRESHOLD) {
                currentInput += '   ';
                display.textContent = currentInput;
                log('[TelegraphInput] Inserted space (wordspace)');
              } else if (elapsed >= LETTER_SPACE_THRESHOLD) {
                currentInput += ' ';
                display.textContent = currentInput;
                log('[TelegraphInput] Inserted space (letterspace)');
              }
            }
            lastInputTime = now;
            if (e.button === 0) { // Left mouse: dits
              if (ditInterval) return;
              currentInput += '.';
              display.textContent = currentInput;
              log(`[TelegraphInput] Dit entered (tap/hold): ${currentInput}`);
              try {
                const audio = new Audio('Resources/Audio/dit.mp3');
                audio.currentTime = 0;
                audio.play();
              } catch(e) {}
              ditInterval = setInterval(() => {
                currentInput += '.';
                display.textContent = currentInput;
                log(`[TelegraphInput] Dit entered (hold): ${currentInput}`);
                try {
                  const audio = new Audio('Resources/Audio/dit.mp3');
                  audio.currentTime = 0;
                  audio.play();
                } catch(e) {}
              }, 400);
            } else if (e.button === 2) { // Right mouse: dahs
              if (dahInterval) return;
              currentInput += '-';
              display.textContent = currentInput;
              log(`[TelegraphInput] Dah entered (tap/hold): ${currentInput}`);
              try {
                const audio = new Audio('Resources/Audio/dah.mp3');
                audio.currentTime = 0;
                audio.play();
              } catch(e) {}
              dahInterval = setInterval(() => {
                currentInput += '-';
                display.textContent = currentInput;
                log(`[TelegraphInput] Dah entered (hold): ${currentInput}`);
                try {
                  const audio = new Audio('Resources/Audio/dah.mp3');
                  audio.currentTime = 0;
                  audio.play();
                } catch(e) {}
              }, 400);
            }
            resetSpacingTimer();
          });
          sendModal.addEventListener('mouseup', function(e) {
            if (e.button === 0 && ditInterval) {
              clearInterval(ditInterval);
              ditInterval = null;
              log('[TelegraphInput] Dit hold ended');
            } else if (e.button === 2 && dahInterval) {
              clearInterval(dahInterval);
              dahInterval = null;
              log('[TelegraphInput] Dah hold ended');
            }
          });
          // Prevent context menu on right click
          sendModal.addEventListener('contextmenu', e => e.preventDefault());

          sendModal.tabIndex = 0; // Make modal focusable for keyboard events
          sendModal.focus();
        };

        // Set messagesManager to practice mode
        try { require('./messagesManager').setMode('practice'); } catch(e) {}

        // Incoming messages modal logic
        document.getElementById('practice-incoming-btn').onclick = function() {
          if (document.getElementById('practice-incoming-modal')) return;
          log('[PracticeMode] Incoming messages popup opened');
          const modal = document.createElement('div');
          modal.id = 'practice-incoming-modal';
          modal.style.position = 'fixed';
          modal.style.top = '50%';
          modal.style.left = '50%';
          modal.style.transform = 'translate(-50%, -50%)';
          modal.style.background = '#292929';
          modal.style.border = '2px solid #ffb300';
          modal.style.borderRadius = '10px';
          modal.style.padding = '2em';
          modal.style.zIndex = '10020';
          modal.style.minWidth = '340px';
          modal.style.maxWidth = '90vw';
          modal.style.maxHeight = '70vh';
          modal.style.overflowY = 'auto';
          modal.innerHTML = `
            <button id='practice-incoming-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
            <h3 style='color:#ffb300; margin-bottom:1em;'>Incoming Messages</h3>
            <div id='practice-incoming-list' style='margin-top:1em;'></div>
          `;
          document.body.appendChild(modal);
          // Populate messages
          try {
            const { getUndecodedMessages, countMessages, debugAllMessages } = require('./messagesManager');
            countMessages(); // This will log the count
            debugAllMessages(); // Log all messages for debugging
            const msgs = getUndecodedMessages();
            log(`[PracticeMode] Undecoded messages count: ${msgs.length}`);
            const list = modal.querySelector('#practice-incoming-list');
            if (msgs.length === 0) {
              list.innerHTML = `<div style='color:#888;'>No new messages.</div>`;
            } else {
              list.innerHTML = msgs.map(m => {
                let display = m.encryptedText;
                if (!display && m.morse) display = m.morse;
                if (!display && m.text) display = m.text;
                if (!display) display = '[Encrypted Morse Message]';
                return `<div style='margin-bottom:1em; background:#222; color:#fff; border-radius:6px; padding:1em; box-shadow:0 1px 4px #000;'>${display}</div>`;
              }).join('');
            }
          } catch(e) {}
          document.getElementById('practice-incoming-close-btn').onclick = () => modal.remove();
        };

        // Pause popup for practice mode is now handled by the global Escape handler
      };
      // No local Escape handler; global handler manages overlays
    };
    document.getElementById('menu-settings-btn').onclick = () => showSettingsMenu('main');
  } else {
    menu.style.display = 'flex';
  }
}

  let _settingsReturnContext = 'main';
  function showSettingsMenu(context) {
  hideAllSections();
    if (context) _settingsReturnContext = context;
    let settings = document.getElementById('settings-menu');
    if (!settings) {
      settings = document.createElement('div');
      settings.id = 'settings-menu';
      settings.style.position = 'absolute';
      settings.style.top = '0';
      settings.style.left = '0';
      settings.style.width = '100vw';
      settings.style.height = '100vh';
      settings.style.background = '#222';
      settings.style.display = 'flex';
      settings.style.flexDirection = 'column';
      settings.style.alignItems = 'center';
      settings.style.justifyContent = 'center';
      // Raise z-index if opened from practice mode so it appears above telegraph UI
      if (_settingsReturnContext === 'practice-pause') {
        settings.style.zIndex = '10020';
      } else {
        settings.style.zIndex = '10001';
      }
      settings.innerHTML = `
        <button id='settings-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
        <h2 style='color:#ffb300; margin-bottom:2em;'>Settings</h2>
        <div style='color:#aaa; margin-bottom:2em;'>Settings coming soon...</div>
      `;
      document.body.appendChild(settings);
      styleMenuButtons();
      document.getElementById('settings-close-btn').onclick = () => {
        log('[SettingsMenu] Settings close button clicked, return context: ' + _settingsReturnContext);
        // Simulate Escape key press so global handler manages overlays
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(escEvent);
      };
    } else {
      // Raise z-index if opened from practice mode so it appears above telegraph UI
      if (_settingsReturnContext === 'practice-pause') {
        settings.style.zIndex = '10020';
      } else {
        settings.style.zIndex = '10001';
      }
      settings.style.display = 'flex';
    }
}

function showPausePopup() {
  if (document.getElementById('pause-popup')) return;
  let popup = document.createElement('div');
  popup.id = 'pause-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#222';
  popup.style.border = '2px solid #ffb300';
  popup.style.borderRadius = '10px';
  popup.style.padding = '2em';
  popup.style.zIndex = '9999';
  popup.style.minWidth = '320px';
  popup.style.boxShadow = '0 0 24px #000';
  popup.innerHTML = `
    <button id='pause-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
    <h2 style='color:#ffb300; margin-bottom:1em;'>Paused</h2>
    <button id='pause-settings-btn' class='menu-btn'>Settings</button>
    <button id='pause-menu-btn' class='menu-btn'>Return to Menu</button>
  `;
  document.body.appendChild(popup);
  styleMenuButtons();
  document.getElementById('pause-settings-btn').onclick = () => {
    popup.remove();
    showSettingsMenu('pause');
  };
  document.getElementById('pause-menu-btn').onclick = () => {
    // Save game only when returning to menu from pause
    try {
      const { saveGame } = require('./saveManager');
      const { getGameStateForSave } = require('./gameStateManager');
      saveGame(getGameStateForSave());
    } catch (e) { /* ignore for now */ }
    log('[PausePopup] Returning to main menu');
    popup.remove();
    showMainMenu();
  };
  document.getElementById('pause-close-btn').onclick = () => {
    popup.remove();
  };
}

function hideAllSections() {
  const ids = ['main-menu', 'settings-menu', 'pause-popup'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  // Optionally hide game UI here if needed
  // (handled in showMainMenu/startGame)
}

function styleMenuButtons() {
  const btns = document.querySelectorAll('.menu-btn');
  btns.forEach(btn => {
    btn.style.display = 'block';
    btn.style.width = '260px';
    btn.style.margin = '0.5em auto';
    btn.style.padding = '1em';
    btn.style.background = '#ffb300';
    btn.style.color = '#222';
    btn.style.border = 'none';
    btn.style.borderRadius = '8px';
    btn.style.fontWeight = 'bold';
    btn.style.fontSize = '1.2em';
    btn.style.cursor = 'pointer';
    btn.onmouseover = () => btn.style.background = '#ffd54f';
    btn.onmouseout = () => btn.style.background = '#ffb300';
  });
}

// Listen for Escape key to show pause popup only when in game
let inGame = false;
function setInGame(val) { inGame = val; }
document.addEventListener('keydown', e => {
    const practiceSendModal = document.getElementById('practice-send-modal');
  const practiceIncomingModal = document.getElementById('practice-incoming-modal');
  const practiceOverlay = document.getElementById('practice-overlay');
  const practicePausePopup = document.getElementById('practice-pause-popup');
  const telegraphUI = document.getElementById('practice-telegraph-ui');
  // ...existing code...
  const pausePopup = document.getElementById('pause-popup');
  const settingsMenu = document.getElementById('settings-menu');
  const storyPopup = document.getElementById('story-popup');
  if (e.key === 'Escape') {
    if (practiceSendModal) {
      log('[ESC] Closing practice send message modal');
      practiceSendModal.remove();
      return;
    }
    if (storyPopup && storyPopup.style.display !== 'none') {
      log('[ESC] Closing story popup');
      storyPopup.remove();
      return;
    }
    if (settingsMenu && settingsMenu.style.display !== 'none') {
      log('[ESC] Closing settings menu, return context: ' + _settingsReturnContext);
      settingsMenu.style.display = 'none';
      if (_settingsReturnContext === 'pause') {
        log('[ESC] Returning to pause popup');
        showPausePopup();
      } else if (_settingsReturnContext === 'practice-pause') {
        log('[ESC] Returning to practice pause popup');
        // Reopen practice pause popup if needed
        if (!practicePausePopup) {
          let popup = document.createElement('div');
          popup.id = 'practice-pause-popup';
          popup.style.position = 'fixed';
          popup.style.top = '50%';
          popup.style.left = '50%';
          popup.style.transform = 'translate(-50%, -50%)';
          popup.style.background = '#222';
          popup.style.border = '2px solid #ffb300';
          popup.style.borderRadius = '10px';
          popup.style.padding = '2em';
          popup.style.zIndex = '10020';
          popup.style.minWidth = '320px';
          popup.style.boxShadow = '0 0 24px #000';
          popup.innerHTML = `
            <button id='practice-pause-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
            <h2 style='color:#ffb300; margin-bottom:1em;'>Paused</h2>
            <button id='practice-pause-settings-btn' class='menu-btn'>Settings</button>
            <button id='practice-pause-menu-btn' class='menu-btn'>Return to Menu</button>
          `;
          document.body.appendChild(popup);
          styleMenuButtons();
          document.getElementById('practice-pause-settings-btn').onclick = () => {
            log('[PracticePause] Settings button clicked');
            popup.remove();
            showSettingsMenu('practice-pause');
          };
          document.getElementById('practice-pause-menu-btn').onclick = () => {
            popup.remove();
            showMainMenu();
            if (telegraphUI) telegraphUI.remove();
          };
          document.getElementById('practice-pause-close-btn').onclick = () => {
            popup.remove();
          };
        }
      } else {
        log('[ESC] Returning to main menu');
        showMainMenu();
      }
      return;
    }
    if (pausePopup && pausePopup.style.display !== 'none') {
      log('[ESC] Closing pause popup');
      pausePopup.remove();
      return;
    }
    if (practicePausePopup && practicePausePopup.style.display !== 'none') {
      log('[ESC] Closing practice pause popup');
      practicePausePopup.remove();
      return;
    }
    if (practiceIncomingModal && practiceIncomingModal.style.display !== 'none') {
      log('[ESC] Closing practice incoming messages modal');
      practiceIncomingModal.remove();
      return;
    }
    if (practiceOverlay && practiceOverlay.style.display !== 'none') {
      log('[ESC] Closing practice overlay');
      practiceOverlay.remove();
      log('[ESC] Returning to main menu');
      showMainMenu();
      return;
    }
    if (telegraphUI) {
      // If telegraph UI is open and no overlays, open practice pause popup
      log('[ESC] Opening practice pause popup from telegraph UI');
      // Only open if not already open
      if (!document.getElementById('practice-pause-popup')) {
        let popup = document.createElement('div');
        popup.id = 'practice-pause-popup';
        popup.style.position = 'fixed';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.background = '#222';
        popup.style.border = '2px solid #ffb300';
        popup.style.borderRadius = '10px';
        popup.style.padding = '2em';
        popup.style.zIndex = '10020';
        popup.style.minWidth = '320px';
        popup.style.boxShadow = '0 0 24px #000';
        popup.innerHTML = `
          <button id='practice-pause-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
          <h2 style='color:#ffb300; margin-bottom:1em;'>Paused</h2>
          <button id='practice-pause-settings-btn' class='menu-btn'>Settings</button>
          <button id='practice-pause-menu-btn' class='menu-btn'>Return to Menu</button>
        `;
        document.body.appendChild(popup);
        styleMenuButtons();
        document.getElementById('practice-pause-settings-btn').onclick = () => {
          log('[PracticePause] Settings button clicked');
          popup.remove();
          showSettingsMenu('practice-pause');
        };
        document.getElementById('practice-pause-menu-btn').onclick = () => {
          log('[PracticePausePopup] Returning to main menu');
          popup.remove();
          showMainMenu();
          if (telegraphUI) telegraphUI.remove();
        };
        document.getElementById('practice-pause-close-btn').onclick = () => {
          popup.remove();
        };
      }
      return;
    }
    if (inGame && (!pausePopup || pausePopup.style.display === 'none')) {
      log('[ESC] Opening pause popup');
      showPausePopup();
      return;
    }
    log('[ESC] No action taken');
  }
});

module.exports = {
  showMainMenu,
  showSettingsMenu,
  showPausePopup,
  setInGame
};
