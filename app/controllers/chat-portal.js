import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Controller from '@ember/controller'

export default Controller.extend({
    chat: service(),

    activeInteraction: reads('chat.activeInteraction'),
    interactions: reads('chat.rooms'),

    actions: {
        sendMessage(message) {
            const room = this.get('activeInteraction');
            this.get('chat').sendMessage(room, message);
        },
        switchInteraction(room) {
            this.get('chat').setInteraction(room);
        }
    }
});
