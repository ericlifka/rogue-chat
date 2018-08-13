import {isGroupJid, isPersonJid} from "../utils/jid-helpers";
import { computed } from '@ember/object';
import EmberObject from '@ember/object';

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
        messages.forEach((message, index) => {
            const lastMessage = messages[index - 1];
            if (lastMessage && this.shouldGroupMessage(lastMessage, message)) {
                lastMessage.set('endOfBlock', false);
                message.set('startOfBlock', false);
            }
        });

        this.get('messages').pushObjects(messages);
    },

    messageHandler(message) {
        const messageId = message.id || message.oid;
        if (this.get(`messageCache.${messageId}`)) {
            return;
        }

        const lastMessage = this.get('messages.lastObject');
        if (lastMessage && this.shouldGroupMessage(lastMessage, message)) {
            lastMessage.set('endOfBlock', false);
            message.set('startOfBlock', false);
        }

        this.get('messages').pushObject(message);
    },

    shouldGroupMessage(lastMessage, message) {
        const difference = lastMessage.get('time').diff(message.get('time'), 'minutes');

        return lastMessage.from === message.from &&
            Math.abs(difference) <= 2;
    }
});
