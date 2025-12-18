import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("plexy", {
    getApps: async () => {
        return await ipcRenderer.invoke("plexy:get-apps");
    },
    close: () => ipcRenderer.send("plexy:close"),
    launchApp: (appName: string) => ipcRenderer.send("plexy:launch-app", appName),
    openAppsFolder: () => ipcRenderer.send("plexy:open-apps-folder"),
    onAppsUpdated: (callback: () => void) => {
        ipcRenderer.on("plexy:apps-updated", callback);
    }
});