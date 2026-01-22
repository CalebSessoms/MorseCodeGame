// gameStateManager.js
// Handles the main gameplay flow and testing of player options and UI

const { log } = require('./debugLogger');
const { showNotification } = require('./notification');
const { addMessage, deleteMessage, openMessages, closeMessages } = require('./messagesManager');
const { debugAllPlayerOptions, createPlayerOption, removePlayerOption, editPlayerOption, getPlayerOptions, clearPlayerOptions } = require('./playerOptions');
const { addItem, hasItem, getInventory } = require('./inventoryManager');
const { updatePlayerOptionsUI, updateGameText } = require('./uiManager');
const { getItemData } = require('../DataBases/itemsDB');

// Enum for the state of the basement door
const BasementDoorState = Object.freeze({
  LOCKED: 'locked',           // Door is locked and unexamined
  EXAMINED: 'examined',       // Door has been examined but is still locked
  READY_TO_UNLOCK: 'readyToUnlock', // Player has key and can unlock
  UNLOCKED: 'unlocked',       // Door is unlocked
});

// Enum for the breaker box position in the basement
const BreakerPosition = Object.freeze({
  ON: 'on',                   // Power is on in the basement
  OFF: 'off',                 // Power is off in the basement
});

// Enum for all possible rooms the player can be in
const Room = Object.freeze({
  LIVING_ROOM: 'living room', // Main living area
  KITCHEN: 'kitchen',         // Kitchen
  BASEMENT: 'basement',       // Basement
  STUDY: 'study',             // Study/office
});

let currentOptionIds = []; // Array to store the current player option IDs for UI management
let telegraphAvailable = false; // Boolean to track if the telegraph machine has been found

// Example import in other files:
// const { BasementDoorState, BreakerPosition, Room, currentOptionIds, telegraphAvailable } = require('./gameStateManager');

// Centralized game state object
const gameState = {
  currentRoom: Room.LIVING_ROOM,
  basementDoorState: BasementDoorState.LOCKED,
  breakerPosition: BreakerPosition.OFF,
};

function startGame() {
    log("This is the new gameStateManager.js starting the game.");
    addMessage(1);
  // Narrative intro: grandfather's house
  updateGameText("You wake up in your grandfather's house. The morning is quiet, the old clock ticking in the hallway.");
  log("[GameStateManager] Game started.");
  showNotification("Congratulations on starting the game!", "achievement");
  clearPlayerOptions();
  // Present a button for the player to look outside (triggering the alarm/announcement)
  const lookBtn = createPlayerOption('Look outside', () => {
    updateGameText("Suddenly, a loud alarm blares from somewhere outside, echoing through the neighborhood. A voice crackles over a public address system: 'Attention: Due to an emergency, everyone is instructed to shelter in place until further notice.' The air feels tense and uncertain.\n\nWhat would you like to do?");
    clearPlayerOptions();
    // Add an 'Explore the house' option
    const exploreBtn = createPlayerOption('Explore the house', () => {
      gameState.currentRoom = Room.LIVING_ROOM;
      showRoomOptions();
    });
    currentOptionIds.push(exploreBtn.id);
    updatePlayerOptionsUI(getPlayerOptions());
  });
  currentOptionIds.push(lookBtn.id);
  updatePlayerOptionsUI(getPlayerOptions());
}

