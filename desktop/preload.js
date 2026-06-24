const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cleanpc', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanFolder: (path) => ipcRenderer.invoke('scan-folder', path),
})
