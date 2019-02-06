import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

//TODO: localize system presences or fetch from presence service for localization
//TODO: create application service to fetch domain from for requests

const filteredPresences = [
    'Idle'
];

export default Component.extend({
    classNames: ['presence-selector'],

    presence: service(),
    session: service(),
    application: service(),

    showPresencePicker: false,

    didInsertElement() {
        const user = this.get('user');
        this.get('presence').subscribeToPresenceUpdates(user, true);
    },

    willDestroyElement() {
        const user = this.get('user');
        this.get('presence').unsubscribeFromPresenceUpdates(user, true);
    },

    user: reads('session.user'),
    presenceClass: reads('user.presenceClass'),

    presenceLabel: computed('user.presence.presenceDefinition.systemPresence', 'presence.presences', function () {
        const systemPresence = this.get('user.presence.presenceDefinition.systemPresence').toUpperCase();
        const presences = this.get('presence.presences').filter((presence) => {
            return presence.key.toUpperCase() === systemPresence
        });
        return presences.get('firstObject.label');
    }),

    presences: computed('presence.presences', function () {
        const presences = this.get('presence.presences') || [];
        return presences.filter((presence) => !filteredPresences.includes(presence.key));
    }),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        const fallbackUrl = this.get('application').buildBaseUrl('static-resources/avatar-x96.png');
        return _.get(imageUrl, 'imageUri', fallbackUrl);
    }),

    actions: {
        togglePicker() {
            this.toggleProperty('showPresencePicker');
        },

        setPresence(presence) {
            this.get('presence').setUserPresence(presence);
            this.toggleProperty('showPresencePicker');
        }
    }
});
