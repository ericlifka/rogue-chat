import { throttle, debounce, scheduleOnce } from '@ember/runloop';
import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import $ from 'jquery';

export default Component.extend({
    classNames: ['messages'],

    windowWidth: null,
    windowHeight: null,
    activeInteraction: null,

    messages: reads('activeInteraction.messages'),

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

        this.$().on(`scroll.${this.elementId}`, this.scrollHandler.bind(this));
        $(window).on(`resize.${this.elementId}`, this.resizeHandler.bind(this));
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
        console.log('Pre-throttle firing: ', Date.now());
        throttle(this, this._scrollHandler, 200, false);
    },

    _scrollHandler() {
        console.log('Scroll handler firing', Date.now());
        const visible = this.determineElementInView();
        if (visible) {
            scheduleOnce('afterRender', this, this.messageVisible);
        }
    },

    resizeHandler() {
        console.log('Pre-resize firing');
        throttle(this, this._resizeHandler, 500, false);
    },

    _resizeHandler() {
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
        const rect = this.getBoundingClientRect();
        const windowHeight = this.get('windowHeight');
        const windowWidth =  this.get('windowWidth');
        if (!rect) {
            return false;
        }

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= windowHeight &&
            rect.right <= windowWidth
        );
    },

    getBoundingClientRect() {
        const children = this.$().children();
        if (!children || children.length < 5) {
            return null;
        }

        return children[4].getBoundingClientRect();
    }
});
