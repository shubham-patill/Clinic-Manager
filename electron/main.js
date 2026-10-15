const electron = require('electron');

// Safe fallback: If invoked with plain 'node' on a web host (e.g. Render) without Electron runtime,
// delegate gracefully to the web server instead of crashing.
if (!electron || typeof electron !== 'object' || !electron.app) {
  console.log('[DentCare Pro] Plain Node environment detected. Starting web server mode...');
  try {
    require('../server.js');
  } catch (err) {
    console.error('Failed to start web server:', err);
    process.exit(1);
  }
  return;
}

const { app, BrowserWindow, ipcMain, dialog } = electron;
const path = require('node:path');
const fs = require('node:fs');
const dbLayer = require('./db');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 840,
    minWidth: 1024,
    minHeight: 700,
    title: 'DentCare Pro - Dental Clinic Management System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
    show: false,
  });

  // Smooth appearance once ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize embedded self-contained SQLite database
  try {
    dbLayer.initDatabase(app);
  } catch (err) {
    console.error('Fatal database initialization error:', err);
    dialog.showErrorBox('Database Error', 'Could not initialize local SQLite database: ' + err.message);
  }

  // Setup IPC Handlers
  ipcMain.handle('db:queryAll', (event, sql, params) => {
    try {
      return dbLayer.queryAll(sql, params);
    } catch (err) {
      console.error('DB queryAll Error:', err, sql);
      throw err;
    }
  });

  ipcMain.handle('db:queryGet', (event, sql, params) => {
    try {
      return dbLayer.queryGet(sql, params);
    } catch (err) {
      console.error('DB queryGet Error:', err, sql);
      throw err;
    }
  });

  ipcMain.handle('db:execute', (event, sql, params) => {
    try {
      return dbLayer.execute(sql, params);
    } catch (err) {
      console.error('DB execute Error:', err, sql);
      throw err;
    }
  });

  ipcMain.handle('db:getInfo', () => {
    try {
      const dbPath = dbLayer.getDbFilePath();
      const stats = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
      return {
        path: dbPath,
        sizeBytes: stats ? stats.size : 0,
        sizeReadable: stats ? (stats.size / 1024).toFixed(1) + ' KB' : '0 KB',
        mode: 'Self-Contained SQLite3 Embedded',
        status: 'Online & Connected'
      };
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle('db:backup', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const defaultFilename = `DentCare_Backup_${today}.db`;
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Dental Clinic Database Backup',
        defaultPath: defaultFilename,
        filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
      });

      if (!result.canceled && result.filePath) {
        dbLayer.backupDatabase(result.filePath);
        return { success: true, path: result.filePath };
      }
      return { success: false, canceled: true };
    } catch (err) {
      console.error('Backup error:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('db:restore', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Backup Database to Restore',
        filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }],
        properties: ['openFile']
      });

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        const sourcePath = result.filePaths[0];
        dbLayer.restoreDatabase(sourcePath, app);
        return { success: true, path: sourcePath };
      }
      return { success: false, canceled: true };
    } catch (err) {
      console.error('Restore error:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('app:print', async () => {
    if (mainWindow) {
      mainWindow.webContents.print({ silent: false, printBackground: true });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
