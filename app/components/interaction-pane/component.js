import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['interaction-pane'],
    chat: service(),

    activeInteraction: reads('chat.activeInteraction')
});