function showRoomOptions() {
  clearPlayerOptions();
  if (gameState.currentRoom === Room.LIVING_ROOM) {
    updateGameText("You are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling. Where do you want to go or what do you want to do?");
    const toKitchen = createPlayerOption('Go to the kitchen', () => {
      gameState.currentRoom = Room.KITCHEN;
      showRoomOptions();
    });
    const toStudy = createPlayerOption('Go to the study', () => {
      gameState.currentRoom = Room.STUDY;
      showRoomOptions();
    });
    const checkPhotos = createPlayerOption('Check photos', () => {
      updateGameText("You step closer to the wall, examining the old photographs in their ornate frames. One shows your grandfather as a young man in uniform, another is a faded family portrait with you as a child. As you gently lift one of the frames, you notice something odd: a small, tarnished key is taped to the back, hidden from casual view.");
      if (!hasItem('Small Brass Key')) {
        updateGameText("\n\nThe key looks important. You can take it if you wish.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
        removePlayerOption('Check photos');
        const takeKey = createPlayerOption('Take the key', () => {
          addItem('Small Brass Key');
          showNotification("You have taken the Small Brass Key.", "inventory");
          updateGameText("You carefully peel the key from behind the photo. It's small, brass, and cold to the touch. You slip it into your pocket.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
          removePlayerOption('Take the key');
          createPlayerOption('Check photos', () => {
            updateGameText("\n\nYou already took the key from behind the photo.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
          });
        });
      } else {
        updateGameText("\n\nYou already took the key from behind the photo.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
      }
    });
  } else if (gameState.currentRoom === Room.KITCHEN) {
    let desc = "You are in the kitchen. The smell of old coffee lingers. The counters are cluttered with dishes and a faded calendar hangs on the fridge.";
    const toLiving = createPlayerOption('Go to the living room', () => {
      gameState.currentRoom = Room.LIVING_ROOM;
      showRoomOptions();
    });
    const checkFridge = createPlayerOption('Check the fridge', () => {
      updateGameText("You open the fridge. It's mostly empty except for a carton of milk and some leftovers that have seen better days. The cold air makes you shiver.\n\n" + desc);
    });
    let basementOption;
    const hasKeyInInv = hasItem('Small Brass Key');
    if (gameState.basementDoorState === BasementDoorState.LOCKED) {
      desc += " The basement door is here, its old wooden surface worn and the lock rusty.";
      updateGameText(desc);
      basementOption = createPlayerOption('Examine basement door', () => {
        log(`[DEBUG] Player has key in inventory: ${hasKeyInInv}`);
        if (hasKeyInInv) {
          gameState.basementDoorState = BasementDoorState.READY_TO_UNLOCK;
          showRoomOptions();
        } else {
          gameState.basementDoorState = BasementDoorState.EXAMINED;
          log('testing');
          showRoomOptions();
        }
      });
    } else if (gameState.basementDoorState === BasementDoorState.EXAMINED) {
      desc += "You take a closer look at the basement door. The lock looks old but sturdy. It won't budge without a key. You might need to find one somewhere in the house.\n\n";
      updateGameText(desc);
      basementOption = createPlayerOption('Rattle handle', () => {
        if (hasKeyInInv) {
          gameState.basementDoorState = BasementDoorState.READY_TO_UNLOCK;
          showRoomOptions();
        } else {
          showRoomOptions();
        }
      });
    } else if (gameState.basementDoorState === BasementDoorState.READY_TO_UNLOCK) {
      desc += "You take a closer look at the basement door. The lock looks old but functional. You remember you have a small brass key that might fit. You could try to unlock it.\n\n";
      updateGameText(desc);
      basementOption = createPlayerOption('Unlock basement door', () => {
        gameState.basementDoorState = BasementDoorState.UNLOCKED;
        updateGameText("You use the small brass key to unlock the basement door. The lock clicks open, revealing a dark staircase descending into the unknown.You feel a chill run down your spine as you peer into the darkness below.\n\n");
        clearPlayerOptions();
        createPlayerOption('Return to the kitchen', () => {
          gameState.currentRoom = Room.KITCHEN;
          showRoomOptions();
        });
        createPlayerOption('Descend into the basement', () => {
          gameState.currentRoom = Room.BASEMENT;
          showRoomOptions();
        });
      });
    } else if (gameState.basementDoorState === BasementDoorState.UNLOCKED) {
      desc += "The basement door is now unlocked. It creaks open slightly, revealing a dark staircase leading down.";
      updateGameText(desc);
      basementOption = createPlayerOption('Go to the basement', () => {
        updateGameText("A dark staircase descends into the unknown. You feel a chill run down your spine as you peer into the darkness below.\n\n");
        clearPlayerOptions();
        createPlayerOption('Return to the kitchen', () => {
          gameState.currentRoom = Room.KITCHEN;
          showRoomOptions();
        });
        createPlayerOption('Descend into the basement', () => {
          gameState.currentRoom = Room.BASEMENT;
          showRoomOptions();
        });
      });
    }
  } else if (gameState.currentRoom === Room.BASEMENT) {
    clearPlayerOptions();
    const toKitchen = createPlayerOption('Go to the kitchen', () => {
      gameState.currentRoom = Room.KITCHEN;
      showRoomOptions();
    });
    let desc = "You are in the basement. The air is damp and musty, and the faint sound of dripping water echoes around you.";
    if (telegraphAvailable) {
      desc += " A telegraph machine sits on a crate, its keys worn but functional.";
    } else {
      if (gameState.breakerPosition === BreakerPosition.ON) {
        desc += " The basement is illuminated by a flickering overhead light.";
        const breakerBox = createPlayerOption('Check the breaker box', () => {
          updateGameText("You approach the breaker box. The switches are all in the 'on' position, and the basement is already illuminated by the overhead light.\n\n");
        });
        const searchBasement = createPlayerOption('Search the basement', () => {
          removePlayerOption('Search the basement');
          updateGameText(" You search the basement. Amidst the old furniture and boxes, you find some useful tools and supplies that might come in handy later. Additionally there appears to be a loose shelf in the back\n\n");
          const checkShelf = createPlayerOption('Check the loose shelf', () => {
            updateGameText("You check the loose shelf and find a hidden compartment containing a telegraph machine. This could be useful for sending messages if other communication methods fail.\n\n");
            telegraphAvailable = true;
            showNotification("You have found a telegraph machine!", "notification");
            clearPlayerOptions();
          });
        });
      } else {
        if (!hasItem('Flashlight')) {
          desc += " It's pitch dark, and you can barely see anything. You might need a light source to navigate here safely.";
        } else {
          desc += " With your flashlight, you can see around the basement despite the darkness.";
          const breakerBox = createPlayerOption('Check the breaker box', () => {
            removePlayerOption('Check the breaker box');
            removePlayerOption('Check the basement');
            updateGameText("You approach the breaker box. Most of the switches are labeled, but one is unlabeled and seems to be in the 'off' position. Flipping it might restore power to the basement.\n\n");
            const flipSwitch = createPlayerOption('Flip the unlabeled switch', () => {
              updateGameText("You flip the switch. A low hum fills the basement as the lights flicker on, illuminating the space. You can now see old furniture, boxes, and some tools scattered around.\n\n");
              removePlayerOption('Flip the unlabeled switch');
              gameState.breakerPosition = BreakerPosition.ON;
              showRoomOptions();
            });
          });
        }
      }
    }
    updateGameText(desc);
  } else if (gameState.currentRoom === Room.STUDY) {
    let desc = "You are in the study. Books line the shelves, their spines cracked and faded. A heavy desk sits by the window, covered in papers and an old lamp.";
    updateGameText(desc);
    const toLiving = createPlayerOption('Go to the living room', () => {
      gameState.currentRoom = Room.LIVING_ROOM;
      showRoomOptions();
    });
    const checkDesk = createPlayerOption('Check the desk', () => {
      if (hasItem('Flashlight')) {
        updateGameText("You rummage through the desk drawers again, but there's nothing new to find.\n\n");
        return;
      } else {
        updateGameText("You rummage through the desk drawers. Most are filled with old bills and letters, but you find a dusty but working flashlight.\n\n");
        addItem('Flashlight');
        showNotification("You have acquired a Flashlight.", "inventory");
      }
    });
    const checkBooks = createPlayerOption('Browse the bookshelves', () => {
      updateGameText("You scan the bookshelves. There are novels, encyclopedias, and a few old journals. One book is about Morse code, its cover well-worn.\n\n");
    });
  }
  updatePlayerOptionsUI(getPlayerOptions());
}

// Expose startGame for use in index.html
window.startGame = startGame;

module.exports = {
  BasementDoorState,
  BreakerPosition,
  Room,
  currentOptionIds,
  telegraphAvailable,
};
