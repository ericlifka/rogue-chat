"use strict";

const assert = require('assert');

// Mock a bunch of client state to get realtime to not crash on load
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``);
const { document } = window;
global.window = window;
global.document = document;
global.WebSocket = require('ws');
global.navigator = {};
global.location = global.window.location;
global.localStorage = window.localStorage;

// Realtime checks the global context for itself, window isn't global in node so add realtime to the global
require('./realtime_node.js');
const Realtime = window.Realtime;
global.Realtime = window.Realtime;

//Default realtime config for chat, minus auth token
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
    host: 'http://localhost:8000'
};

module.exports = class RealtimeAdapter {
    constructor(config = {}) {
        assert(config.authKey, 'An auth token is required when creating an instance of realtime');
        this.config = Object.assign(defaultConfig, config);
        this.realtime = new Realtime(this.config);
        this.subscribedEvents = {};
        this.bindRealtimeEvents();
    }

    connect() {
        this.realtime.connect();
    }

    reconnect() {
        this.realtime.disconnect();
        this.realtime.connect();
    }

    disconnect() {
        this.realtime.disconnect();
    }

    bindToEvent(event, scope, handler) {
        const subscribedEvents = this.subscribedEvents;
        if (!subscribedEvents[event]) {
            subscribedEvents[event] = {};
        }
        const eventList = subscribedEvents[event];

        if (!eventList[scope]) {
            eventList[scope] = [];
        }

        eventList[scope].push(handler);
    }

    removeBoundEvent(event, scope, handler) {
        const eventList = this.subscribedEvents[event] || {};
        const scopedEvents = eventList[scope] || [];
        const filteredEvents = scopedEvents.filter(originalHandler => originalHandler === handler);
        eventList[scope] = filteredEvents;

        // Return if an event was actually deleted by comparing array lengths
        return scopedEvents.length !== filteredEvents.length;
    }

    bindRealtimeEvents() {
        const realtime = this.realtime;
        realtime.on('activeChat', this.activeChat.bind(this));
        realtime.on('message', this.message.bind(this));
    }

    notifyListeners(eventList, event) {
        // Search the wild card and the event id
        const wildcard = eventList['*'] || [];
        const scoped = eventList[event.jid] || [];

        wildcard.concat(scoped).forEach(handler => handler(event));
    }

    //Realtime Events
    activeChat(activeChatEvent) {
        const activeChatEventList = this.subscribedEvents['activeChat'];
        this.notifyListeners(activeChatEventList, activeChatEvent);
    }

    message(messageEvent) {
        const messageEventList = this.subscribedEvents['message'];
        this.notifyListeners(messageEventList, messageEvent);
    }
};
