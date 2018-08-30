import Component from '@ember/component';

export default Component.extend({
    classNames: ['interaction-textarea'],

    message: null,
    showEmojiPicker: false,

    keyPress(event) {
        const code = event.keyCode;
        if (code === 13 && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage(this.get('message'));
            this.set('message', null);
        }
    },

    actions: {
        selectEmoji(emoji) {
            this.set('showEmojiPicker', false);
            this.set('message', `${this.get('message')} ${emoji}`);
        },

        togglePicker() {
            this.toggleProperty("showEmojiPicker");
        }
    }
});
