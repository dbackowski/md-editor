'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const fs = require('fs');
const ipcMain = electron.ipcMain;

let splashScreenWindow;
let mainWindow;
let aboutWindow;
let fileName;
let menuTemplate;

if (process.platform !== 'darwin') {
  menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: newFileHandler
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: openFileHandler
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: saveFileHandler
        },
        {
          label: 'Save As',
          click: saveAsFileHandler
        },
        {
          label: 'Export As PDF',
          click: exportAsPdfHandler
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: quitProgramHandler
        }
      ]
    },
    {
      label: 'MdEditor',
      submenu: [
        {
          label: 'About MdEditor',
          click: createAboutWindow
        }
      ]
    },
  ];
} else {
  menuTemplate = [
    {
      label: 'MdEditor',
      submenu: [
        {
          label: 'About MdEditor',
          click: createAboutWindow
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: quitProgramHandler
        }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: newFileHandler
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: openFileHandler
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: saveFileHandler
        },
        {
          label: 'Save As',
          click: saveAsFileHandler
        },
        {
          label: 'Export As PDF',
          click: exportAsPdfHandler
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    }
  ];
}

const mainMenu = Menu.buildFromTemplate(menuTemplate);

function newFileHandler() {
  mainWindow.webContents.send('new-file');
  disableSaveMenuPosition();
}

function openFileHandler () {
  dialog.showOpenDialog({ filters: [{ name: 'markdown', extensions: ['md'] }]}, function (fileNames) {
    if (fileNames === undefined) return;
    fileName = fileNames[0];
    fs.readFile(fileName, 'utf-8', function (err, data) {
      mainWindow.webContents.send('load-file', data);
      enableSaveMenuPosition();
    });
  });
}

function saveAsFileHandler() {
  mainWindow.webContents.send('get-editor-content');

  ipcMain.once('editor-content', function(event, arg) {
    fileName = dialog.showSaveDialog({ filters: [{ name: 'markdown', extensions: ['md'] }]});

    if (fileName !== undefined) {
      fs.writeFile(fileName, arg);
      enableSaveMenuPosition();
    }
  });
}

function saveFileHandler() {
  if (fileName === undefined) return;
  mainWindow.webContents.send('get-editor-content');

  ipcMain.once('editor-content', function(event, arg) {
    fs.writeFile(fileName, arg);
  });
}

function exportAsPdfHandler() {
  mainWindow.webContents.send('get-output-content');

  ipcMain.once('output-content', function(event, arg) {
    let pdfFileName = dialog.showSaveDialog({ filters: [{ name: 'pdf', extensions: ['pdf'] }]});

    if (pdfFileName !== undefined) {
      let pdfWindow = new BrowserWindow({ show: false });

      global.sharedObject = {
        style: fs.readFileSync(__dirname + '/app/css/style.css').toString(),
        body: arg
      };

      pdfWindow.loadURL('file://' + __dirname + '/app/pdf.html');

      pdfWindow.webContents.on("did-finish-load", function() {
        pdfWindow.webContents.printToPDF({ printBackground: true }, function(error, data) {
          if (error) throw error;

          fs.writeFile(pdfFileName, data, function(err) {
            if (err) {
              return dialog.showErrorBox('Unable to export as PDF', err.message);
            }
          })
        })
      });
    }
  });
}

function quitProgramHandler() {
  app.quit();
}

function disableSaveMenuPosition() {
  if (process.platform !== 'darwin') {
    mainMenu.items[0].submenu.items[2].enabled = false;
  } else {
    mainMenu.items[1].submenu.items[2].enabled = false;
  }
}

function enableSaveMenuPosition() {
  if (process.platform !== 'darwin') {
    mainMenu.items[0].submenu.items[2].enabled = true;
  } else {
    mainMenu.items[1].submenu.items[2].enabled = true;
  }
}

function createAboutWindow() {
  if (!aboutWindow) {
    aboutWindow = new BrowserWindow({ width: 400, height: 120, frame: true,
                                      resizable: false,
                                      webPreferences: { nodeIntegration: false, alwaysOnTop: true } } );
    aboutWindow.setMenu(null);
    aboutWindow.loadURL('file://' + __dirname + '/app/about.html');

    aboutWindow.on('closed', function () {
      aboutWindow = null;
    });
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({ show: false, width: 800, height: 600, title: 'MdEditor',
                                   webPreferences: { nodeIntegration: true }, icon: __dirname + '/app/images/icon.png' });
  mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  disableSaveMenuPosition();
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  mainWindow.on('ready-to-show', function() {
    if (splashScreenWindow !== null) {
      splashScreenWindow.close();
    }
    mainWindow.maximize();
  });
}

function createSplashScreen() {
  splashScreenWindow = new BrowserWindow({ width: 400, height: 150, resizable: false, frame: false,
                                           webPreferences: { nodeIntegration: false, alwaysOnTop: true } });
  splashScreenWindow.setMenu(null);
  splashScreenWindow.loadURL('file://' + __dirname + '/app/splash.html');

  splashScreenWindow.on('closed', function() {
    splashScreenWindow = null;
  });
}

function initializeApp() {
  createSplashScreen();
  createMainWindow();
}

app.on('ready', initializeApp);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow();
  }
});
