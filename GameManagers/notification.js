// notification.js
// Basic notification system for Electron/Browser

/**
 * Show a notification with sound and a popup in the top right corner.

 * @param {string} message - The notification message to display
 * @param {string} type - The type of notification ('achievement', 'notification', 'inventory')
 */
function showNotification(message, type = 'notification') {
  const { log } = require('./debugLogger');
  log(`[Notification] showNotification called: message="${message}", type="${type}"`);
  // Choose sound based on type and correct path
  let soundUrl = `Resources/Audio/${type}.mp3`;
  try {
    const audio = new Audio(soundUrl);
    audio.play();
    log(`[Notification] Played sound: ${soundUrl}`);
  } catch(e) { log(`[Notification] Failed to play sound: ${soundUrl}`); }

  // Create notification container if it doesn't exist
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '20000';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    document.body.appendChild(container);
    log('[Notification] Created notification container');
  }

  // Create notification popup
  const notif = document.createElement('div');
  notif.textContent = message;
  notif.style.background = '#222';
  notif.style.color = '#fff';
  notif.style.padding = '12px 24px';
  notif.style.marginTop = '8px';
  notif.style.borderRadius = '6px';
  notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  notif.style.opacity = '0.95';
  notif.style.fontSize = '1rem';
  notif.style.transition = 'opacity 0.5s';

  container.appendChild(notif);
  log('[Notification] Notification element appended');

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    notif.style.opacity = '0';
    log('[Notification] Notification fade out');
    setTimeout(() => {
      notif.remove();
      log('[Notification] Notification element removed');
      // Remove container if empty
      if (container.childElementCount === 0) {
        container.remove();
        log('[Notification] Notification container removed');
      }
    }, 500);
  }, 3000);
}

module.exports = {
  showNotification
};
