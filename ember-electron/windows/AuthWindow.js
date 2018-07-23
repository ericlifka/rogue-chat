const { BrowserWindow } = require('electron');
const { EventEmitter } = require('events');
const { dirname, join } = require('path');
const fs = require('fs');

module.exports = class AuthWindow extends EventEmitter {
    constructor () {
        super(...arguments);
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false
            }
        });
        this.registerListeners();
        this.loadAuthCredentials();
    }

    registerListeners () {
        const { webContents } = this.window;
        webContents.on('did-get-redirect-request', (event, oldUrl, url) =>{
            let raw_code = /token=([^&]*)/.exec(url);
            let raw_error = /\?errorKey=(.+)$/.exec(url);
            let code = (raw_code || [])[1];
            let error = (raw_error || [])[1];

            if (error) {
                console.error(`Auth Error: ${error}`);
                this.window.destroy();
            }

            if (code) {
                this.emit('authenticated', code);
            }
        });
    }

    loadAuthCredentials () {
        let CLIENT_ID = process.env.CLIENT_ID;

        if (!CLIENT_ID) {
            const envPath = join(dirname(__filename), '../../../../', '.env');
            if (fs.existsSync(envPath)) {
                CLIENT_ID = require(envPath).CLIENT_ID;
            }
        }

        this.authDetails = {
            REDIRECT_URI: "http://localhost:4200",
            CLIENT_ID
        }
    }

    show () {
        const { REDIRECT_URI, CLIENT_ID } = this.authDetails;
        this.window.loadURL(`https://login.inindca.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}/`);
        this.window.show();
    }

    close () {
        this.window.destroy();
    }
};
