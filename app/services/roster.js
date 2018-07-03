import {isAcdJid, isSupervisorJid, isScreenRecordingJid} from "../utils/jid-helpers";
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import Service from '@ember/service';

export default Service.extend({
    ipc: service(),

    activeChats: [],
    activeChatHandler: null,

    init () {
        this._super(...arguments);
    },

    bindToEvents () {
        this.activeChatHandler = this.activeChatEvent.bind(this);
        this.get('ipc').registerListener('activeChat', this.activeChatHandler);
    },

    willDestroy () {
        this.get('ipc').removeListener('activeChat', this.activeChatHandler);
        this.activeChatHandler = null;
    },

    activeChatEvent (event, message) {
        const {jid, active, last, subject, type} = message;

        if (isSupervisorJid(jid) || isAcdJid(jid) || isScreenRecordingJid(jid)) {
            return;
        }

        this.get('activeChats').pushObject({jid, active, last, subject, type});
    }
});
