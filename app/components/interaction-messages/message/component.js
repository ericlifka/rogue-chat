import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import Component from '@ember/component';
import Markdown from 'markdown-it';
import hljs from 'highlight.js';
import _ from 'lodash';

export default Component.extend({
    classNames: ['message'],
    markdownParser: null,
    message: null,

    init() {
        this._super(...arguments);
        hljs.configure({
            languages: ['bash', 'clojure', 'coffeescript', 'cpp', 'cs', 'css', 'elm', 'go', 'xml',
                'handlebars', 'http', 'ini', 'java', 'javascript', 'json', 'makefile', 'objectivec',
                'python', 'ruby', 'rust', 'sql', 'swift', 'typescript']
        });
        this.markdownParser = new Markdown({
            html: false,
            linkify: true,
            typographer: false,
            highlight(code, lang) {
                if (lang === 'no-highlight') {
                    return Ember.Handlebars.Utils.escapeExpression(code);
                } else if (lang) {
                    try {
                        return hljs.highlight(lang, code).value;
                    } catch (e) {
                        return Ember.Handlebars.Utils.escapeExpression(code);
                    }
                } else {
                    return hljs.highlightAuto(code).value;
                }
            }
        });
    },

    user: reads('message.user'),

    markdown: computed('message.raw', function () {
        return this.markdownParser.render(this.get('message.raw'));
    }),

    profileImageUrl: computed('user.images.[]', function () {
        const imageUrl = _.find(this.get('user.images'), {resolution: 'x96'});
        return _.get(imageUrl, 'imageUri', 'https://apps.inindca.com/static-resources/avatar-x96.png');
    })
});
