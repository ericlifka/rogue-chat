import { isPersonJid, isGroupJid } from "../utils/jid-helpers";
import { inject as service } from '@ember/service';
import ChatRoom from '../models/chat-room';
import { computed } from '@ember/object';
import Service from '@ember/service';
import Ember from 'ember';

const { getOwner } = Ember;

export default Service.extend({
    store: service(),

    roomCache: {},

    async getChatRoom(jid) {
        let room = this.get(`roomCache.${jid}`);
        if (!room) {
            room = ChatRoom.create({jid}, getOwner(this).ownerInjection());
            this.setupRoom(room);
            Ember.set(this.roomCache, jid, room, true);
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
            //TODO: Finish group model so we can load group data
            return null;//this.get('store').findRecord('group', jid);
        }
    }
});
