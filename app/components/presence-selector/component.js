import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    presence: service(),

    showPresencePicker: false,

    init() {
        this._super(...arguments);
    },

    presences: reads('presence.presences'),

    actions: {
        togglePicker() {
            console.log('Presence: ', this.get('presence.presences'));
            this.toggleProperty('showPresencePicker');
        }
    }
});
