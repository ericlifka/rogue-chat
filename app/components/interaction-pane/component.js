import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    classNames: ['interaction-pane'],
    history: service(),

    isAtBottom: true,
    activeInteraction: null,

    loadingHistory: reads('activeInteraction.loadingHistory'),
    allHistoryLoaded: reads('activeInteraction.allHistoryLoaded'),

    actions: {
        safeScroll() {
            if (this.get('isAtBottom')) {
                scheduleOnce('afterRender', this, this.scrollToBottom);
            }
        },

        messageVisible() {
            if (this.get('allHistoryLoaded')) {
                return;
            }
            this.loadHistoryBefore();
        },

        scrollbarPositionChanged(isAtBottom) {
            this.set('isAtBottom', isAtBottom);
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
        if (this.get('loadingHistory')) {
            return null;
        }

        const activeInteraction = this.get('activeInteraction');
        return this.get('history').loadHistoryBefore(activeInteraction);
    }
});
