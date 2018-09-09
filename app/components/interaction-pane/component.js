import Component from '@ember/component';
import { run, scheduleOnce } from '@ember/runloop';
import Ember from 'ember';

export default Component.extend({
    classNames: ['interaction-pane'],

    activeInteraction: null,

    actions: {
        safeScroll() {
            run(() => scheduleOnce('afterRender', this, this.scrollToBottom));
        },

        messageVisible() {
            console.log('Message Visible');
        }
    },

    scrollToBottom() {
        const $messagePane = this.$().children('.messages');
        if (!$messagePane) {
            return Ember.Logger.warn('scrollToBottom called before DOM insertion');
        }

        const scrollHeight = $messagePane.prop('scrollHeight');
        $messagePane.scrollTop(scrollHeight);
    }
});
