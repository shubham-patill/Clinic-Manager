const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Database Queries
  queryAll: (sql, params) => ipcRenderer.invoke('db:queryAll', sql, params),
  queryGet: (sql, params) => ipcRenderer.invoke('db:queryGet', sql, params),
  execute: (sql, params) => ipcRenderer.invoke('db:execute', sql, params),
  
  // Database Management
  getDbInfo: () => ipcRenderer.invoke('db:getInfo'),
  backupDatabase: () => ipcRenderer.invoke('db:backup'),
  restoreDatabase: () => ipcRenderer.invoke('db:restore'),
  
  // Printing & Native Features
  printWindow: () => ipcRenderer.invoke('app:print'),
  
  // App Info
  isElectron: true,
  platform: process.platform,
});
