import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    tagName: 'button',
    presence: null,

    hasSecondaryPresences: reads('presence.hasSecondaryPresences'),
    presenceClass: computed('presence.key', function () {
        return this.get('presence.key').toLowerCase().replace(' ', '-');
    })
});
