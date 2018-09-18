import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
    classNames: ['message'],
    classNameBindings: [
        'sentByMe',
        'sentByThem',
        'startOfBlock',
        'endOfBlock'
    ],
    session: service(),
    application: service(),

    message: null,

    didRender() {
        this._super(...arguments);
        this.safeScroll();
    },

    user: reads('message.user'),
    links: reads('message.links'),
    startOfBlock: reads('message.startOfBlock'),
    endOfBlock: reads('message.endOfBlock'),
    markdown: reads('message.markdown'),
    hasMediaItems: reads('message.hasMediaItems'),
    sentByThem: computed.not('sentByMe'),

    name: computed('user.name', function () {
        return this.get('user.name').toLowerCase();
    }),

    time: computed('message.time', function () {
        return this.get('message.time').format('D MMM hh:mma');
    }),

    sentByMe: computed('message.from', 'session.user.chat.jabberId', function () {
        return this.get('message.from') === this.get('session.user.chat.jabberId');
    }),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        const fallbackUrl = this.get('application').buildBaseUrl('static-resources/avatar-x96.png');
        return _.get(imageUrl, 'imageUri', fallbackUrl);
    }),

    showProfilePicture: computed('sentByMe', 'startOfBlock', function () {
        return !this.get('sentByMe') && this.get('startOfBlock');
    })
});
