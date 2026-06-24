const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png')
  })

  const apiUrl = process.env.CLEANPC_API_URL || 'http://localhost:8000'
  mainWindow.loadURL(apiUrl === 'http://localhost:8000' ? 'http://localhost:5173' : apiUrl)
  mainWindow.setMenuBarVisibility(false)
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('scan-folder', async (_, folderPath) => {
  const results = {
    totalFiles: 0,
    totalFolders: 0,
    totalSize: 0,
    files: [],
    duplicates: [],
    largeFiles: [],
    categories: {}
  }

  const sizeMap = {}

  function walkDir(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      try {
        if (entry.isDirectory()) {
          results.totalFolders++
          walkDir(fullPath)
        } else if (entry.isFile()) {
          const stat = fs.statSync(fullPath)
          const ext = path.extname(entry.name).toLowerCase()
          results.totalFiles++
          results.totalSize += stat.size

          const fileInfo = {
            name: entry.name,
            path: fullPath,
            size: stat.size,
            extension: ext,
            mtime: stat.mtime.toISOString()
          }
          results.files.push(fileInfo)

          const key = `${stat.size}_${entry.name}`
          if (!sizeMap[key]) sizeMap[key] = []
          sizeMap[key].push(fileInfo)

          const cat = getCategory(ext)
          results.categories[cat] = (results.categories[cat] || 0) + 1

          if (stat.size > 100 * 1024 * 1024) {
            results.largeFiles.push(fileInfo)
          }
        }
      } catch {}
    }
  }

  walkDir(folderPath)

  for (const [key, files] of Object.entries(sizeMap)) {
    if (files.length > 1) {
      results.duplicates.push({
        hash: key,
        fileCount: files.length,
        totalSize: files[0].size * files.length,
        files: files.map(f => f.path)
      })
    }
  }
  return results
})

function getCategory(ext) {
  const map = {
    '.jpg': 'images', '.jpeg': 'images', '.png': 'images', '.gif': 'images',
    '.bmp': 'images', '.webp': 'images', '.svg': 'images', '.ico': 'images',
    '.pdf': 'documents', '.doc': 'documents', '.docx': 'documents', '.xls': 'documents',
    '.xlsx': 'documents', '.ppt': 'documents', '.pptx': 'documents', '.txt': 'documents',
    '.csv': 'documents', '.md': 'documents', '.rtf': 'documents',
    '.mp4': 'videos', '.avi': 'videos', '.mkv': 'videos', '.mov': 'videos',
    '.mp3': 'music', '.wav': 'music', '.flac': 'music', '.aac': 'music',
    '.zip': 'compressed', '.rar': 'compressed', '.7z': 'compressed',
    '.tar': 'compressed', '.gz': 'compressed',
    '.exe': 'executables', '.msi': 'executables', '.dmg': 'executables',
    '.deb': 'executables', '.AppImage': 'executables',
    '.py': 'code', '.js': 'code', '.ts': 'code', '.html': 'code',
    '.css': 'code', '.json': 'code', '.sh': 'code',
    '.torrent': 'torrents',
  }
  return map[ext] || 'others'
}
