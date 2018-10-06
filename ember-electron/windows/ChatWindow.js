const { BrowserWindow } = require('electron');
const { EventEmitter } = require('events');
const { ipcMain } = require('electron');
const _ = require('lodash');

const WINDOW_EVENTS = [
    'join-room',
    'request-history',
    'send-message',
    'get-room-info',
    'invite-to-room',
    'window-ready',
    'close-window'
];

module.exports = class ChatWindow extends EventEmitter {
    constructor (opts = {}) {
        super(...arguments);
        const window = new BrowserWindow({
            width: 1000,
            height: 500,
            webPreferences: {
                webSecurity: false
            }
        });
        Object.assign(this, {
            windowReady: false,
            eventQueue: [],
            id: window.id,
            window,
            opts
        });
        this.registerListeners();
    }

    registerListeners () {
        const { realtime } = this.opts;
        const window = this.window;

        // TODO: Should not subscribe to events until browser ask for them
        this.messageHandler = (messageEvent) => {
            const id = _.first(messageEvent.to.split('@'));
            window.webContents.send(`message:${id}`, messageEvent);
        };
        this.occupantHandler = (occupantEvent) => {
            const id = _.first(occupantEvent.room.split('@'));
            window.webContents.send(`occupant:${id}`, occupantEvent);
        };

        realtime.on('message:*', this.messageHandler);
        realtime.on('occupant-change:*', this.occupantHandler);

        WINDOW_EVENTS.forEach((eventName) => {
            ipcMain.on(eventName, (event, payload) => this.handleEvent(eventName, event, payload));
        });

        window.on('closed', () => {
            this.removeListeners();
            this.emit('closed');
        });
    }

    processQueue () {
        this.windowReady = true;
        this.eventQueue.forEach(({event, message}) => {
            this.window.webContents.send(event, message);
        });
        this.eventQueue = [];
    }

    sendEvent (event, message) {
        if (!this.windowReady) {
            return this.eventQueue.push({event, message});
        }
        this.window.webContents.send(event, message);
    }

    handleEvent (name, event, args) {
        const browserWindow = event.sender.getOwnerBrowserWindow();
        if (browserWindow.id !== this.id) {
            return;
        }

        const { id, payload, roomJid, userJid } = args || {};
        switch (name) {
            case 'join-room':
                this.opts.realtime.joinRoom(payload, (error) => {
                    this.window.webContents.send(`join:${id}`, null);
                });
                break;
            case 'request-history':
                this.opts.realtime.getMessages(payload, (error, messages) => {
                    this.window.webContents.send(`history:${id}`, messages);
                });
                break;
            case 'send-message':
                this.opts.realtime.sendMessage(payload, (error, message) => {
                    this.window.webContents.send(`send-message:${id}`, message);
                });
                break;
            case 'get-room-info':
                this.opts.realtime.getRoomInfo(payload, (error, roomInfo) => {
                    this.window.webContents.send(`room-info:${id}`, roomInfo);
                });
                break;
            case 'invite-to-room':
                this.opts.realtime.inviteToRoom(roomJid, userJid);
                break;
            case 'window-ready':
                this.processQueue();
                break;
            case 'close-window':
                this.close();
                break;
        }
    }

    removeListeners () {
        const { realtime } = this.opts;
        realtime.on('message:*', this.messageHandler);
        realtime.on('occupant-change:*', this.occupantHandler);
    }

    show ({ jid, rawSubject }) {
        this.window.loadURL(`serve://dist/chat/${jid}?rawSubject=${rawSubject}`);
        this.window.show();
    }

    close () {
        this.removeListeners();
        this.window.destroy();
    }
};
