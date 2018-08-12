import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    classNames: ['interaction-pane'],

    activeInteraction: null,

    actions: {
        safeScroll() {
            Ember.run(() => Ember.run.scheduleOnce('afterRender', this, this.scrollToBottom));
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
