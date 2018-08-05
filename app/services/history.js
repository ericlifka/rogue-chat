import { inject as service } from '@ember/service';
import Service from '@ember/service';
import Ember from 'ember';
import RSVP from 'rsvp';

export default Service.extend({
    ipc: service(),
    chat: service(),

    messageHistoryRequestDefault: 25,

    requestHistory(room, options) {
        // You must have joined the room before requesting history
        if (!room.get('activated') && !(room.get('type') === 'person')) {
            throw new Error('room must be activated before requesting history');
        }
        // Realtime only supports fetching up to one hundred messages at a time
        options.limit = Math.min(options.limit, 100) || this.get('messageHistoryRequestDefault');

        const defer = RSVP.defer();
        // Create a timeout just in case we don't get a response from realtime
        const tid = setTimeout(() => {
            defer.reject(new Error('Never received a history response from realtime'));
        }, 5000);

        const scopedHistoryTopic = `history:${room.get('id')}`;
        this.get('ipc').registerOneTimeListener(scopedHistoryTopic, (event, messages) => {
            clearTimeout(tid);
            defer.resolve(messages);
        });

        room.set('loadingHistory', true);
        this.get('ipc').sendEvent('request-history', {
            id: room.get('id'),
            payload: options
        });

        return defer.promise;
    },

    loadRoomHistory(room, options) {
        return this.requestHistory(room, options)
            .then(async messages => {
                const messagePromises = messages.map(message => {
                    return this.get('chat').setupMessageModel(message);
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
