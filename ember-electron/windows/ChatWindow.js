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
    'add-pigeon-topic',
    'remove-pigeon-topic',
    'window-ready',
    'close-window'
];

module.exports = class ChatWindow extends EventEmitter {
    constructor (opts = {}) {
        super();
        const window = this.createBrowserWindow();
        Object.assign(this, {
            windowReady: false,
            eventQueue: [],
            id: window.id,
            window,
            ...opts
        });
        this.registerListeners();
    }

    createBrowserWindow () {
        return new BrowserWindow({
            width: 1000,
            height: 500,
            webPreferences: {
                webSecurity: false
            }
        });
    }

    registerListeners () {
        const { realtime } = this;
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
        this.pigeonHandler = (data) => {
            window.webContents.send(`pigeon:${data.topicName}`, data);
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
                this.realtime.joinRoom(payload, (error) => {
                    this.window.webContents.send(`join:${id}`, null);
                });
                break;
            case 'request-history':
                this.realtime.getMessages(payload, (error, messages) => {
                    this.window.webContents.send(`history:${id}`, messages);
                });
                break;
            case 'send-message':
                this.realtime.sendMessage(payload, (error, message) => {
                    this.window.webContents.send(`send-message:${id}`, message);
                });
                break;
            case 'get-room-info':
                this.realtime.getRoomInfo(payload, (error, roomInfo) => {
                    this.window.webContents.send(`room-info:${id}`, roomInfo);
                });
                break;
            case 'invite-to-room':
                this.realtime.inviteToRoom(roomJid, userJid);
                break;
            case 'add-pigeon-topic':
                this.hawk.registerTopic(this.id, payload.topic, payload.priority, this.pigeonHandler);
                break;
            case 'remove-pigeon-topic':
                this.hawk.removeTopic(this.id, payload.topic, payload.priority, this.pigeonHandler);
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
        const { realtime, hawk } = this;
        hawk.removeAllTopicsByWindow(this.id, this.pigeonHandler);
        realtime.removeListener('message:*', this.messageHandler);
        realtime.removeListener('occupant-change:*', this.occupantHandler);
    }

    show ({ jid }) {
        this.window.loadURL(`serve://dist/chat/${jid}`);
        this.window.show();
    }

    close () {
        this.removeListeners();
        this.window.destroy();
    }
};
