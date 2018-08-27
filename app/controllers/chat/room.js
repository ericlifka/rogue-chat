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
        sendMessage(message) {
            const model = this.get('model');
            this.get('chat').sendMessage(model, message);
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
