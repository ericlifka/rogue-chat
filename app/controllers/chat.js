import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
    router: service(),
    chat: service(),

    interactions: reads('chat.rooms'),

    actions: {
        switchInteraction(room) {
            this.get('router').transitionTo('chat.room', room.get('jid'), {
                queryParams: {
                    rawSubject: room.get('rawSubject')
                }
            });
        },

        closeInteraction(room) {
            this.get('chat').closeInteraction(room);
        }
    }
});
