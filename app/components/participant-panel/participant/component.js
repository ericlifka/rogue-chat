import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['participant'],
    presence: service(),

    occupant: null,

    name: reads('occupant.name'),
    presenceClass: reads('occupant.presenceClass'),

    didInsertElement() {
        const user = this.get('occupant');
        this.get('presence').subscribeToPresenceUpdates(user, false);
    },

    willDestroyElement() {
        const user = this.get('occupant');
        this.get('presence').unsubscribeFromPresenceUpdates(user, false);
    },
});
