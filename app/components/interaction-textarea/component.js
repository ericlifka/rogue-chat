import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';
import Dropzone from 'dropzone';
import _ from 'lodash';

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

        const { parsedMessage, children } = this.parseTextForMentions(message);
        const options = {
          children
        };

        if (hasFiles) {
            if (hasText) {
                this.set('pendingMessage', {
                    roomJid: this.get('roomJid'),
                    message: parsedMessage,
                    options
                });
            }
            dropzone.processQueue();
        } else if (hasText) {
            this.sendMessage(parsedMessage, options);
        }

        this.set('message', null);
        this.set('mentionedUsers', []);
    },

    parseTextForMentions(message) {
        const mentionedUsers = this.get('mentionedUsers');
        if (mentionedUsers.length < 1) {
            return { parsedMessage };
        }

        const parsedMessage = mentionedUsers.reduce((message, entity) => {
            const name = entity.get('name');
            const mention = `[@${name}]`;
            const safeMention = _.escapeRegExp(mention);
            const regexp = new RegExp(`${safeMention}(?![(]#)`, 'g');

            let match = regexp.exec(message);
            while(match) {
                const preMention = message.substring(0, match.index);
                const inBlock = this.isMentionInsideBlock(preMention, /`/g) || this.isMentionInsideBlock(preMention, /```/g);

                if (!inBlock) {
                    // Search results don't provide the external id so we must make it from the jid
                    const externalId = entity.get('chat.jabberId').split('@')[0];
                    const replace = `${mention}(#/person/${externalId})`;
                    message = message.replace(regexp, replace);
                }
                match = regexp.exec(message);
            }

            return message;
        }, message);

        const children = this.buildXMPPReference(parsedMessage, mentionedUsers);

        return { parsedMessage, children };
    },

    buildXMPPReference(message, mentionedUsers) {
        return mentionedUsers.reduce((children, entity) => {
            const name = entity.get('name');
            const mention = `[@${name}]`;
            const safeMention = _.escapeRegExp(mention);
            const regexp = new RegExp(`${safeMention}\\(#/person/([a-z\\d]{24})\\)`, 'g');

            let result = regexp.exec(message);
            while (result) {
                const end = result.index + result[0].length;
                const jid = entity.get('chat.jabberId');
                const reference = {
                    name: 'reference',
                    attributes: {
                        xmlns: 'urn:xmpp:reference:0',
                        type: 'mention',
                        begin: result.index,
                        uri: jid,
                        end,
                    }
                };
                children.push(reference);

                result = regexp.exec(message);
            }

            return children;
        }, []);
    },

    isMentionInsideBlock(message, tick) {
        return (message.match(tick) || []).length % 2 !== 0;
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
                const { message, options, roomJid } = pendingMessage;

                this.set('pendingMessage', null);
                this.sendMessageAfterFileUpload(message, options, roomJid);
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
        this.set('message', null);
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
