import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
    classNames: ['entity-image', 'presence-status'],
    classNameBindings: ['presenceClass'],
    application: service(),
    entity: null,

    profileImageUrl: computed('entity.images.[]', function () {
        const imageUrl = _.find(this.get('entity.images'), {resolution: 'x96'});
        const fallbackUrl = this.get('application').buildBaseUrl('static-resources/avatar-x96.png');
        return _.get(imageUrl, 'imageUri', fallbackUrl);
    }),

    presenceClass: computed('entity.presence.systemPresence', function () {
        const presence = this.get('entity.presence.presenceDefinition.systemPresence');
        if (presence) {
            return presence.toLowerCase().replace(' ', '-');
        }
        return 'offline';
    }),
});
