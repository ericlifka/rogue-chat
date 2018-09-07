import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    tagName: 'button',
    classNames: ['mention-item'],
    classNameBindings: ['isHighlightedResult:highlight'],

    index: null,
    entity: null,
    isHighlightedResult: null,

    name: reads('entity.name'),
    title: reads('entity.title'),

    mouseEnter() {
        this.updateHighlightedIndex(this.get('index'));
    },

    click() {
        this.selectResult(this.get('entity'));
    }

});
