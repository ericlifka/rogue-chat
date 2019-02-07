import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
    classNames: ['entity-image', 'presence-status'],
    classNameBindings: ['presenceClass', 'entityType'],
    application: service(),
    entity: null,


    isGroup: equal('entity.modelName', 'group'),

    entityType: computed('isGroup', function () {
       return this.get('isGroup') ? 'group' : 'profile';
    }),

    profileImageUrl: computed('entity.images.[]', function () {
        const imageUrl = _.find(this.get('entity.images'), {resolution: 'x96'});
        const fallbackImage = this.get('isGroup') ? 'assets/images/group.svg' : 'assets/images/person.svg';
        return _.get(imageUrl, 'imageUri', fallbackImage);
    }),

    presenceClass: computed('entity.presence.systemPresence', function () {
        const presence = this.get('entity.presence.presenceDefinition.systemPresence');
        if (presence) {
            return presence.toLowerCase().replace(' ', '-');
        }
        return 'offline';
    }),
});
