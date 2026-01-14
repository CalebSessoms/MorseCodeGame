

const { app, BrowserWindow, ipcMain } = require('electron');
const { logAppLaunch, log } = require('./GameManagers/debugLogger');
// IPC handler for debug logging from renderer
ipcMain.on('debug-log', (event, message) => {
  log(message);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  logAppLaunch();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
