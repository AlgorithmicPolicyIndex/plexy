"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("plexy", {
    getApps: async () => {
        return await electron_1.ipcRenderer.invoke("plexy:get-apps");
    },
    launchApp: (appName) => electron_1.ipcRenderer.send("plexy:launch-app", appName),
    openAppsFolder: () => electron_1.ipcRenderer.send("plexy:open-apps-folder"),
    onAppsUpdated: (callback) => {
        electron_1.ipcRenderer.on("plexy:apps-updated", callback);
    }
});
