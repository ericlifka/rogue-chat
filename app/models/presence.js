import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
    locale: null,
    presence: null,
    secondaryPresences: null,

    id: reads('presence.id'),
    key: reads('presence.systemPresence'),
    primary: reads('presence.primary'),
    deactivated: computed.reads('presence.deactivated'),

    hasSecondaryPresences: computed('primary', 'secondaryPresences.[]', function () {
        return this.get('primary') &&  this.get('secondaryPresences.length') > 0;
    }),

    secondaryPresencesNames: computed('secondaryPresences.[]', function () {
        if (!this.get('hasSecondaryPresences')) {
            return null;
        }
        return this.get('secondaryPresences')
            .filter(presence => !presence.get('deactivated'))
            .map(presence => ({id: presence.get('id'), name: presence.get('label')}));
    }),

    label: computed('presence.languageLabels', 'locale', function () {
        return this.get(`presence.languageLabels.${this.get('locale')}`);
    })
});
