import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import $ from 'jquery';
import _ from 'lodash';

export default Component.extend({
    classNames: ['messages'],

    messages: null,
    windowWidth: null,
    windowHeight: null,
    activeInteraction: null,

    message: computed('messages.length', function () {
        const children = this.$().children();
        if (!children || children.length < 5) {
            return null;
        }

        return children[4];
    }),

    didInsertElement() {
        this._super(...arguments);
        this.bindEvents();
    },

    willDestroyElement() {
        this._super(...arguments);
        this.teardown();
    },

    bindEvents() {
        if (!this.$()) {
            return;
        }

        this.$().on(`scroll.${this.elementId}`, _.throttle(this.scrollHandler.bind(this), 200, {trailing: true}));
        $(window).on(`resize.${this.elementId}`, _.throttle(this.resizeHandler.bind(this), 200, {trailing: true}));
        this.set('windowHeight', window.innerHeight || document.documentElement.clientHeight);
        this.set('windowWidth', window.innerWidth || document.documentElement.clientWidth);
    },

    teardown() {
        if (!this.$()) {
            return;
        }

        this.$().off(`.${this.elementId}`);
        $(window).off(`.${this.elementId}`);
    },

    scrollHandler() {
        window.requestAnimationFrame(() => {
            const visible = this.determineElementInView();
            if (visible) {
                scheduleOnce('afterRender', this, this.messageVisible);
            }
        });
    },

    resizeHandler() {
        window.requestAnimationFrame(() => {
            this.updateWindowSize();
            const visible = this.determineElementInView();
            if (visible) {
                scheduleOnce('afterRender', this, this.messageVisible);
            }
        });
    },

    updateWindowSize() {
        this.set('windowHeight', window.innerHeight || document.documentElement.clientHeight);
        this.set('windowWidth', window.innerWidth || document.documentElement.clientWidth);
    },

    determineElementInView () {
        const rect = this.get('message').getBoundingClientRect();
        console.log('Rect: ', rect);
        if (!rect) {
            return false;
        }

        const windowHeight = this.get('windowHeight');
        const windowWidth =  this.get('windowWidth');

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= windowHeight &&
            rect.right <= windowWidth
        );
    },
});
