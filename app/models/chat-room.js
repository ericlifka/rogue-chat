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
        this.get('messages').pushObjects(messages);
    },

    messageHandler(event, message) {
        console.log("message: ", message);
    }
});
