import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
    presence: null,
    secondaryPresences: null,

    id: reads('presence.id'),
    key: reads('presence.name'),

    secondaryPresencesNames: computed('secondaryPresences.[]', function () {

    })
});
