import { computed } from '@ember/object';
import EmberObject from '@ember/object';

export default EmberObject.extend({
    jid: null,
    rawSubject: null,
    entity: null,
    type: null,

    subject: computed('entity', 'rawSubject', function () {
        return this.get('entity.name') || this.get('rawSubject');
    })
});
