import { inject as service } from '@ember/service';
import { markdownToHTML } from '../../../utils/markdown'
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
    classNames: ['message'],
    classNameBindings: [
        'sentByMe',
        'startOfBlock',
        'endOfBlock'
    ],
    session: service(),

    message: null,

    didRender() {
        this._super(...arguments);
        this.safeScroll();
    },

    user: reads('message.user'),
    startOfBlock: reads('message.startOfBlock'),
    endOfBlock: reads('message.endOfBlock'),
    markdown: reads('message.markdown'),

    time: computed('message.time', function () {
        return this.get('message.time').format('D MMM hh:mma');
    }),

    sentByMe: computed('message.from', 'session.user.chat.jabberId', function () {
        return this.get('message.from') === this.get('session.user.chat.jabberId');
    }),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        return _.get(imageUrl, 'imageUri', 'https://apps.inindca.com/static-resources/avatar-x96.png');
    })
});
