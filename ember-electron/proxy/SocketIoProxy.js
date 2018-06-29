const http = require("http");
const httpProxy = require("http-proxy");
const url = require("url");
const https = require("https");

class SessionStore {
    constructor() {
        this.getOrAddSessionById = this.getOrAddSessionById.bind(this);
        this.setSessionById = this.setSessionById.bind(this);
        this.getSessionById = this.getSessionById.bind(this);
        this.getSessionCount = this.getSessionCount.bind(this);
        this.removeSessionById = this.removeSessionById.bind(this);
        this._sessionsBySessionId = {};
    }

    getOrAddSessionById(sessionId, onSessionCreated) {
        let session = this.getSessionById(sessionId);
        if ((session == null)) {
            session = {};
            this._sessionsBySessionId[sessionId] = session;
            debug('session', `Created session with ID [${sessionId}].`);

            if (onSessionCreated != null) {
                onSessionCreated(sessionId);
            }
        }

        return session;
    }

    setSessionById(sessionId, value) {
        const session = this.getSessionById(sessionId);
        if ((session == null)) {
            return debug('session', `Cannot set session value. Session with ID [${sessionId}] does not exist.`);
        } else {
            return this._sessionsBySessionId[sessionId] = value;
        }
    }

    getSessionById(sessionId) {
        return this._sessionsBySessionId[sessionId];
    }

    getSessionCount() {
        return Object.keys(this._sessionsBySessionId).length;
    }

    removeSessionById(sessionId) {
        return delete this._sessionsBySessionId[sessionId];
    }
}

class SocketIoProxy {

    constructor(proxyPort, uri) {
        this.start = this.start.bind(this);
        this.on_socketioproxy_res = this.on_socketioproxy_res.bind(this);
        this.on_socketioproxyserver_request = this.on_socketioproxyserver_request.bind(this);
        this.on_socketioproxyserver_upgrade = this.on_socketioproxyserver_upgrade.bind(this);
        this._sessionStore = new SessionStore();
        this.proxyPort = proxyPort;
        this.uri = uri;
        this.proxyUri = `http://localhost:${this.proxyPort}`;
        this.socketioProxy = httpProxy.createProxyServer({ target: this.uri, ws: true, toProxy: true, changeOrigin: true, agent: https.globalAgent });
        this.socketioProxy.on('proxyRes', this.on_socketioproxy_res);
        this.socketioProxy.on('error', this.on_socketioproxy_error);
        this.socketioProxy.on('close', this.on_socketioproxy_close);

        this.socketioProxyServer = http.createServer(this.on_socketioproxyserver_request);
        this.socketioProxyServer.on('upgrade', this.on_socketioproxyserver_upgrade);
        this.socketioProxyServer.on('clientError', this.on_socketioproxyserver_clienterror);
    }

    create_local_context_attributes(req) {
        const localContextAttributes = {};

        if (req != null) {
            localContextAttributes.sessionId = this.get_sessionid_from_req(req);
            localContextAttributes.reqUrl = req.url;
            localContextAttributes.reqMethod = req.method;

            if (req.headers['x-purecloudapi-correlation-id']) {
                localContextAttributes.bisCorrelationId = req.headers['x-purecloudapi-correlation-id'];
            }

            if (req.headers['connection']) {
                localContextAttributes.reqConnectionHeader = req.headers['connection'];
            }
        }

        return localContextAttributes;
    }

    get_sessionid_from_req(req) {
        return url.parse(req.url, true).query.sessionId;
    }

    start(callback) {
        return this.socketioProxyServer.listen(this.proxyPort, callback);
    }

    on_socketioproxy_res(proxyRes, req, res) {
        const localContextAttributes = this.create_local_context_attributes(req);

        const session = this._sessionStore.getSessionById(localContextAttributes.sessionId);

        if ((session == null)) {
            return;
        }

        const setCookies = proxyRes.headers['set-cookie'];

        if (setCookies) {
            setCookies.forEach((cookie) => {
                // Strip everthing to the right of (and including) the semicolon
                let cookieNameValue = (cookie.split(";"))[0];

                // Parse out the name (left of the '=') and the value (right of the '=')
                cookieNameValue = cookieNameValue.split("=");

                const oldCookie = session.authCookies[cookieNameValue[0]];
                if (oldCookie) {
                    if (oldCookie !== cookieNameValue[1]) {
                        console.log("cookies", "Cookie", cookieNameValue[0], "changing from", oldCookie, "to", cookieNameValue[1], localContextAttributes);
                    }
                } else {
                    console.log("cookies", "Adding cookie", cookieNameValue[0], cookieNameValue[1], localContextAttributes);
                }

                // Add the name/value to a new cookie in this sessions authCookies
                session.authCookies[cookieNameValue[0]] = cookieNameValue[1];
            });
        } else {
            console.log("cookies", "setCookies empty!", localContextAttributes);
        }

    }

    on_socketioproxy_error(err, req, res) {
        const localContextAttributes = this.create_local_context_attributes(req);
        console.error('proxy request to the target encountered error:', err, localContextAttributes);
    }

    on_socketioproxy_close(res, socket, head) {
        console.log('connect', 'proxy websocket closed with statusCode', res.statusCode);
    }

    on_socketioproxyserver_request(req, res) {
        const localContextAttributes = this.create_local_context_attributes(req);
        console.log("socketio", "proxying socketio request", localContextAttributes);

        this.add_cookies_to_request(req, localContextAttributes.sessionId);

        this.socketioProxy.web(req, res, err => console.error('proxying websocket upgrade request encountered error:', err));
    }

    on_socketioproxyserver_upgrade(req, socket, head) {
        const localContextAttributes = this.create_local_context_attributes(req);
        console.log('connect', 'proxying socket upgrade request', localContextAttributes);

        this.add_cookies_to_request(req, localContextAttributes.sessionId);

        this.socketioProxy.ws(req, socket, head, err => console.error('proxying websocket upgrade request encountered error:', err));
    }

    on_socketioproxyserver_clienterror(exception, socket) {
        const localContextAttributes = this.create_local_context_attributes(req);
        console.error(exception, localContextAttributes);
    }

    add_cookies_to_request(req, sessionId) {
        const session = this._sessionStore.getSessionById(sessionId);
        if (session != null) {
            const { authCookies } = session;

            let cookieString = "";
            //cookieString += cookieParse.serialize(cookieName, cookieValue, { encode: (str) -> return str }) + ";" for cookieName, cookieValue of authCookies
            for (let cookieName in authCookies) { const cookieValue = authCookies[cookieName]; cookieString += cookieName + "=" + cookieValue + ";"; }

            req.headers['Cookie'] = cookieString;
        }
    }
}

module.exports = SocketIoProxy;
