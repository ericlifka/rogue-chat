import {isAcdJid, isSupervisorJid, isScreenRecordingJid, isPersonJid, isGroupJid} from "../utils/jid-helpers";
import {inject as service} from '@ember/service';
import { getOwner } from '@ember/application';
import RosterModel from '../models/roster';
import Service from '@ember/service';
import _ from 'lodash';

export default Service.extend({
    ipc: service(),
    store: service(),

    rosterCache: null,
    activeChats: null,
    activeChatHandler: null,

    init () {
        this._super(...arguments);
        this.set('activeChats', []);
        this.set('rosterCache', {});
    },

    willDestroy () {
        this.get('ipc').removeListener('activeChat', this.activeChatHandler);
        this.activeChatHandler = null;
    },

    bindToEvents () {
        this.activeChatHandler = this.activeChatEvent.bind(this);
        this.get('ipc').registerListener('activeChat', this.activeChatHandler);
    },

    async loadRosterModel (jid) {
        const rosterId = _.first(jid.split('@'));
        let rosterItem = this.get(`rosterCache.${rosterId}`);
        if (!rosterItem) {
            rosterItem = RosterModel.create({id: rosterId, jid}, getOwner(this).ownerInjection());
            const entity = await this.loadRosterEntityData(jid);
            rosterItem.set('entity', entity);
            this.set(`rosterCache.${rosterId}`, rosterItem);
        }
        return rosterItem;
    },

    loadRosterEntityData (jid) {
        if (isPersonJid(jid)) {
            return this.get('store').findRecord('user', jid);
        } else if (isGroupJid(jid)) {
            return this.get('store').findRecord('group', jid);
        }
        return null;
    },

    async activeChatEvent (event, message) {
        //Properties available from realtime -> {jid, active, last, subject, type}
        let {jid, subject, type} = message;

        if (isSupervisorJid(jid) || isAcdJid(jid) || isScreenRecordingJid(jid)) {
            return;
        }

        const rosterItem = await this.loadRosterModel(jid);
        rosterItem.setProperties({
            rawSubject: subject,
            type
        });

        this.get('activeChats').addObject(rosterItem);
    }
});
