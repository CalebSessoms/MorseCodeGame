# Morse Code Game

A cross-platform, modular, text-based adventure game built with Electron and JavaScript, featuring interactive Morse code messaging, dynamic inventory, and robust save/load functionality.

## Features

- **Dynamic Player Options:** Choices and actions adapt in real time to the game state, with a flexible player option system.
- **Modular Room-Based Exploration:** Navigate a branching narrative across multiple rooms, each with unique interactions and logic.
- **Inventory System:** Collect, use, and manage items in a 5x5 grid inventory. Items can have custom actions, and inventory is fully persistent.
- **Morse Code Messaging:** Receive, play, and decrypt authentic Morse code messages. Visual and audio playback, with symbol highlighting and accurate timing.
- **Encrypted/Decrypted Messages:** Some messages require user decryption via a secure, interactive modal UI. Toggle between encrypted and decrypted views.
- **Persistent Save/Load:** All game state—including room, inventory, messages, and special flags (like telegraph discovery)—is saved and restored seamlessly.
- **Notification System:** In-game events trigger visual and audio notifications, with sound effects for achievements, inventory, and more.
- **Main Menu, Pause, and Settings:** Modern overlay menus for starting, loading, pausing, and configuring the game. Escape key support for closing popups and pausing.
- **Robust Debugging:** All major actions and errors are logged to `debug.log` for easy troubleshooting.
- **Extensible, Maintainable Codebase:** Modular managers for game state, inventory, messages, notifications, and UI. Easily add new items, rooms, or message types.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the game:
   ```bash
   npm start
   ```

This will open the game window. All features are available from the main menu.

## Gameplay Overview

- Explore a story-driven adventure by selecting context-sensitive options.
- Collect and use items from your inventory.
- Receive Morse code messages—play them back with audio/visual feedback, and decrypt when required.
- Use the main menu to start a new game or load a previous save. Pause and settings menus are accessible in-game.
- All progress, inventory, and messages are saved automatically when returning to the menu or closing the game.
- Notifications alert you to important events, item pickups, and achievements.
- Debug logs are generated for all major actions and errors.

## Project Structure

- `GameManagers/`
  - `gameStateManager.js` – Centralized game state, save/load logic, and main gameplay flow
  - `playerOptions.js` – Player option creation, editing, and UI management
  - `inventoryManager.js` – Inventory grid, item actions, and inventory persistence
  - `messagesManager.js` – Morse code message management, playback, modal UI, decryption logic
  - `notification.js` – Notification system (visual/audio)
  - `menuManager.js` – Main menu, pause, and settings overlays, Escape key handling
  - `saveManager.js` – Save game state to file
  - `loadManager.js` – Load game state from file
  - `uiManager.js` – UI update functions for text and options
  - `debugLogger.js` – Debug logging to file and IPC
- `DataBases/itemsDB.js` – Item metadata, descriptions, and actions
- `DataBases/morseMessages.db.js` – Persistent database of Morse code messages
- `Resources/Audio/` – Sound effects for Morse, notifications, inventory, etc.
- `playerData/currentGameStates.txt` – Persistent save file (JSON)
- `index.html` – Main UI layout and entry point
- `main.js` – Electron main process

## Debugging

- All major events and errors are logged to `debug.log` in the project root.
- To stop tracking `debug.log` in git, run:
  ```bash
  git rm --cached debug.log
  ```

## Contributing

Pull requests and suggestions are welcome! Feel free to add new rooms, items, or message types to expand the adventure. For major changes, please open an issue first to discuss what you would like to change.
Pull requests and suggestions are welcome!  
Feel free to add new rooms, items, or message types to expand the adventure.
