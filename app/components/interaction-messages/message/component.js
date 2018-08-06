import { inject as service } from '@ember/service';
import { markdownToHTML } from '../../../utils/markdown'
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
    classNames: ['message'],
    classNameBindings: [
        'sentByMe'
    ],
    session: service(),

    message: null,

    user: reads('message.user'),

    time: computed('message.time', function () {
        return this.get('message.time').format('d MMMM hh:mm A');
    }),

    sentByMe: computed('message.from', 'session.user.chat.jabberId', function () {
        return this.get('message.from') === this.get('session.user.chat.jabberId');
    }),

    markdown: computed('message.raw', function () {
        return markdownToHTML(this.get('message.raw'));
    }),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        return _.get(imageUrl, 'imageUri', 'https://apps.inindca.com/static-resources/avatar-x96.png');
    })
});
