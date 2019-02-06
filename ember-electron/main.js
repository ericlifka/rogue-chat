/* eslint-env node */
const protocolServe = require('electron-protocol-serve');
const { app, protocol, ipcMain } = require('electron');
const { dirname, join, resolve } = require('path');
const request = require('request-promise');

const { RealtimeAdapter, HawkAdapter } = require('./sockets');
const SocketIoProxy = require('./proxy/SocketIoProxy');
const WindowFactory = require('./windows');

// Registering a protocol & schema to serve our Ember application
protocol.registerStandardSchemes(['serve'], {secure: true});
protocolServe({
    cwd: join(__dirname || resolve(dirname('')), '..', 'ember'),
    app,
    protocol
});

// Start our proxy server
const socketIoProxy = new SocketIoProxy(8000, 'https://realtime.inindca.com');
socketIoProxy.start((err) => {
    if (err) {
        console.error('Failed to start proxy server', err);
        return process.exit(1);
    }
    console.log('Successfully started proxy server');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // app.quit();
    }
});

app.on('ready', async () => {
    const authWindow = WindowFactory.createWindow('AuthWindow');
    const accessToken = await new Promise((resolve) => {
        authWindow.on('authenticated', resolve);
        authWindow.show();
    });
    app.accessToken = accessToken;
    authWindow.close();

    const { chat: { jabberId } } = await request({
        uri: 'https://api.inindca.com/api/v2/users/me',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        json: true
    });

    // TODO: This shouldn't all be in the event handler
    const realtime = new RealtimeAdapter({
        authKey: accessToken
    });

    const hawk = new HawkAdapter(
        accessToken,
        'wss://streaming.inindca.com',
        jabberId
    );
    hawk.connect();

    const rosterWindow = WindowFactory.createWindow('RosterWindow', {
        realtime,
        hawk
    });

    ipcMain.on('request-token', function (event) {
        event.sender.send('auth-token', accessToken);
    });

    let chatWindow;
    ipcMain.on('open-room', function (event, args) {
        if (chatWindow) {
            return chatWindow.sendEvent('open-room', args);
        }
        chatWindow = WindowFactory.createWindow('ChatWindow', {
            realtime,
            hawk
        });
        chatWindow.on('closed', function () {
            chatWindow = null;
        });
        chatWindow.show(args);
    });
    rosterWindow.show();
});

process.on('uncaughtException', (err) => {
    console.log('Exception: ', err);
});
