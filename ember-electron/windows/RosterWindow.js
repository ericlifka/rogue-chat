const { BrowserWindow } = require('electron');
const ChatWindow = require('./ChatWindow');
const { ipcMain } = require('electron');

module.exports = class RosterWindow extends ChatWindow {
    constructor (opts) {
        super(...arguments);

        this.registerRealtimeListener();
        this.registerWindowReadyListener();
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

    registerWindowReadyListener () {
        // TODO: Ask for active chat instead of connecting and disconnecting realtime
        ipcMain.on('window-ready', (event) => {
            const browserWindow = event.sender.getOwnerBrowserWindow();
            if (browserWindow.id !== this.id) {
                return;
            }

            this.opts.realtime.reconnect();
        });

        ipcMain.on('resize-window', (event, size) => {
            const browserWindow = event.sender.getOwnerBrowserWindow();
            if (browserWindow.id !== this.id) {
                return;
            }

            this.window.setSize(size.width, size.height);
        });
    }

    registerRealtimeListener () {
        const { realtime } = this.opts;
        const { webContents } = this.window;

        realtime.on('active-chat:*', (activeChatEvent) => {
            webContents.send('activeChat', activeChatEvent);
        });
    }

    show () {
        this.window.loadURL(`serve://dist`);
        this.window.show();
    }
};
