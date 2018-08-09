import Component from '@ember/component';

export default Component.extend({
    classNames: ['interaction-textarea'],

    message: null,

    keyPress(event) {
        console.log(event);
    }
});
