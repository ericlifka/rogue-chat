import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    classNames: ['participant'],

    occupant: null,

    name: reads('occupant.name'),

    presenceClass: computed('occupant.presence.presenceDefinition.systemPresence', function () {
        const presence = this.get('occupant.presence.presenceDefinition.systemPresence');
        if (presence) {
            return presence.toLowerCase().replace(' ', '-');
        }
        return 'offline';
    }),
});
