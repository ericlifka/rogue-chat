import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
    chat: service(),

    activeInteraction: reads('chat.activeInteraction'),
    interactions: reads('chat.rooms'),

    actions: {
        switchInteraction(room) {
            this.get('chat').setInteraction(room);
        }
    }
});
