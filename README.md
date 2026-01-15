
# Morse Code Game

A cross-platform, window-based, text-based adventure game built with Electron and JavaScript.

## Features

- **Dynamic Player Options:** Choices and actions adapt to the game state.
- **Inventory System:** Collect, use, and manage items with unique actions.
- **Room-Based Exploration:** Navigate a branching narrative with modular scenes.
- **Morse Code Messaging:** Receive, decrypt, and play messages in authentic Morse code, with visual and audio feedback.
- **Encrypted/Decrypted Messages:** Some messages require user input to decrypt, with a secure and interactive modal UI.
- **Notification System:** In-game events trigger visual and audio notifications.
- **Robust Debugging:** All major actions and events are logged to `debug.log` for easy troubleshooting.
- **Modular, Extensible Codebase:** Easily add new items, rooms, or message types.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the game:
   ```bash
   npm start
   ```

This will open a window with the game interface.

## Gameplay Overview

- Explore the story by selecting options.
- Collect and use items from your inventory.
- Receive Morse code messages—play them back, view them visually, and decrypt when required.
- Notifications alert you to important events.
- All actions are logged for debugging and transparency.

## Project Structure

- `GameManagers/`
  - `gameManager.js` – Main game flow and logic
  - `playerOptions.js` – Player option management
  - `inventoryManager.js` – Inventory system
  - `messagesManager.js` – Morse code message handling, modal UI, decryption logic
  - `notification.js` – Notification system (visual/audio)
  - `uiManager.js` – UI update functions
  - `debugLogger.js` – Debug logging
- `DataBases/itemsDB.js` – Item metadata and actions
- `Resources/Audio/` – Sound effects (Morse, notifications, inventory, etc.)
- `index.html` – Main UI layout
- `main.js` – Electron main process

## Debugging

- All major events and errors are logged to `debug.log`.
- To stop tracking `debug.log` in git, run:  
  `git rm --cached debug.log`

## Contributing

Pull requests and suggestions are welcome!  
Feel free to add new rooms, items, or message types to expand the adventure.
