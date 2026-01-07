// notification.js
// Basic notification system for Electron/Browser

/**
 * Show a notification with sound and a popup in the top right corner.

 * @param {string} message - The notification message to display
 * @param {string} type - The type of notification ('achievement', 'notification', 'inventory')
 */
function showNotification(message, type = 'notification') {
  // Choose sound based on type
  let soundUrl = type + '.mp3';
  const audio = new Audio(soundUrl);
  audio.play();

  // Create notification container if it doesn't exist
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    document.body.appendChild(container);
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

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => {
      notif.remove();
      // Remove container if empty
      if (container.childElementCount === 0) {
        container.remove();
      }
    }, 500);
  }, 3000);
}

module.exports = {
  showNotification
};
