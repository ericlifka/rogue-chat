'use strict';

const XMLHttpRequest = require('xmlhttprequest');
const { JSDOM } = require('jsdom');
const websocket = require('ws');

// Mock a bunch of client state to get realtime and hawk to not crash on load
const { window } = new JSDOM(``, {
    url: 'http://localhost'
});
const { document } = window;
global.window = window;
global.document = document;
global.WebSocket = websocket;
global.navigator = {};
global.location = global.window.location;
global.localStorage = window.localStorage;
global.window.XMLHttpRequest = XMLHttpRequest.XMLHttpRequest;
global.XMLHttpRequest = XMLHttpRequest.XMLHttpRequest;

const RealtimeAdapter = require('./RealtimeAdapter');
const HawkAdapter = require('./HawkAdapter');

module.exports = {
    RealtimeAdapter,
    HawkAdapter
};
