import DS from 'ember-data';
const { attr } = DS;

export default DS.Model.extend({
    groupType: attr(),
    name: attr(),
    organizationId: attr(),
    memberCount: attr(),
    state: attr(),
    version: attr(),
    externalId: attr(),
    dateModified: attr()
});
