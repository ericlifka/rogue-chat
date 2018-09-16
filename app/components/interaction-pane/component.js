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

        messageVisible($message) {
            if (this.get('allHistoryLoaded') || this.get('loadingHistory')) {
                return;
            }

            const previousPosition = $message.getBoundingClientRect().top;
            this.loadHistoryBefore()
                .then(() => this.updateScrollbarPosition($message, previousPosition));
        },

        scrollbarPositionChanged(isAtBottom) {
            this.set('isAtBottom', isAtBottom);
        }
    },

    scrollToBottom() {
        const $interactionPane = this.$('.messages');
        if (!$interactionPane) {
            return Ember.Logger.warn('scrollToBottom called before DOM insertion');
        }

        const scrollHeight = $interactionPane.prop('scrollHeight');
        $interactionPane.scrollTop(scrollHeight);
    },

    loadHistoryBefore() {
        const activeInteraction = this.get('activeInteraction');
        return this.get('history').loadHistoryBefore(activeInteraction);
    },

    updateScrollbarPosition($message, previousDistanceToTop) {
        scheduleOnce('afterRender', this, () => {
            const $messageContainer = this.$('.messages');
            const currentDistanceToTop = $message.getBoundingClientRect().top;
            const distanceDifference = currentDistanceToTop - previousDistanceToTop;
            const scrollPosition = $messageContainer.scrollTop();
            const newScrollPosition = Math.abs(scrollPosition - distanceDifference);

            $messageContainer.animate({
                scrollTop: newScrollPosition
            }, 0);
        });
    }
});
