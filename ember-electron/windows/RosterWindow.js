const { BrowserWindow } = require('electron');
const { EventEmitter } = require('events');

module.exports = class RosterWindow extends EventEmitter {
    constructor(opts) {
        super(...arguments);
        this.opts = opts;
        this.window = new BrowserWindow({
            minWidth: 350,
            width: 350,
            maxWidth: 350,
            height: 700,
            webPreferences: {
                webSecurity: false
            },
            resizable: true
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
    }

    show() {
        const { accessToken } = this.opts;
        this.window.loadURL(`serve://dist?token=${accessToken}`);
        this.window.show();
    }

    close() {
        this.window.destroy();
    }
};
