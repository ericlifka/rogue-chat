const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``);
const { document } = window;

global.window = window;
global.document = document;

global.WebSocket = require('ws');
global.navigator = {};
global.location = global.window.location;

require('./realtime.js');

const Realtime = window.Realtime;

console.log(Realtime);
