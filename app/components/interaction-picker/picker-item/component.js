import { equal, reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['picker-item'],
    tagName: 'button',
    room: null,

    isPerson: equal('room.type', 'person'),
    presenceClass: reads('room.entity.presenceClass'),

    click() {
        this.get('switchInteraction')(this.get('room'));
    }
});
