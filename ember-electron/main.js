/* eslint-env node */
const fs = require('fs');
const path = require('path');
const {app, BrowserWindow, protocol, ipcMain} = require('electron');
const {dirname, join, resolve} = require('path');
const protocolServe = require('electron-protocol-serve');
const SocketIoProxy = require('./proxy/SocketIoProxy');
const RealtimeAdapter = require('./realtime/RealtimeAdapter');
const WindowFactory = require('./windows');

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

app.on('ready', () => {
    const authWindow = WindowFactory.createWindow('AuthWindow');
    authWindow.on('authenticated', (accessToken) => {
        app.accessToken = accessToken;
        authWindow.close();

        //TODO: This shouldn't all be in the event handler
        const realtime = new RealtimeAdapter({
            authKey: accessToken
        });

        const rosterWindow = WindowFactory.createWindow('RosterWindow', {
            accessToken,
            realtime
        });

        const chatWindow = WindowFactory.createWindow('ChatWindow', {
            accessToken,
            realtime
        });

        ipcMain.on('main-window-ready', function () {
            realtime.disconnect();
            realtime.connect();
        });

        ipcMain.on('open-room', function (event, args) {
            chatWindow.sendEvent('open-room', args);
        });

        ipcMain.on('join-room', function (event, args) {
            chatWindow.handleEvent('join-room', args);
        });

        ipcMain.on('request-history', function (event, args) {
            chatWindow.handleEvent('request-history', args);
        });

        ipcMain.on('send-message', function (event, args) {
           chatWindow.handleEvent('send-message', args);
        });

        rosterWindow.show();
        chatWindow.show();
    });
    authWindow.show();
});

process.on('uncaughtException', (err) => {
    console.log('An exception in the main thread was not handled.');
    console.log('This is a serious issue that needs to be handled and/or debugged.');
    console.log(`Exception: `, err);
});
