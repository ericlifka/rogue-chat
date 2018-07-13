import EmberObject from '@ember/object';
const { computed } = EmberObject;

export default EmberObject.extend({
    presence: null,
    secondaryPresences: null,

    id: computed.reads('presence.id'),
    key: computed.reads('presence.name'),

    secondaryPresencesNames: computed('secondaryPresences.[]', function () {

    })
});
