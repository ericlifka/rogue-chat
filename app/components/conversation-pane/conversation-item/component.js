import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
    classNames: ['conversation-item'],

    rosterModel: null,

    isPerson: computed.equal('rosterModel.type', 'person'),

    click() {
        const rosterModel = this.get('rosterModel');
        this.get('openRoom')(rosterModel);
    }
});
