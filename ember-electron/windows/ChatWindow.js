const { BrowserWindow } = require('electron');
const { EventEmitter } = require('events');
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
    }

    sendEvent(event, message) {
        this.window.webContents.send(event, message);
    }

    handleEvent(event, args) {
        //TODO: Make a better way of handling these events, also probably should start handling errors
        const { id, payload } = args;
        switch(event) {
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
