const { EventEmitter } = require('events');
const rp = require('request-promise');
const assert = require('assert');
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

module.exports = class PigeonAdapter extends EventEmitter {
    constructor (accessKey, realtime) {
        super(...arguments);

        assert(accessKey, 'An auth token is required when creating an instance of pigeon');
        assert(realtime, 'An instance of realtime is required to handle pigeon subscriptions');

        Object.assign(this, {
            windows: {},
            accessKey,
            realtime
        });
        this.registerListeners();
    }

    registerListeners () {
        this.messageHandler = this.pigeonMessageHandler.bind(this);
        this.realtime.bindPigeonHandler(this.messageHandler);
    }

    updateTopics () {
        const topics = Object.keys(this.windows).map((key) => {
            return this.windows[key].topics();
        }).flat();

        const priorityTopic = Object.keys(this.windows).map((key) => {
            return this.windows[key].priorityTopics();
        }).flat();

        const totalTopics = Array
            .from(new Set([...priorityTopic, ...topics]).values())
            .slice(0, 1000);

        const channelId = this.accessKey;
        // TODO: Pull environment from somewhere instead of assuming DCA
        const url = `https://api.inindca.com/api/v2/notifications/channels/${channelId}/subscriptions`;
        const options = {
            url,
            headers: {
                'ININ-Session': this.accessToken
            },
            type: 'PUT',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: totalTopics
        };

        return rp(options)
            .tapCatch((error) => console.log('Failed to update topics for channel', error));
    }

    pigeonMessageHandler (source, message) {
        console.log('S: ', source, ' M: ', message);
    }

    registerTopic (windowId, topic, priority = false) {
        if (!this.windows[windowId]) {
            this.windows[windowId] = new WindowedTopics(windowId);
        }
        const windowedTopic = this.windows[windowId];
        windowedTopic.addTopic(topic, priority);

        _.throttle(this.registerTopic, 1000, { trailing: true });
    }

    removeTopic (windowId, topic, priority = false) {
        const windowedTopic = this.windows[windowId];
        if (!windowedTopic) {
            return;
        }
        windowedTopic.removeTopic(topic, priority);

        _.throttle(this.registerTopic, 1000, { trailing: true });
    }
};
