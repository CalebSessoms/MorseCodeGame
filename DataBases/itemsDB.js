// itemsDB.js
// Simple item database for inventory system



// Placeholder drop function for all actions
function drop() {}

const items = {
  'e-Book': {
    name: 'e-Book',
    description: 'A digital book. Great for reading anywhere.',
    actions: [
      { actionText: 'Read', actionFunction: drop, functionFile: 'itemsDB.js', functionName: 'drop' }
    ]
  },
  'Headphones': {
    name: 'Headphones',
    description: 'Listen to music or block out noise.',
    actions: [
      { actionText: 'Wear', actionFunction: drop, functionFile: 'itemsDB.js', functionName: 'drop' }
    ]
  },
  'Snack': {
    name: 'Snack',
    description: 'A tasty treat to restore energy.',
    actions: [
      { actionText: 'Eat', actionFunction: drop, functionFile: 'itemsDB.js', functionName: 'drop' }
    ]
  },
  'Magazine': {
    name: 'Magazine',
    description: 'Catch up on the latest news and trends.',
    actions: [
      { actionText: 'Read', actionFunction: drop, functionFile: 'itemsDB.js', functionName: 'drop' }
    ]
  },
  'Small Brass Key': {
    name: 'Small Brass Key',
    description: 'A small, tarnished brass key. It looks important.',
    actions: [] // No actions, not useable or droppable
  }
  // Add more items as needed
};


function getItemData(itemName) {
  const item = items[itemName];
  if (!item) return null;
  // Do not add Drop for Small Brass Key
  if (itemName === 'Small Brass Key') {
    return { ...item };
  }
  // Always add a default Drop action at the end
  const dropAction = { actionText: 'Drop', actionFunction: drop, functionFile: 'itemsDB.js', functionName: 'drop' };
  // Only add if not already present
  const hasDrop = item.actions.some(a => a.actionText === 'Drop');
  return {
    ...item,
    actions: hasDrop ? item.actions : [...item.actions, dropAction]
  };
}

module.exports = {
  getItemData,
  items
};
