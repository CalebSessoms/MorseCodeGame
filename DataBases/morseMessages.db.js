// morseMessages.db.js
// Database of all Morse messages for the game
// Each message is a plain object matching the MorseMessage fields
// id, text, morse, symbols, encrypted, sender, timestamp (all required)

const morseMessages = [
  {
    id: 1,
    text: "CQ CQ CQ DE WGN WGN K",
    sender: "test",
    timestamp: "2026-01-21T12:00:00Z"
  }
];

module.exports = morseMessages;
