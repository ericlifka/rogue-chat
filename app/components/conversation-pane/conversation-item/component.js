import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    classNames: ['conversation-item'],
    presence: service(),

    rosterModel: null,

    isPerson: computed.equal('rosterModel.type', 'person'),
    presenceClass: reads('rosterModel.entity.presenceClass'),

    didInsertElement() {
        this.subscribeToPresenceUpdates();
    },

    willDestroyElement() {
        this.unsubscribeFromPresenceUpdates();
    },

    click (event) {
        const rosterModel = this.get('rosterModel');
        if (event.shiftKey) {
            return this.get('popoutRoom')(rosterModel);
        }
        return this.get('openRoom')(rosterModel);
    },

    subscribeToPresenceUpdates () {
        if (!this.get('isPerson')) {
            return;
        }

        const user = this.get('rosterModel.entity');
        this.get('presence').subscribeToPresenceUpdates(user, false);
    },

    unsubscribeFromPresenceUpdates() {
        if (!this.get('isPerson')) {
            return;
        }

        const user = this.get('rosterModel.entity');
        this.get('presence').unsubscribeFromPresenceUpdates(user, false);
    }
});
