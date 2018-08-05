import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['messages'],
    activeInteraction: null,

    messages: reads('activeInteraction.messages')
});
