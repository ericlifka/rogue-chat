const Hawk = require('./streaming-client');
const _ = require('lodash');

class WindowedTopics {
    constructor (id) {
        this.id = id;
        this._topics = new Set([]);
        this._priorityTopics = new Set([]);
    }

    addTopic (topic, priority = false) {
        if (priority) {
            return this._priorityTopics.add(topic);
        }
        this._topics.add(topic);
    }

    hasTopic (topic, priority = false) {
        return priority ? this._priorityTopics.has(topic) : this._topics.has(topic);
    }

    removeTopic (topic, priority = false) {
        if (priority) {
            return this._priorityTopics.delete(topic);
        }
        this._topics.delete(topic);
    }

    priorityTopics () {
        const prioritySet = this._priorityTopics.values();
        return Array.from(prioritySet);
    }

    topics () {
        const topicSet = this._topics.values();
        return Array.from(topicSet);
    }

    totalCount () {
        return this._priorityTopics.size + this._topics.size;
    }
}

module.exports = class HawkAdapter {
    constructor (authToken, host, jid) {
        const streamingClient = new Hawk({
            authToken,
            host,
            jid,
            channelId: authToken
        });
        this.windows = {};
        this.authToken = authToken;
        this.streamingClient = streamingClient;
        this.streamingClient.on('connected', console.log.bind(console));
        this.throttledUpdate = _.throttle(this.updateTopics, 1000, { trailing: true });
    }

    connect () {
        this.streamingClient.connect();
    }

    updateTopics () {
        // Use .flat when upgrading to node 11
        const topics = _.flatten(Object.keys(this.windows).map((key) => {
            return this.windows[key].topics();
        }));

        const priorityTopic = _.flatten(Object.keys(this.windows).map((key) => {
            return this.windows[key].priorityTopics();
        }));

        const totalTopics = Array
            .from(new Set([...priorityTopic, ...topics]).values())
            .slice(0, 1000);

        this.streamingClient.notifications.bulkSubscribe(totalTopics);
    }

    registerTopic (windowId, topic, priority = false, handler) {
        if (!this.windows[windowId]) {
            this.windows[windowId] = new WindowedTopics(windowId);
        }

        const windowedTopic = this.windows[windowId];
        if (windowedTopic.hasTopic(topic, priority)) {
            return;
        }
        windowedTopic.addTopic(topic, priority);

        this.streamingClient.on(`notify:${topic}`, handler);
        this.throttledUpdate();
    }

    removeTopic (windowId, topic, priority = false, handler) {
        const windowedTopic = this.windows[windowId];
        if (!windowedTopic) {
            return;
        }
        windowedTopic.removeTopic(topic, priority);

        this.streamingClient.off(`notify:${topic}`, handler);
        this.throttledUpdate();
    }
};
