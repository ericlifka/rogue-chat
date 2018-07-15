import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

//TODO: localize system presences or fetch from presence service for localization

export default Component.extend({
    presence: service(),
    session: service(),

    showPresencePicker: false,

    presences: reads('presence.presences'),
    user: reads('session.user'),
    presenceLabel: reads('user.presence.systemPresence'),

    presenceClass: computed('user.presence.systemPresence', function () {
        return this.get('session.user.presence.systemPresence').toLowerCase().replace(' ', '-');
    }),

    actions: {
        togglePicker() {
            this.toggleProperty('showPresencePicker');
        },

        setPresence(presence) {
            this.get('presence').setUserPresence(presence);
        }
    }
});
