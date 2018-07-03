/* eslint-env node */
const fs = require('fs');
const path = require('path');
const {app, BrowserWindow, protocol, ipcMain} = require('electron');
const {dirname, join, resolve} = require('path');
const protocolServe = require('electron-protocol-serve');
const SocketIoProxy = require('./proxy/SocketIoProxy');

/* mock a bunch of client state to get realtime to not crash on load */
const { JSDOM } = require('jsdom');
const { window } = new JSDOM(``);
const { document } = window;
global.window = window;
global.document = document;
global.WebSocket = require('ws');
global.navigator = {};
global.location = global.window.location;
global.localStorage = window.localStorage;

require('./realtime_node.js');
const Realtime = window.Realtime;
global.Realtime = window.Realtime;

let mainWindow = null;

// Registering a protocol & schema to serve our Ember application
protocol.registerStandardSchemes(['serve'], {secure: true});
protocolServe({
    cwd: join(__dirname || resolve(dirname('')), '..', 'ember'),
    app,
    protocol,
});

// Start our proxy server
const socketIoProxy = new SocketIoProxy(8000, 'https://realtime.inindca.com');
socketIoProxy.start((err, result) => {
    if (err) {
        console.error('Failed to start proxy server', err);
        return process.exit(1);
    }
    console.log('Successfully started proxy server');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

//TODO: not sure what this _should_ be in an electron context, this works for now because the purecloud integration is configure to look for it
let REDIRECT_URI = "http://localhost:4200";
let CLIENT_ID = process.env.CLIENT_ID || '';
const envPath = path.join(path.dirname(__filename), '../../../', '.env');
if (fs.existsSync(envPath)) {
    CLIENT_ID = require(envPath).CLIENT_ID;
    console.info('Using client id:', CLIENT_ID);
}

app.on('ready', () => {
    launchAuthWindow();
});

function launchAuthWindow() {
    let authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false
        }
    });

    authWindow.loadURL(`https://login.inindca.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}/`);
    authWindow.show();

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, url) =>{
        let raw_code = /token=([^&]*)/.exec(url);
        let raw_error = /\?errorKey=(.+)$/.exec(url);
        let code = (raw_code || [])[1];
        let error = (raw_error || [])[1];

        if (error) {
            console.error(`Auth Error: ${error}`);
            authWindow.destroy();
        }

        if (code) {
            console.info('Auth Token', code);
            authWindow.destroy();
            app.accessToken = code;
            launchEmberWindow();
        }
    });

    authWindow.on('close', function() {
        authWindow = null;
    }, false);
}

function setupRealtime(token) {
    let config = {
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
        authKey: token,
        host: 'http://localhost:8000'
    };

    return new Realtime(config);
}

function launchEmberWindow() {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 600,
    });

    const accessToken = app.accessToken;
    const realtime = setupRealtime(accessToken);

    realtime.on('activeChat', function(activeChatEvent) {
        mainWindow.webContents.send('activeChat', activeChatEvent);
    });

    ipcMain.on('main-window-ready', function () {
        console.log('connecting to realtime');
        // Shitty way to re-establish a realtime connect on ember reload
        realtime.disconnect();
        realtime.connect();
    });


    const emberAppLocation = `serve://dist?token=${accessToken}`;

    // Load the ember application using our custom protocol/scheme
    mainWindow.loadURL(emberAppLocation);

    // If a loading operation goes wrong, we'll send Electron back to
    // Ember App entry point
    mainWindow.webContents.on('did-fail-load', () => {
        mainWindow.loadURL(emberAppLocation);
    });

    mainWindow.webContents.on('crashed', () => {
        console.log('Your Ember app (or other code) in the main window has crashed.');
        console.log('This is a serious issue that needs to be handled and/or debugged.');
    });

    mainWindow.on('unresponsive', () => {
        console.log('Your Ember app (or other code) has made the window unresponsive.');
    });

    mainWindow.on('responsive', () => {
        console.log('The main window has become responsive again.');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


// Handle an unhandled error in the main thread
//
// Note that 'uncaughtException' is a crude mechanism for exception handling intended to
// be used only as a last resort. The event should not be used as an equivalent to
// "On Error Resume Next". Unhandled exceptions inherently mean that an application is in
// an undefined state. Attempting to resume application code without properly recovering
// from the exception can cause additional unforeseen and unpredictable issues.
//
// Attempting to resume normally after an uncaught exception can be similar to pulling out
// of the power cord when upgrading a computer -- nine out of ten times nothing happens -
// but the 10th time, the system becomes corrupted.
//
// The correct use of 'uncaughtException' is to perform synchronous cleanup of allocated
// resources (e.g. file descriptors, handles, etc) before shutting down the process. It is
// not safe to resume normal operation after 'uncaughtException'.
process.on('uncaughtException', (err) => {
    console.log('An exception in the main thread was not handled.');
    console.log('This is a serious issue that needs to be handled and/or debugged.');
    console.log(`Exception: `, err);
});
