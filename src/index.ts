import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import path from "path";
import fs from "fs";
import os from "os";

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(async () => {
    if (!await import("electron-squirrel-startup")) return app.quit();
    const lock = app.requestSingleInstanceLock();
    if (!lock) return app.quit();    

    mainWindow = new BrowserWindow({
        title: "Plexy",
        fullscreen: true,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        } 
    });

    mainWindow.loadFile(path.join(__dirname, "..", "frontend", "main.html"));

    mainWindow.on("ready-to-show",  async () => {
        mainWindow?.show();
    });
});

const baseDir = path.join(os.homedir(), "Plexy");
if (!fs.existsSync(baseDir))
    fs.mkdirSync(baseDir, { recursive: true });

app.setPath("userData", baseDir);
const APPS_DIR = path.join(app.getPath("userData"), "Apps");

let watchTimeout: NodeJS.Timeout | null = null;
fs.watch(APPS_DIR, { recursive: true}, () => {
    if (watchTimeout) clearTimeout(watchTimeout);

    watchTimeout = setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("plexy:apps-updated");
        }
    }, 200);
});

function getApps() {
    if (!fs.existsSync(APPS_DIR)) {
        fs.mkdirSync(APPS_DIR, { recursive: true });
    }

    return fs
        .readdirSync(APPS_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            const appPath = path.join(APPS_DIR, dirent.name);
            const previewPath = path.join(appPath, "preview.htmnl");

            if (!fs.existsSync(path.join(appPath, "index.js")) || !fs.existsSync(previewPath)) return null;

            return {
                name: dirent.name,
                previewPath
            };
        }).filter(Boolean);
}

ipcMain.handle("plexy:get-apps", () => {
    return getApps();
});

let CurrentApp: BrowserWindow | null = null;
ipcMain.on("plexy:launch-app", (_event, appName) => {
    if (CurrentApp && !(CurrentApp.isDestroyed())) {
        return dialog.showErrorBox("Launch Denied.", "You can only have one App running at a time. Please Close " + appName);
    }

    const appPath = path.join(APPS_DIR, appName);
    const entryPoint = path.join(appPath, "index.js");
    if (!fs.existsSync(entryPoint)) {
        return dialog.showErrorBox("Launch Failed", `No Entry Point (index.js) found for ${appName}`);
    }

    process.chdir(appPath);

    try {
        const appModule = require(entryPoint);
        const appWindow: BrowserWindow = appModule();

        if (!(appWindow instanceof BrowserWindow)) {
            throw new Error(
                `App ${appName} must return a BrowserWindow from it's entry point.`
            );
        }

        if (appWindow.getTitle() !== appName) {
            appWindow.setTitle(appName);
        }

        CurrentApp = appWindow;

        appWindow.on("closed", () => {
            CurrentApp = null;
        });
    } catch (err) {
        dialog.showErrorBox(`Error Launching ${appName}`,
            err instanceof Error ? err.stack || err?.message : String(err)
        );
    }
});
ipcMain.on("plexy:open-apps-folder", () => {
    shell.openPath(APPS_DIR);
});
ipcMain.on("plexy:close", () => {
    return app.quit();
})