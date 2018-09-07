import { inject as service } from '@ember/service';
import { run, scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import Dropzone from 'dropzone';

const dropzonePreviewTemplate = `
<div class="dz-preview dz-file-preview">
    <div class="dz-details">
        <img data-dz-thumbnail />
    </div>
    <button data-dz-remove class="file-delete">
        <i class="material-icons">close</i>
    </button>
</div>
`;

export default Component.extend({
    classNames: ['interaction-textarea'],

    application: service(),
    session: service(),

    showEmojiPicker: false,
    pendingMessage: null,
    dropzone: null,
    roomJid: null,
    message: null,

    dropzoneUrl: computed('roomJid', function () {
        return `https://realtime.inindca.com/files/${this.get('roomJid')}`;
    }),

    actions: {
        selectEmoji(emoji) {
            this.set('showEmojiPicker', false);
            this.set('message', `${this.get('message')} ${emoji}`);
        },

        togglePicker() {
            scheduleOnce('afterRender', this, this.toggleProperty, 'showEmojiPicker');
        },

        handleMentionedUser(entity) {
            this.get('mentionedUsers').pushObject(entity);
        }
    },

    init() {
        this._super(...arguments);
        this.set('mentionedUsers', []);
    },

    didInsertElement() {
        this._super(...arguments);
        scheduleOnce('afterRender', this, this.setupDropzone);
    },

    willDestroyElement() {
        this._super(...arguments);
        this.destroyDropzone();
    },

    didUpdateAttrs() {
        this._super(...arguments);
        scheduleOnce('afterRender', this, this.updateDropzone);
        scheduleOnce('afterRender', this, this.updateTextarea);
    },

    keyPress(event) {
        const code = event.keyCode;
        if (code === 13 && !event.shiftKey) {
            event.preventDefault();
            this.propagateMessage(this.get('message') || '');
        }
    },

    propagateMessage(message) {
        const dropzone = this.get('dropzone');
        const hasFiles = dropzone.files.length > 0;
        const hasText = message.length > 0;

        message = message.trim();
        if (hasFiles) {
            if (hasText) {
                this.set('pendingMessage', {
                    roomJid: this.get('roomJid'),
                    message
                });
            }
            dropzone.processQueue();
        } else if (hasText) {
            this.sendMessage(message);
        }
        this.set('message', null);
    },

    setupDropzone() {
        const dropzone = new Dropzone('.chat', {
            headers: {
                Authorization: `bearer ${this.get('session.accessToken')}`
            },
            previewTemplate: dropzonePreviewTemplate,
            previewsContainer: '.preview-container',
            url: this.get('dropzoneUrl'),
            createImageThumbnails: true,
            autoProcessQueue: false,
            thumbnailHeight: 40,
            thumbnailWidth: 40,
            clickable: '.file',
            maxFilesize: 50,
            maxFiles: 1
        });

        dropzone.on('addedfile', function () {
            if (this.files[1]) {
                this.removeFile(this.files[0]);
            }
        });

        // TODO: Show errors on the room when files fail to upload
        dropzone.on('error', function () {
            dropzone.removeAllFiles();
        });

        dropzone.on('complete', () => {
            const pendingMessage = this.get('pendingMessage');
            if (pendingMessage) {
                const { message, roomJid } = pendingMessage;

                this.set('pendingMessage', null);
                this.sendMessageAfterFileUpload(message, roomJid);
            }
            dropzone.removeAllFiles();
        });

        this.set('dropzone', dropzone);
    },

    updateDropzone() {
        const dropzone = this.get('dropzone');
        if (dropzone) {
            if (dropzone.getUploadingFiles().length > 0) {
                this.removeDropzonePreview();
            } else {
                dropzone.removeAllFiles();
            }
            dropzone.options.url = this.get('dropzoneUrl');
        }
    },

    // TODO: Instead of clearing room state on switch, store it for when the user comes back
    updateTextarea() {
        this.set('message', '');
        this.set('mentionedUsers', []);
    },

    removeDropzonePreview() {
        const $preview = this.$('.dz-preview');
        if ($preview) {
            $preview.remove();
        }
    },

    destroyDropzone() {
        const dropzone = this.get('dropzone');
        if (dropzone) {
            dropzone.destroy();
        }
    }
});
