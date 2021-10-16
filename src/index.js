const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,

			enableRemoteModule: true,
		},
	});

	mainWindow.loadFile(path.join(__dirname, "index.html"));

	mainWindow.webContents.openDevTools();
	mainWindow.once("ready-to-show", () => {
		autoUpdater.checkForUpdatesAndNotify();
	});
	autoUpdater.on("update-available", () => {
		mainWindow.webContents.send("update_available");
	});
	autoUpdater.on("update-downloaded", () => {
		mainWindow.webContents.send("update_downloaded");
	});
};
ipcMain.on("restart_app", () => {
	autoUpdater.quitAndInstall();
});
app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
ipcMain.on("app_version", (event) => {
	event.sender.send("app_version", { version: app.getVersion() });
});
