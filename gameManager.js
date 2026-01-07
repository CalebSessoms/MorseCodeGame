// gameManager.js
// Handles the main gameplay flow and testing of player options and UI
const { log } = require('./debugLogger');
const { showNotification } = require('./notification');

const { debugAllPlayerOptions, createPlayerOption, removePlayerOption, editPlayerOption, getPlayerOptions, clearPlayerOptions } = require('./playerOptions');
const { addItem, hasItem } = require('./inventoryManager');
const { updatePlayerOptionsUI, updateGameText } = require('./uiManager');

// Store the current option IDs for easy removal
let currentOptionIds = [];

let currentRoom = 'living room';
let hasTakenKey = false;
// Removed: let hasExaminedBasementDoor = false;
// Track the state of the basement door: 'locked', 'readyToUnlock', 'unlocked', 'open' (future-proof)
let basementDoorState = 'locked';
let breakerPosition = 'off';
let telegraphAvailable = false;

function startGame() {
  // Narrative intro: grandfather's house
  updateGameText("You wake up in your grandfather's house. The morning is quiet, the old clock ticking in the hallway.");
  showNotification("Congratulations on starting the game!", "achievement");
  clearPlayerOptions();
  // Present a button for the player to look outside (triggering the alarm/announcement)
  const lookBtn = createPlayerOption('Look outside', () => {
    updateGameText("Suddenly, a loud alarm blares from somewhere outside, echoing through the neighborhood. A voice crackles over a public address system: 'Attention: Due to an emergency, everyone is instructed to shelter in place until further notice.' The air feels tense and uncertain.\n\nWhat would you like to do?");
    clearPlayerOptions();
    // Add an 'Explore the house' option
    const exploreBtn = createPlayerOption('Explore the house', () => {
      currentRoom = 'living room';
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
  if (currentRoom === 'living room') {
    updateGameText("You are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling. Where do you want to go or what do you want to do?");
    const toKitchen = createPlayerOption('Go to the kitchen', () => {
      currentRoom = 'kitchen';
      showRoomOptions();
    });
    const toStudy = createPlayerOption('Go to the study', () => {
      currentRoom = 'study';
      showRoomOptions();
    });
    const checkPhotos = createPlayerOption('Check photos', () => {
      updateGameText("You step closer to the wall, examining the old photographs in their ornate frames. One shows your grandfather as a young man in uniform, another is a faded family portrait with you as a child. As you gently lift one of the frames, you notice something odd: a small, tarnished key is taped to the back, hidden from casual view.");
      if (!hasTakenKey) {

        updateGameText("\n\nThe key looks important. You can take it if you wish.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
        removePlayerOption('Check photos');
        const takeKey = createPlayerOption('Take the key', () => {
          hasTakenKey = true;
          addItem('Small Brass Key');
          showNotification("You have taken the Small Brass Key.", "inventory");
          updateGameText("You carefully peel the key from behind the photo. It's small, brass, and cold to the touch. You slip it into your pocket.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
            // Remove the take key option after taking it
            removePlayerOption('Take the key');
            const checkPhotos = createPlayerOption('Check photos', () => {
                updateGameText("\n\nYou already took the key from behind the photo.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
            });
        });
      } else {
        updateGameText("\n\nYou already took the key from behind the photo.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
      }
          //updateGameText("You carefully peel the key from behind the photo. It's small, brass, and cold to the touch. You slip it into your pocket.\n\nYou are in the living room. The old furniture and family photos give the room a warm, nostalgic feeling.");
          
      
      // Otherwise, just update the text and leave options unchanged
    });
  } else if (currentRoom === 'kitchen') {
    let desc = "You are in the kitchen. The smell of old coffee lingers. The counters are cluttered with dishes and a faded calendar hangs on the fridge.";
    const toLiving = createPlayerOption('Go to the living room', () => {
      currentRoom = 'living room';
      showRoomOptions();
    });
    const checkFridge = createPlayerOption('Check the fridge', () => {
      updateGameText("You open the fridge. It's mostly empty except for a carton of milk and some leftovers that have seen better days. The cold air makes you shiver.\n\n" + desc);
    });
    // All basement door logic handled by basementDoorState only
    let basementOption;
    const hasKeyInInv = hasItem('Small Brass Key');
    const { log } = require('./debugLogger');
    if (basementDoorState === 'locked') {
        desc += " The basement door is here, its old wooden surface worn and the lock rusty.";
        updateGameText(desc);
      // Player can examine the door
      basementOption = createPlayerOption('Examine basement door', () => {
        log(`[DEBUG] Player has key in inventory: ${hasKeyInInv}`);
        if (hasKeyInInv) {
          basementDoorState = 'readyToUnlock';
          showRoomOptions();
        } else if (!hasKeyInInv) {
            basementDoorState = 'examined';
            log('testing');
            showRoomOptions();
        } else { 
        }
      });
    } else if (basementDoorState === 'examined') {
        desc += "You take a closer look at the basement door. The lock looks old but sturdy. It won't budge without a key. You might need to find one somewhere in the house.\n\n";
        updateGameText(desc);
        basementOption = createPlayerOption('Rattle handle', () => {
            if (hasKeyInInv) {
                basementDoorState = 'readyToUnlock';
                showRoomOptions();
            } else {
                showRoomOptions();
            }
        });
    
    
    }else if (basementDoorState === 'readyToUnlock') {
        desc += "You take a closer look at the basement door. The lock looks old but functional. You remember you have a small brass key that might fit. You could try to unlock it.\n\n";
        updateGameText(desc);
        basementOption = createPlayerOption('Unlock basement door', () => {
            basementDoorState = 'unlocked';
            updateGameText("You use the small brass key to unlock the basement door. The lock clicks open, revealing a dark staircase descending into the unknown.You feel a chill run down your spine as you peer into the darkness below.\n\n");
            clearPlayerOptions();
            createPlayerOption('Return to the kitchen', () => {
                currentRoom = 'kitchen';
                showRoomOptions();
            });
            createPlayerOption('Descend into the basement', () => {
                currentRoom = 'basement';
                showRoomOptions();
            });
        });
    }
    else if (basementDoorState === 'unlocked') {
        desc += "The basement door is now unlocked. It creaks open slightly, revealing a dark staircase leading down.";
        updateGameText(desc);
        basementOption = createPlayerOption('Go to the basement', () => {
            updateGameText("A dark staircase descends into the unknown. You feel a chill run down your spine as you peer into the darkness below.\n\n");
            // Future: could add options to go down the basement stairs
            clearPlayerOptions();
            createPlayerOption('Return to the kitchen', () => {
                currentRoom = 'kitchen';
                showRoomOptions();
            });
            createPlayerOption('Descend into the basement', () => {
                currentRoom = 'basement';
                showRoomOptions();
            });
        });
    }
} else if (currentRoom === 'basement') {
    clearPlayerOptions();
    
    const toKitchen = createPlayerOption('Go to the kitchen', () => {
      currentRoom = 'kitchen';
      showRoomOptions();
    });

    let desc = "You are in the basement. The air is damp and musty, and the faint sound of dripping water echoes around you.";
    if(telegraphAvailable) {
        desc += " A telegraph machine sits on a crate, its keys worn but functional.";
    } else {
    if (breakerPosition === 'on') {
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
              breakerPosition = 'on';
              showRoomOptions();
            });
        });
      }
    }
  }

    

    
    updateGameText(desc);


  } else if (currentRoom === 'study') {
    let desc = "You are in the study. Books line the shelves, their spines cracked and faded. A heavy desk sits by the window, covered in papers and an old lamp.";
    updateGameText(desc);
    const toLiving = createPlayerOption('Go to the living room', () => {
      currentRoom = 'living room';
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
    currentOptionIds.push(toLiving.id, checkDesk.id, checkBooks.id);
  }
  updatePlayerOptionsUI(getPlayerOptions());
}

function addStartOptions() {
  const shopping = createPlayerOption('Go Shopping', () => {
    updateGameText('You decide to go shopping. How do you want to shop?');
    clearPlayerOptions();
    addShoppingOptions();
  });
  const relax = createPlayerOption('Relax', () => {
    updateGameText('You decide to relax. How do you want to relax?');
    clearPlayerOptions();
    addRelaxOptions();
  });
  currentOptionIds.push(shopping.id, relax.id);
  updatePlayerOptionsUI(getPlayerOptions());
}

function addShoppingOptions() {
  const online = createPlayerOption('Shop Online', () => {
    updateGameText('You are shopping online. What would you like to buy?');
    clearPlayerOptions();
    // Online purchase options
    const book = createPlayerOption('Buy e-Book', () => {
      addItem('e-Book');
      updateGameText('You bought an e-Book!');
      clearPlayerOptions();
      addStartOptions();
    });
    const headphones = createPlayerOption('Buy Headphones', () => {
      addItem('Headphones');
      updateGameText('You bought headphones!');
      clearPlayerOptions();
      addStartOptions();
    });
    const back = createPlayerOption('Back', () => {
      updateGameText('How do you want to shop?');
      clearPlayerOptions();
      addShoppingOptions();
    });
    currentOptionIds.push(book.id, headphones.id, back.id);
    updatePlayerOptionsUI(getPlayerOptions());
  });
  const inStore = createPlayerOption('Shop In-Store', () => {
    updateGameText('You are shopping in-store. What would you like to buy?');
    clearPlayerOptions();
    // In-store purchase options
    const snack = createPlayerOption('Buy Snack', () => {
      addItem('Snack');
      updateGameText('You bought a snack!');
      clearPlayerOptions();
      addStartOptions();
    });
    const magazine = createPlayerOption('Buy Magazine', () => {
      addItem('Magazine');
      updateGameText('You bought a magazine!');
      clearPlayerOptions();
      addStartOptions();
    });
    const back = createPlayerOption('Back', () => {
      updateGameText('How do you want to shop?');
      clearPlayerOptions();
      addShoppingOptions();
    });
    currentOptionIds.push(snack.id, magazine.id, back.id);
    updatePlayerOptionsUI(getPlayerOptions());
  });
  const relax = createPlayerOption('Relax', () => {
    updateGameText('You decide to relax. How do you want to relax?');
    clearPlayerOptions();
    addRelaxOptions();
  });
  currentOptionIds.push(online.id, inStore.id, relax.id);
  updatePlayerOptionsUI(getPlayerOptions());
}

const { getInventory } = require('./inventoryManager');
const { getItemData } = require('./itemsDB');

function addRelaxOptions() {
  // Flatten inventory grid to a list of items (no duplicates)
  const inventoryGrid = getInventory();
  const itemsFlat = inventoryGrid.flat().filter(Boolean);
  const uniqueItems = [...new Set(itemsFlat)];
  // For each unique item, create player options for each of its actions (except Drop)
  uniqueItems.forEach(itemName => {
    const data = getItemData(itemName) || { name: itemName, actions: [] };
    data.actions.forEach(actionObj => {
      if (actionObj.actionText === 'Drop') return; // Don't show Drop in relax menu
      const opt = createPlayerOption(`${actionObj.actionText} ${data.name}`, () => {
        updateGameText(`You ${actionObj.actionText.toLowerCase()} your ${data.name}.`);
        // Optionally, could trigger item-specific logic here
        // For now, just return to start options
        clearPlayerOptions();
        addStartOptions();
      });
      currentOptionIds.push(opt.id);
    });
  });
  // Always add a static Nap option
  const nap = createPlayerOption('Take a Nap', () => {
    updateGameText('You take a nap. You feel refreshed!');
    clearPlayerOptions();
    addStartOptions();
  });
  currentOptionIds.push(nap.id);
  updatePlayerOptionsUI(getPlayerOptions());
}

// Expose startGame for use in index.html
window.startGame = startGame;
