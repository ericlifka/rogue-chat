import { equal, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['picker-item'],
    tagName: 'button',

    presence: service(),
    room: null,

    isPerson: equal('room.type', 'person'),
    presenceClass: reads('room.entity.presenceClass'),

    didInsertElement() {
        this.subscribeToPresenceUpdates();
    },

    willDestroyElement() {
        this.unsubscribeFromPresenceUpdates();
    },

    click() {
        this.get('switchInteraction')(this.get('room'));
    },

    subscribeToPresenceUpdates () {
        if (!this.get('isPerson')) {
            return;
        }

        const user = this.get('room.entity');
        this.get('presence').subscribeToPresenceUpdates(user, false);
    },

    unsubscribeFromPresenceUpdates() {
        if (!this.get('isPerson')) {
            return;
        }

        const user = this.get('room.entity');
        this.get('presence').unsubscribeFromPresenceUpdates(user, false);
    }
});
