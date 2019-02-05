const Hawk = require('./streaming-client');

module.exports = class HawkAdapter {
    constructor (authToken, host, jid) {
        this.streamingClient = new Hawk({
            authToken,
            host,
            jid
        });

        this.streamingClient.on('connected', console.log.bind(console));
    }

    connect () {
        this.streamingClient.connect();
    }
};
