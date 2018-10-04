const { BrowserWindow } = require('electron');
const { EventEmitter } = require('events');
const { ipcMain } = require('electron');

module.exports = class RosterWindow extends EventEmitter {
    constructor(opts) {
        super(...arguments);
        const window = new BrowserWindow({
            minWidth: 350,
            width: 350,
            maxWidth: 350,
            height: 700,
            webPreferences: {
                webSecurity: false
            },
            resizable: true
        });
        Object.assign(this, {
            id: window.id,
            window,
            opts
        });
        this.registerListeners();
    }

    registerListeners() {
        const { realtime } = this.opts;
        const { webContents } = this.window;

        realtime.bindToEvent('activeChat', '*', (activeChatEvent) => {
            webContents.send('activeChat', activeChatEvent);
        });

        realtime.bindToEvent('message', '*', (messageEvent) => {
            webContents.send('message', messageEvent);
        });

        ipcMain.on('window-ready', (event, payload) => this.handleEvent('window-ready', event, payload));
    }

    handleEvent(name, event) {
        const browserWindow = event.sender.getOwnerBrowserWindow();
        if (browserWindow.id !== this.id) {
            return;
        }

        const { realtime } = this.opts;
        switch (name) {
            case 'window-ready':
                // TODO: Don't toggle realtime state in the window, instead ask for active chats
                realtime.disconnect();
                realtime.connect();
                break;
        }
    }

    sendEvent(event, message) {
        this.window.webContents.send(event, message);
    }

    show() {
        this.window.loadURL(`serve://dist`);
        this.window.show();
    }

    close() {
        this.window.destroy();
    }
};
