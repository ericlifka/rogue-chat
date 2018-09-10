import { run, scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    classNames: ['interaction-pane'],
    history: service(),

    activeInteraction: null,

    actions: {
        safeScroll() {
            run(() => scheduleOnce('afterRender', this, this.scrollToBottom));
        },

        messageVisible() {
            this.loadHistoryBefore();
        }
    },

    scrollToBottom() {
        const $messagePane = this.$().children('.messages');
        if (!$messagePane) {
            return Ember.Logger.warn('scrollToBottom called before DOM insertion');
        }

        const scrollHeight = $messagePane.prop('scrollHeight');
        $messagePane.scrollTop(scrollHeight);
    },

    loadHistoryBefore() {
        const activeInteraction = this.get('activeInteraction');
        if (activeInteraction.get('loadingHistory')) {
            return Promise.resolve();
        }
        return this.get('history').loadHistoryBefore(activeInteraction);
    }
});
