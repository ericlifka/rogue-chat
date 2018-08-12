import Component from '@ember/component';

export default Component.extend({
    classNames: ['interaction-textarea'],

    message: null,

    keyPress(event) {
        const code = event.keyCode;
        if (code === 13 && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage(this.get('message'));
            this.set('message', null);
        }
    }
});
