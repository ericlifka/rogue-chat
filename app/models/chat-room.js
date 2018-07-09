import { computed } from '@ember/object';
import Ember from 'ember';

export default Ember.Object.extend({
    jid: null,
    rawSubject: null,
    entity: null,
    type: null,

    subject: computed('entity', 'rawSubject', function () {
        return this.get('entity.name') || this.get('rawSubject');
    })
});
