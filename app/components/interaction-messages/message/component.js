import { markdownToHTML } from '../../../utils/markdown'
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import _ from 'lodash';

export default Component.extend({
    classNames: ['message'],
    markdownParser: null,
    message: null,

    user: reads('message.user'),

    markdown: computed('message.raw', function () {
        return markdownToHTML(this.get('message.raw'));
    }),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        return _.get(imageUrl, 'imageUri', 'https://apps.inindca.com/static-resources/avatar-x96.png');
    })
});
