import { isPersonJid, isGroupJid } from "../utils/jid-helpers";
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import ChatRoom from '../models/chat-room';
import Service from '@ember/service';
import _ from 'lodash';

export default Service.extend({
    store: service(),
    ipc: service(),

    /**
     * We keep a cache of the rooms and array as well. The cache is used for all rooms this
     * window has ever seen and the array is all the current open rooms. The cache allows us to reopen
     * rooms quickly without all the setup if the user chooses to open the room again.
     */
    rooms: null,
    roomCache: null,
    openRoomHandler: null,

    init() {
        this._super(...arguments);
        this.registerListeners();
        this.set('roomCache', {});
        this.set('rooms', []);
    },

    willDestroy() {
        this.get('ipc').removeListener('open-room', this.openRoomHandler);
        this.openRoomHandler = null;
    },

    async openRoomEvent(event, message) {
        const { jid, rawSubject } = message;
        const room = await this.getChatRoom(jid);
        // Update the raw subject received from active chat
        room.set('rawSubject', rawSubject);
        this.get('rooms').addObject(room);
    },

    async getChatRoom(jid) {
        const roomId = _.first(jid.split('@'));
        let room = this.get(`roomCache.${roomId}`);
        if (!room) {
            room = ChatRoom.create({id: roomId, jid}, getOwner(this).ownerInjection());
            await this.setupRoom(room);
            this.set(`roomCache.${roomId}`, room);
        }
        return room;
    },

    async setupRoom(room) {
        await this.loadEntityData(room);
        this.setupRoomBindings(room);
    },

    async loadEntityData(room) {
        const jid = room.get('jid');

        let entity;
        if (isPersonJid(jid)) {
            entity = await this.get('store').findRecord('user', jid);
        } else if (isGroupJid(jid)) {
            entity = await this.get('store').findRecord('group', jid);
        }
        room.set('entity', entity);
    },

    registerListeners() {
        this.openRoomHandler = this.openRoomEvent.bind(this);
        this.get('ipc').registerListener('open-room', this.openRoomHandler);
    },

    setupRoomBindings(room) {
        const messageHandler = room.handleMessage.bind(this);
        const scopedMessageTopic = `message:${room.get('id')}`;
        this.get('ipc').registerListener(scopedMessageTopic, messageHandler);
    }
});
