import {isGroupJid, isPersonJid} from "../utils/jid-helpers";
import { computed } from '@ember/object';
import EmberObject from '@ember/object';
import _ from 'lodash';

export default EmberObject.extend({
    id: null,
    jid: null,
    rawSubject: null,
    entity: null,

    messageCache: null,
    messages: null,

    loadingHistory: false,
    firstMessageTimestamp: null,
    lastMessageTimestamp:null,

    init() {
        this._super(...arguments);
        this.set('firstMessageTimestamp', Date.now());
        this.set('lastMessageTimestamp', Date.now());
        //TODO: Switch out for an lru to auto prune old data otherwise this can grow unbounded
        this.set('messageCache', {});
        this.set('messages', []);
    },

    type: computed('jid', function () {
        const jid = this.get('jid');
        return isPersonJid(jid) ? 'person' : isGroupJid(jid) ? 'group' : 'adhoc';
    }),

    subject: computed('entity', 'rawSubject', function () {
        return this.get('entity.name') || this.get('rawSubject');
    }),

    historyHandler(messages) {
        messages = this.addHistoryMessages(messages);
        messages = this.processHistoryCorrections(messages);
        this.groupHistoryMessages(messages);
        this.set('messages', messages);
    },

    addHistoryMessages(historyMessages) {
        historyMessages.forEach((message) => {
            this.set(`messageCache.${message.id}`, message);
        });
        const messages = this.get('messages');
        messages.unshiftObjects(historyMessages);
        return messages;
    },

    processHistoryCorrections(messages) {
        return messages.filter((message) => {
            const correctionId = message.get('corrects');
            if (correctionId) {
                const originalMessage = this.get(`messageCache.${correctionId}`);
                if (originalMessage) {
                    originalMessage.set('correctionRaw', message.get('raw'));
                    return false;
                }
            }
            return true;
        });
    },

    groupHistoryMessages(messages) {
        messages.forEach((message, index) => {
            const lastMessage = messages[index - 1];
            if (lastMessage && this.shouldGroupMessage(lastMessage, message)) {
                lastMessage.set('endOfBlock', false);
                message.set('startOfBlock', false);
            }
        });
    },

    messageHandler(message) {
        const messageId = message.id || message.oid;
        if (this.get(`messageCache.${messageId}`)) {
            return;
        }

        const correctionId = message.get('corrects');
        if (correctionId) {
            const originalMessage = this.get(`messageCache.${correctionId}`);
            originalMessage.set('correctionRaw', message.get('raw'));
            return;
        }

        const lastMessage = this.get('messages.lastObject');
        if (lastMessage && this.shouldGroupMessage(lastMessage, message)) {
            lastMessage.set('endOfBlock', false);
            message.set('startOfBlock', false);
        }

        this.set(`messageCache.${messageId}`, message);
        this.get('messages').pushObject(message);
    },

    shouldGroupMessage(lastMessage, message) {
        const difference = lastMessage.get('time').diff(message.get('time'), 'minutes');

        return lastMessage.from === message.from &&
            !message.get('corrected') &&
            Math.abs(difference) <= 2;
    },

    updatePendingMessage(message) {
        const pendingMessage = this.get(`messageCache.${message.oid}`);
        delete this.messageCache[message.oid];
        pendingMessage.set('id', message.id);
        this.set(`messageCache.${message.id}`, message);
    }
});
