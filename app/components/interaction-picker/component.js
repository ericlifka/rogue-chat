import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['interaction-picker'],
    chat: service(),
    rooms: reads('chat.rooms'),

    actions: {
        setActive(room) {
            this.get('chat').setInteraction(room);
        }
    }
});
