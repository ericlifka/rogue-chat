import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default EmberObject.extend({
    locale: null,
    presence: null,
    secondaryPresences: null,

    id: reads('presence.id'),
    key: reads('presence.systemPresence'),
    primary: reads('presence.primary'),
    deactivated: reads('presence.deactivated'),

    hasSecondaryPresences: computed('primary', 'secondaryPresences.[]', function () {
        return this.get('primary') &&  this.get('activeSecondaryPresences.length') > 0;
    }),

    activeSecondaryPresences: computed('secondaryPresences.[]', function () {
        if (!this.get('secondaryPresences')) {
            return null;
        }
        return this.get('secondaryPresences').filter(presence => !presence.get('deactivated'));
    }),

    label: computed('presence.languageLabels', 'locale', function () {
        return this.get(`presence.languageLabels.${this.get('locale')}`);
    })
});
