const { BrowserWindow } = require('electron');
const { EventEmitter } = require('events');
const { ipcMain } = require('electron');
const _ = require('lodash');

module.exports = class ChatWindow extends EventEmitter {
    constructor(opts = {}) {
        super(...arguments);
        this.opts = opts;
        this.window = new BrowserWindow({
            width: 1000,
            height: 500,
            webPreferences: {
                webSecurity: false
            }
        });
        this.id = this.window.id;
        this.registerListeners();
    }

    registerListeners() {
        const { realtime } = this.opts;
        const { webContents } = this.window;

        //TODO: Should not subscribe to events until browser ask for them
        realtime.bindToEvent('message', '*', (messageEvent) => {
            const id = _.first(messageEvent.to.split('@'));
            webContents.send(`message:${id}`, messageEvent);
        });

        realtime.bindToEvent('occupantChange', '*', (occupantEvent) => {
            const id = _.first(occupantEvent.room.split('@'));
            webContents.send(`occupant:${id}`, occupantEvent);
        });

        ipcMain.on('join-room', (event, payload) => this.handleEvent('join-room', event, payload));
        ipcMain.on('request-history', (event, payload) => this.handleEvent('request-history', event, payload));
        ipcMain.on('send-message', (event, payload) => this.handleEvent('send-message', event, payload));
        ipcMain.on('get-room-info', (event, payload) => this.handleEvent('get-room-info', event, payload));
        ipcMain.on('invite-to-room', (event, payload) => this.handleEvent('invite-to-room', event, payload));
    }

    sendEvent(event, message) {
        this.window.webContents.send(event, message);
    }

    handleEvent(name, event, args) {
        const browserWindow = event.sender.getOwnerBrowserWindow();
        if (browserWindow.id !== this.id) {
            return;
        }

        const { id, payload } = args;
        switch(name) {
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
                const { roomJid, userJid } = payload;
                this.opts.realtime.inviteToRoom(roomJid, userJid);
                break;
        }
    }

    show() {
        this.window.loadURL(`serve://dist/chat`);
        this.window.show();
    }

    close() {
        this.window.destroy();
    }
};
