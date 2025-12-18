"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
let mainWindow = null;
electron_1.app.whenReady().then(async () => {
    if (!await Promise.resolve().then(() => __importStar(require("electron-squirrel-startup"))))
        return electron_1.app.quit();
    const lock = electron_1.app.requestSingleInstanceLock();
    if (!lock)
        return electron_1.app.quit();
    mainWindow = new electron_1.BrowserWindow({
        title: "Plexy",
        fullscreen: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: path_1.default.join(__dirname, "preload.js")
        }
    });
    mainWindow.loadFile(path_1.default.join(__dirname, "..", "frontend", "main.html"));
    mainWindow.on("ready-to-show", async () => {
        mainWindow?.show();
    });
});
const baseDir = path_1.default.join(os_1.default.homedir(), "Plexy");
if (!fs_1.default.existsSync(baseDir))
    fs_1.default.mkdirSync(baseDir, { recursive: true });
electron_1.app.setPath("userData", baseDir);
const APPS_DIR = path_1.default.join(electron_1.app.getPath("userData"), "Apps");
let watchTimeout = null;
fs_1.default.watch(APPS_DIR, { recursive: true }, () => {
    if (watchTimeout)
        clearTimeout(watchTimeout);
    watchTimeout = setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("plexy:apps-updated");
        }
    }, 200);
});
function getApps() {
    if (!fs_1.default.existsSync(APPS_DIR)) {
        fs_1.default.mkdirSync(APPS_DIR, { recursive: true });
    }
    return fs_1.default
        .readdirSync(APPS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
        const appPath = path_1.default.join(APPS_DIR, dirent.name);
        const previewPath = path_1.default.join(appPath, "preview.htmnl");
        if (!fs_1.default.existsSync(path_1.default.join(appPath, "index.js")) || !fs_1.default.existsSync(previewPath))
            return null;
        return {
            name: dirent.name,
            previewPath
        };
    }).filter(Boolean);
}
electron_1.ipcMain.handle("plexy:get-apps", () => {
    return getApps();
});
let CurrentApp = null;
electron_1.ipcMain.on("plexy:launch-app", (_event, appName) => {
    if (CurrentApp && !(CurrentApp.isDestroyed())) {
        return electron_1.dialog.showErrorBox("Launch Denied.", "You can only have one App running at a time. Please Close " + appName);
    }
    const appPath = path_1.default.join(APPS_DIR, appName);
    const entryPoint = path_1.default.join(appPath, "index.js");
    if (!fs_1.default.existsSync(entryPoint)) {
        return electron_1.dialog.showErrorBox("Launch Failed", `No Entry Point (index.js) found for ${appName}`);
    }
    process.chdir(appPath);
    try {
        const appModule = require(entryPoint);
        const appWindow = appModule();
        if (!(appWindow instanceof electron_1.BrowserWindow)) {
            throw new Error(`App ${appName} must return a BrowserWindow from it's entry point.`);
        }
        if (appWindow.getTitle() !== appName) {
            appWindow.setTitle(appName);
        }
        CurrentApp = appWindow;
        appWindow.on("closed", () => {
            CurrentApp = null;
        });
    }
    catch (err) {
        electron_1.dialog.showErrorBox(`Error Launching ${appName}`, err instanceof Error ? err.stack || err?.message : String(err));
    }
});
electron_1.ipcMain.on("plexy:open-apps-folder", () => {
    electron_1.shell.openPath(APPS_DIR);
});
