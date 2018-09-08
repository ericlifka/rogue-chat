import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
    queryParams: ['rawSubject'],

    chat: service(),

    model: null,
    activePanel: null,

    showSearchPanel: equal('activePanel', 'search'),
    showParticipantPanel: equal('activePanel', 'participant'),

    actions: {
        sendMessage(message, options) {
            const model = this.get('model');
            return this.get('chat').sendMessage(model, message, options);
        },

        sendMessageAfterFileUpload(message, options, roomJid) {
            let model = this.get('model');
            if (model.get('jid') !== roomJid) {
                model = this.get('chat').getChatRoom(roomJid);
            }
            return this.get('chat').sendMessage(model, message, options);
        },

        togglePanel(panel) {
            if (this.get('activePanel') === panel) {
                return this.set('activePanel', null);
            }
            this.set('activePanel', panel);
        },

        onSelection(entity) {
            this.get('chat').inviteToRoom(this.get('model'), entity.get('chat.jabberId'));
        }
    }
});
