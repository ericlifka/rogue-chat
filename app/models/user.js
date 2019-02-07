import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr } = DS;

export default DS.Model.extend({
    modelName: 'user',
    divisionId: attr(),
    username: attr(),
    displayName: attr(),
    name: attr(),
    title: attr(),
    organizationId: attr(),
    chat: attr(),
    images: attr(),
    manager: attr(),
    email: attr(),
    externalId: attr(),
    version: attr(),
    department: attr(),
    presence: attr(),

    subscriptionCount: 0,

    presenceClass: computed('presence.presenceDefinition.systemPresence', function () {
        return this.get('presence.presenceDefinition.systemPresence')
            .toLowerCase()
            .replace(' ', '-')
            .replace('_', '-');
    })
});
