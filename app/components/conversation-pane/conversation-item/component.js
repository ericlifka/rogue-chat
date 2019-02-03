import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    classNames: ['conversation-item'],

    rosterModel: null,

    isPerson: computed.equal('rosterModel.type', 'person'),
    presenceClass: reads('rosterModel.entity.presenceClass'),

    click (event) {
        const rosterModel = this.get('rosterModel');
        if (event.shiftKey) {
            return this.get('popoutRoom')(rosterModel);
        }
        return this.get('openRoom')(rosterModel);
    }
});
