import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import ChatRoom from '../models/chat-room';
import Service from '@ember/service';
import RSVP from 'rsvp';
import _ from 'lodash';

export default Service.extend({
    history: service(),
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
    activeInteraction: null,

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

    registerListeners() {
        this.openRoomHandler = this.openRoomEvent.bind(this);
        this.get('ipc').registerListener('open-room', this.openRoomHandler);
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
        const type = room.get('type');

        let entity;
        if (type === 'person') {
            entity = await this.get('store').findRecord('user', room.get('jid'));
        } else if (type === 'group') {
            entity = await this.get('store').findRecord('group', room.get('jid'));
        }
        room.set('entity', entity);
    },

    setupRoomBindings(room) {
        const messageHandler = room.messageHandler.bind(this);
        const scopedMessageTopic = `message:${room.get('id')}`;
        this.get('ipc').registerListener(scopedMessageTopic, messageHandler);
    },

    joinRoom(room) {
        const defer = RSVP.defer();
        // Create a timeout just in case we don't get a response from realtime
        const tid = setTimeout(() => {
            defer.reject(new Error('Never received a join room response from realtime'));
        }, 5000);

        const scopedJoinTopic = `join:${room.get('id')}`;
        this.get('ipc').registerOneTimeListener(scopedJoinTopic, () => {
            clearTimeout(tid);
            room.set('activated', true);
            defer.resolve();
        });
        this.get('ipc').sendEvent('join-room', {
            id: room.get('id'),
            payload: room.get('jid')
        });

        return defer.promise;
    },

    async setInteraction(room) {
        if (!room.get('activated')) {
            if (room.get('type')!== 'person') {
                await this.joinRoom(room);
            }
            await this.get('history').loadHistoryBefore(room);
            room.set('activated', true);
        }
        this.set('activeInteraction', room);
    }
});
