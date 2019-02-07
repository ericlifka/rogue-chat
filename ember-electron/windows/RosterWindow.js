const { BrowserWindow } = require('electron');
const ChatWindow = require('./ChatWindow');
const { ipcMain } = require('electron');

module.exports = class RosterWindow extends ChatWindow {
    constructor (opts) {
        super(...arguments);
        this.registerAdditionalListeners();
    }

    createBrowserWindow () {
        return new BrowserWindow({
            minWidth: 356,
            width: 356,
            height: 700,
            webPreferences: {
                webSecurity: false
            },
            resizable: true
        });
    }

    registerAdditionalListeners () {
        const { realtime, window } = this;
        const { webContents } = window;

        this.readyListener = (event) => {
            const browserWindow = event.sender.getOwnerBrowserWindow();
            if (browserWindow.id !== this.id) {
                return;
            }

            this.realtime.reconnect();
        };
        this.resizeListener = (event, size) => {
            const browserWindow = event.sender.getOwnerBrowserWindow();
            if (browserWindow.id !== this.id) {
                return;
            }

            this.window.setSize(size.width, size.height);
        };
        this.activeListener = (activeChatEvent) => {
            webContents.send('activeChat', activeChatEvent);
        };
        window.on('closed', () => {
            this.removeAdditionalListeners();
        });
        ipcMain.on('window-ready', this.readyListener);
        ipcMain.on('resize-window', this.resizeListener);
        realtime.on('active-chat:*', this.activeListener);
    }

    removeAdditionalListeners () {
        ipcMain.removeListener('window-ready', this.readyListener);
        ipcMain.removeListener('resize-window', this.resizeListener);
        this.realtime.removeListener('active-chat:*', this.activeListener);
    }

    show () {
        this.window.loadURL(`serve://dist`);
        this.window.show();
    }
};
