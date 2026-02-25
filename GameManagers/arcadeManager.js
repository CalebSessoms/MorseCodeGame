// ArcadeManager: Handles randomization and delivery of Morse messages for Arcade/Practice mode
// Usage: arcadeManager.getRandomMessage(), arcadeManager.startArcadeSession(), arcadeManager.stopArcadeSession()


const debugLogger = require('../debugLogger');

// Level 1 templates
const LEVEL1_TEMPLATES = [
  'CQ DE {CALLSIGN}',
  'CQ CQ DE {CALLSIGN}',
  'DE {CALLSIGN}',
  '{CALLSIGN} DE {CALLSIGN}',
  '{CALLSIGN} K'
];

function randomCallsign() {
  const prefixes = ['K', 'W', 'N'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    suffix += String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  }
  return prefix + suffix;
}

function fillTemplate(template, callsign1, callsign2) {
  // For templates with two callsigns, use both
  return template.replace('{CALLSIGN}', callsign1).replace('{CALLSIGN}', callsign2 || callsign1);
}

class ArcadeManager {
  constructor() {
    this.active = false;
    this.sessionMessages = [];
    this.currentIndex = 0;
    this.sessionTimer = null;
    this.SESSION_INTERVAL = 5000; // ms between messages (configurable)
    this.level = 1;
  }

  // Start a new arcade session: randomize messages, begin delivery
  startArcadeSession(messageCount = 10, level = 1) {
    this.active = true;
    this.level = level;
    this.sessionMessages = this._generateRandomMessages(messageCount);
    this.currentIndex = 0;
    debugLogger.log(`[ArcadeManager] Session started with ${messageCount} messages (level ${level}).`);
    this._deliverNextMessage();
  }

  // Stop arcade session and clear timers
  stopArcadeSession() {
    this.active = false;
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    debugLogger.log('[ArcadeManager] Session stopped.');
  }

  // Get a single random message (for practice mode)
  getRandomMessage(level = 1) {
    log("testing getRandomMessage");
    const msgObj = this._generateRandomMessages(1, level)[0];
    // Ensure encrypted/decrypted fields for practice mode
    msgObj.encrypted = true;
    msgObj.decrypted = false;
    return msgObj;
  }

  // Internal: generate N random messages for the current level
  _generateRandomMessages(n, level = this.level) {
    const templates = LEVEL1_TEMPLATES;
    const messages = [];
    for (let i = 0; i < n; i++) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      let callsign1 = randomCallsign();
      let callsign2 = null;
      // If template has two callsigns, generate two
      if (template.split('{CALLSIGN}').length - 1 === 2) {
        callsign2 = randomCallsign();
      }
      const text = fillTemplate(template, callsign1, callsign2);
      messages.push({
        id: Date.now() + i,
        text,
        callsign1,
        callsign2,
        template,
        level,
        timestamp: new Date().toISOString()
      });
    }
    return messages;
  }

  // Internal: deliver next message in session
  _deliverNextMessage() {
    if (!this.active || this.currentIndex >= this.sessionMessages.length) {
      this.stopArcadeSession();
      return;
    }
    const msg = this.sessionMessages[this.currentIndex];
    debugLogger.log(`[ArcadeManager] Delivering message #${this.currentIndex + 1}: ${msg.text}`);
    // TODO: Integrate with messagesManager or UI to show/deliver msg
    this.currentIndex++;
    this.sessionTimer = setTimeout(() => this._deliverNextMessage(), this.SESSION_INTERVAL);
  }
}

const arcadeInstance = new ArcadeManager();
module.exports = {
  getRandomMessage: arcadeInstance.getRandomMessage.bind(arcadeInstance),
  startArcadeSession: arcadeInstance.startArcadeSession.bind(arcadeInstance),
  stopArcadeSession: arcadeInstance.stopArcadeSession.bind(arcadeInstance)
};
