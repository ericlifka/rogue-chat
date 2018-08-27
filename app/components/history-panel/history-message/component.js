import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['history-message'],

    message: null,

    click() {
        if (this.get('selectHistoryMessage')) {
            this.selectHistoryMessage(this.get('message'));
        }
    },

    user: reads('message.user'),
    markdown: reads('message.markdown'),

    name: computed('user.name', function () {
        return this.get('user.name').toLowerCase();
    }),

    time: computed('message.time', function () {
        return this.get('message.time').format('D MMM hh:mma');
    }),
});
