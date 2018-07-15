import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

//TODO: localize system presences or fetch from presence service for localization
//TODO: create application service to fetch domain from for requests

export default Component.extend({
    presence: service(),
    session: service(),

    showPresencePicker: false,

    presences: reads('presence.presences'),
    user: reads('session.user'),
    presenceLabel: reads('user.presence.systemPresence'),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        return _.get(imageUrl, 'imageUri', 'https://apps.inindca.com/static-resources/avatar-x96.png');
    }),

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
