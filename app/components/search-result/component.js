import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['search-result'],

    entity: null,

    name: reads('entity.name'),
    department: reads('entity.department'),
    title: reads('entity.title'),

    click() {
        this.get('onSelection')(this.get('entity'));
    }
});
