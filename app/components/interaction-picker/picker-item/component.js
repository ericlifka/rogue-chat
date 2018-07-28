import { reads, equal } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
    classNames: ['picker-item'],
    tagName: 'button',
    room: null,

    isPerson: equal('room.type', 'person'),
    presenceClass: computed(function () {
        return 'available';
    }),

    click() {
        this.get('setActive')(this.get('room'));
    }
});
