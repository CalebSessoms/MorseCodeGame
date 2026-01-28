// menuManager.js
// Handles main menu, settings, and pause popup logic



function showMainMenu() {
  hideAllSections();
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
          loadGameState(saveObj);
        } else {
          // Optionally show a message: no save found
          alert('No saved game found.');
        }
      };
      document.getElementById('start-new-game-btn').onclick = () => {
        popup.remove();
        menu.style.display = 'none';
        // Require here to avoid circular dependency
        const { startGame } = require('./gameStateManager');
        startGame();
      };
    };
    document.getElementById('menu-survival-btn').onclick = () => {};
    document.getElementById('menu-practice-btn').onclick = () => {};
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
      settings.style.zIndex = '10001';
      settings.innerHTML = `
        <button id='settings-close-btn' style='position:absolute; top:10px; right:14px; background:none; border:none; color:#ffb300; font-size:1.5em; font-weight:bold; cursor:pointer;' title='Close'>&times;</button>
        <h2 style='color:#ffb300; margin-bottom:2em;'>Settings</h2>
        <div style='color:#aaa; margin-bottom:2em;'>Settings coming soon...</div>
      `;
      document.body.appendChild(settings);
      styleMenuButtons();
      document.getElementById('settings-close-btn').onclick = () => {
        settings.style.display = 'none';
        if (_settingsReturnContext === 'pause') {
          showPausePopup();
        } else {
          showMainMenu();
        }
      };
    } else {
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
  const pausePopup = document.getElementById('pause-popup');
  const settingsMenu = document.getElementById('settings-menu');
  const storyPopup = document.getElementById('story-popup');
  if (e.key === 'Escape') {
    if (storyPopup && storyPopup.style.display !== 'none') {
      storyPopup.remove();
    } else if (settingsMenu && settingsMenu.style.display !== 'none') {
      // If settings menu is open, close it (like X button)
      settingsMenu.style.display = 'none';
      if (_settingsReturnContext === 'pause') {
        showPausePopup();
      } else {
        showMainMenu();
      }
    } else if (pausePopup && pausePopup.style.display !== 'none') {
      // If pause popup is open and settings is not, close pause popup
      pausePopup.remove();
    } else if (inGame && (!pausePopup || pausePopup.style.display === 'none')) {
      // If in game and pause popup is not open, open it
      showPausePopup();
    }
  }
});

module.exports = {
  showMainMenu,
  showSettingsMenu,
  showPausePopup,
  setInGame
};
