import {isAcdJid, isSupervisorJid, isScreenRecordingJid} from "../utils/jid-helpers";
import {inject as service} from '@ember/service';
import {computed} from '@ember/object';
import Service from '@ember/service';

export default Service.extend({
    ipc: service(),
    chat: service(),
    store: service(),

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

    async activeChatEvent (event, message) {
        let {jid, active, last, subject, type} = message;

        if (isSupervisorJid(jid) || isAcdJid(jid) || isScreenRecordingJid(jid)) {
            return;
        }

        const room = await this.get('chat').getChatRoom(jid);
        room.setProperties({
            rawSubject: subject,
            type
        });

        this.get('activeChats').pushObject(room);
    }
});
