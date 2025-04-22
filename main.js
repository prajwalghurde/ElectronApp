const { app, BrowserWindow, Tray, Menu, Notification, ipcMain, dialog } = require('electron');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const path = require('path');

let win, tray, intervalId;

app.whenReady().then(() => {
  // Create main window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile('renderer/index.html');

  // System tray setup
  const iconPath = path.join(__dirname, 'assets/icon.png');
  try {
    if (fs.existsSync(iconPath)) {
      tray = new Tray(iconPath);
      const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: () => win.show() },
        { label: 'Start Capture', click: () => win.webContents.send('start-capture') },
        { label: 'Stop Capture', click: () => stopCapture() },
        { label: 'Quit', click: () => app.quit() }
      ]);
      tray.setToolTip('Screenshot App');
      tray.setContextMenu(contextMenu);
    } else {
      console.warn('Icon file not found at:', iconPath);
    }
  } catch (err) {
    console.error('Failed to create system tray:', err.message);
  }

  // Minimize to tray instead of closing
  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });

  // Prevent app from quitting when window is closed
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
});

// Handle folder selection
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

// Start capture
ipcMain.on('start-capture', (event, { interval, folder, format }) => {
  stopCapture(); // Clear any existing interval

  // Validate folder
  try {
    fs.accessSync(folder, fs.constants.W_OK);
  } catch (err) {
    win.webContents.send('error', 'Cannot write to selected folder');
    return;
  }

  intervalId = setInterval(async () => {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-');
    const dateFolder = path.join(folder, date.toISOString().split('T')[0]);
    
    // Create date-based folder if it doesn't exist
    try {
      if (!fs.existsSync(dateFolder)) {
        fs.mkdirSync(dateFolder, { recursive: true });
      }

      const filePath = path.join(dateFolder, `screenshot_${timestamp}.${format}`);
      
      const img = await screenshot({ format });
      fs.writeFileSync(filePath, img);
      new Notification({
        title: 'Screenshot Captured',
        body: `Saved to ${filePath}`
      }).show();
      // Send file path to renderer for list update
      win.webContents.send('screenshot-saved', filePath);
    } catch (err) {
      win.webContents.send('error', `Failed to capture screenshot: ${err.message}`);
    }
  }, interval * 1000);
});

// Stop capture
ipcMain.on('stop-capture', () => {
  stopCapture();
});

function stopCapture() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    win.webContents.send('stop-capture');
  }
}

// Clean up on quit
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  app.isQuitting = true;
});