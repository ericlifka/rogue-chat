import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Component.extend({
    classNames: ['entity-image', 'presence-status'],
    classNameBindings: ['presenceClass'],
    entity: null,

    profileImageUrl: computed('entity.images.[]', function () {
        const imageUrl = _.find(this.get('entity.images'), {resolution: 'x96'});
        return _.get(imageUrl, 'imageUri', 'https://apps.inindca.com/static-resources/avatar-x96.png');
    }),

    presenceClass: computed('entity.presence.systemPresence', function () {
        const presence = this.get('entity.presence.presenceDefinition.systemPresence');
        if (presence) {
            return presence.toLowerCase().replace(' ', '-');
        }
        return 'offline';
    }),
});
