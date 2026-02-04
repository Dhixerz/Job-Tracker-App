"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
// The built directory structure
//
// ├─┬ dist-electron
// │ ├── main.js
// │ └── preload.js
// ├─┬ dist
// │ └── index.html
process.env.DIST_ELECTRON = path_1.default.join(__dirname, '..', 'dist-electron');
process.env.DIST = path_1.default.join(__dirname, '..', 'dist');
process.env.PUBLIC = electron_1.app.isPackaged ? process.env.DIST : path_1.default.join(__dirname, '..', 'public');
let win;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        icon: path_1.default.join(process.env.PUBLIC || '', 'vite.svg'),
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webviewTag: true, // Enable webview for LinkedIn integration
        },
    });
    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString());
    });
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
        // win.webContents.openDevTools(); // Open dev tools in dev mode
    }
    else {
        win.loadFile(path_1.default.join(process.env.DIST || '', 'index.html'));
    }
    // Make all links open with the browser, not with the application
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:'))
            electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
        win = null;
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map