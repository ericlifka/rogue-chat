import { inject as service } from '@ember/service';
import Service from '@ember/service';
import Ember from 'ember';
import RSVP from 'rsvp';
import uuid from 'uuid';

export default Service.extend({
    ipc: service(),
    chat: service(),

    messageHistoryRequestDefault: 25,

    requestHistory(id, options) {
        // Realtime only supports fetching up to one hundred messages at a time
        options.limit = Math.min(options.limit, 100) || this.get('messageHistoryRequestDefault');

        return new RSVP.Promise((resolve, reject) => {
            // Create a timeout just in case we don't get a response from realtime
            const tid = setTimeout(() => {
                reject(new Error('Never received a history response from realtime'));
            }, 10000);

            const scopedHistoryTopic = `history:${id}`;
            this.get('ipc').registerOneTimeListener(scopedHistoryTopic, (event, messages) => {
                clearTimeout(tid);
                // realtime emits null if there is no history so we can't use default assignment
                resolve(messages || []);
            });

            this.get('ipc').sendEvent('request-history', {
                id,
                payload: options
            });
        });
    },

    loadHistoryWithoutRoom(options) {
        const id = uuid.v4();
        return this.requestHistory(id, options)
            .then(async messages => {
                const messagePromises = messages.map(message => {
                    return this.get('chat').setupMessageModel(message, '');
                });
                return await RSVP.all(messagePromises);
            })
            .catch(error => {
                Ember.Logger.error('Failed to fetch history from realtime, error: ', error);
                return error;
            })
    },

    loadRoomHistory(room, options) {
        // You must have joined the room before requesting history
        if (!room.get('activated') && !(room.get('type') === 'person')) {
            throw new Error('room must be activated before requesting history');
        }
        room.set('loadingHistory', true);

        return this.requestHistory(room.get('id'), options)
            .then(async messages => {
                const messagePromises = messages.map(message => {
                    return this.get('chat').setupMessageModel(message, 'YYYY-MM-DD HH:mm:ss.SSS');
                });
                messages = await RSVP.all(messagePromises);
                room.historyHandler(messages);
            })
            .catch(error => {
                Ember.Logger.error('Failed to fetch history from realtime, error: ', error);
                return error;
            })
            .finally(() => {
                room.set('loadingHistory', false);
            });
    },

    loadHistoryBefore(room) {
        const options = {
            jid: room.get('jid'),
            before: room.get('firstMessageTimestamp'),
            limit: this.get('messageHistoryRequestDefault')
        };
        return this.loadRoomHistory(room, options);
    },

    loadHistoryAfter(room) {
        const options = {
            jid: room.get('jid'),
            after: room.get('lastMessageTimestamp'),
            limit: this.get('messageHistoryRequestDefault')
        };
        return this.loadRoomHistory(room, options);
    }
});
