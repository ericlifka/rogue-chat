import { isPersonJid, isGroupJid } from "../utils/jid-helpers";
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import ChatRoom from '../models/chat-room';
import Service from '@ember/service';
import Ember from 'ember';
import _ from 'lodash';

export default Service.extend({
    store: service(),

    roomCache: null,

    init() {
        this._super(...arguments);
        this.set('roomCache', {});
    },

    async getChatRoom(jid) {
        const roomId = _.first(jid.split('@'));
        let room = this.get(`roomCache.${roomId}`);
        if (!room) {
            room = ChatRoom.create({id: roomId, jid}, getOwner(this).ownerInjection());
            this.setupRoom(room);
            this.set(`roomCache.${roomId}`, room);
        }
        return room;
    },

    async setupRoom(room) {
        const jid = room.get('jid');
        const entity = await this.loadEntityData(jid);
        room.set('entity', entity);
    },

    loadEntityData(jid) {
        if (isPersonJid(jid)) {
            return this.get('store').findRecord('user', jid);
        } else if (isGroupJid(jid)) {
            return this.get('store').findRecord('group', jid);
        }
        return null;
    }
});
