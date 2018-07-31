import {isGroupJid, isPersonJid} from "../utils/jid-helpers";
import { computed } from '@ember/object';
import EmberObject from '@ember/object';

export default EmberObject.extend({
    id: null,
    jid: null,
    rawSubject: null,
    entity: null,

    messageCache: null,

    loadingHistory: false,
    firstMessageTimestamp: null,
    lastMessageTimestamp:null,

    init() {
        this.set('firstMessageTimestamp', Date.now());
        this.set('lastMessageTimestamp', Date.now());
        this.set('messageCache', {});
    },

    type: computed('jid', function () {
        const jid = this.get('jid');
        return isPersonJid(jid) ? 'person' : isGroupJid(jid) ? 'group' : 'adhoc';
    }),

    subject: computed('entity', 'rawSubject', function () {
        return this.get('entity.name') || this.get('rawSubject');
    }),

    historyHandler(event, messages) {

    },

    messageHandler(event, message) {
        console.log("message: ", message);
    }
});
