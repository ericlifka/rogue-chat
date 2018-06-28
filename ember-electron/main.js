/* eslint-env node */
const fs = require('fs');
const path = require('path');
const {app, BrowserWindow, protocol} = require('electron');
const {dirname, join, resolve} = require('path');
const protocolServe = require('electron-protocol-serve');

let mainWindow = null;

// Registering a protocol & schema to serve our Ember application
protocol.registerStandardSchemes(['serve'], {secure: true});
protocolServe({
    cwd: join(__dirname || resolve(dirname('')), '..', 'ember'),
    app,
    protocol,
});

// Uncomment the lines below to enable Electron's crash reporter
// For more information, see http://electron.atom.io/docs/api/crash-reporter/
// electron.crashReporter.start({
//     productName: 'YourName',
//     companyName: 'YourCompany',
//     submitURL: 'https://your-domain.com/url-to-submit',
//     autoSubmit: true
// });

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

let REDIRECT_URI = "http://localhost:4200";
let CLIENT_ID = process.env.CLIENT_ID || '';
const envPath = path.join(path.dirname(__filename), '../../../', '.env');
console.log(`ENV PATH: "${envPath}"`);
if (fs.existsSync(envPath)) {
    CLIENT_ID = require(envPath).CLIENT_ID;
    console.info('Using client id:', CLIENT_ID);
}

app.on('ready', () => {

    // Build the OAuth consent page URL
    let authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false
        }
    });
    let purecloudAuthUrl =
        `https://login.inindca.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}/`;

    console.log(`AUTH URL: ${purecloudAuthUrl}`);
    authWindow.loadURL(purecloudAuthUrl);
    authWindow.show();


    function handleCallback (url) {
        let raw_code = /token=([^&]*)/.exec(url);
        let code = (raw_code || [])[1];

        let raw_error = /\?errorKey=(.+)$/.exec(url);
        let error = (raw_error || [])[1];

        if (error) {
            console.error(`Auth Error: ${error}`);
            authWindow.destroy();
        }

        if (code) {
            /* start ember window and pass token to it some how */
            console.log('CODE', code);
            authWindow.destroy();
        }
    }

    authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
        console.log('DID-GET-REDIRECT-REQUEST', oldUrl, newUrl);
        handleCallback(newUrl);
    });

    // Reset the authWindow on close
    authWindow.on('close', function() {
        authWindow = null;
    }, false);


    // mainWindow = new BrowserWindow({
    //     width: 800,
    //     height: 600,
    // });
    //
    // // If you want to open up dev tools programmatically, call
    // // mainWindow.openDevTools();
    //
    // const emberAppLocation = 'serve://dist';
    //
    // // Load the ember application using our custom protocol/scheme
    // mainWindow.loadURL(emberAppLocation);
    //
    // // If a loading operation goes wrong, we'll send Electron back to
    // // Ember App entry point
    // mainWindow.webContents.on('did-fail-load', () => {
    //     mainWindow.loadURL(emberAppLocation);
    // });
    //
    // mainWindow.webContents.on('crashed', () => {
    //     console.log('Your Ember app (or other code) in the main window has crashed.');
    //     console.log('This is a serious issue that needs to be handled and/or debugged.');
    // });
    //
    // mainWindow.on('unresponsive', () => {
    //     console.log('Your Ember app (or other code) has made the window unresponsive.');
    // });
    //
    // mainWindow.on('responsive', () => {
    //     console.log('The main window has become responsive again.');
    // });
    //
    // mainWindow.on('closed', () => {
    //     mainWindow = null;
    // });
});

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
    console.log(`Exception: ${err}`);
});
