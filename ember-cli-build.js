'use strict';

const fs = require('fs');
const path = require('path');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

let CLIENT_ID = process.env.CLIENT_ID || '';

const envPath = path.join(path.dirname(__filename), '.env');
if (fs.existsSync(envPath)) {
    CLIENT_ID = require(envPath).CLIENT_ID;
    console.info('Using client id:', CLIENT_ID);
}

module.exports = function (defaults) {
    let app = new EmberApp(defaults, {
        sourcemaps: {
            enabled: true,
            extensions: ['js']
        },
        replace: {
            files: ['index.html', '**/*.js'],
            patterns: [{
                match: 'CLIENT_ID',
                replacement: CLIENT_ID
            }],
        },
        "ember-cli-babel": {
            includePolyfill: true
        }
    });

    return app.toTree();
};
