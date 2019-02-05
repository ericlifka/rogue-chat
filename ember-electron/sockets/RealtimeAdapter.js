'use strict';

const { EventEmitter } = require('events');
const assert = require('assert');

// Realtime checks the global context for itself, window isn't global in node so add realtime to the global
require('./realtime_node.js');
const Realtime = window.Realtime;
global.Realtime = window.Realtime;

// Default realtime config for chat, minus auth token
const defaultConfig = {
    carrierPigeon: true,
    fetchGroupsOnConnect: false,
    fetchRosterOnConnect: false,
    focusV2: true,
    jidResource: 'roguechat',
    jidRouting: true,
    offlineJoinNotifications: true,
    rawMessageIds: true,
    recentlyClosed: true,
    roomsV2: true,
    host: 'http://localhost:8000',
    transports: ['websocket']
};

module.exports = class RealtimeAdapter extends EventEmitter {
    constructor (config = {}) {
        super(...arguments);

        assert(config.authKey, 'An auth token is required when creating an instance of realtime');
        this.config = Object.assign(defaultConfig, config);
        this.realtime = new Realtime(this.config);
        this.subscribedEvents = {};
        this.bindRealtimeEvents();
    }

    connect () {
        this.realtime.connect();
    }

    reconnect () {
        this.realtime.disconnect();
        this.realtime.connect();
    }

    disconnect () {
        this.realtime.disconnect();
    }

    getMessages (options, callback) {
        this.realtime.getMessages(options, callback);
    }

    joinRoom (jid, callback) {
        this.realtime.joinRoom(jid, callback);
    }

    sendMessage (options, callback) {
        this.realtime.sendMessage(options, callback);
    }

    getRoomInfo (roomJid, callback) {
        this.realtime.getRoomInfo(roomJid, callback);
    }

    inviteToRoom (roomJid, userJid) {
        this.realtime.inviteToRoom(roomJid, userJid);
    }

    bindRealtimeEvents () {
        const realtime = this.realtime;
        realtime.on('activeChat', this.activeChat.bind(this));
        realtime.on('message', this.message.bind(this));
        realtime.on('occupantChange', this.occupantChange.bind(this));
    }

    // Realtime Events
    activeChat (activeChatEvent) {
        this.emit('active-chat:*', activeChatEvent);
        this.emit(`active-chat:${activeChatEvent.jid}`, activeChatEvent);
    }

    message (messageEvent) {
        this.emit('message:*', messageEvent);
        this.emit(`message:${messageEvent.jid}`, messageEvent);
    }

    occupantChange (occupantEvent) {
        this.emit('occupant-change:*', occupantEvent);
        this.emit(`occupant-change:${occupantEvent.jid}`, occupantEvent);
    }
};
