import { inject as service } from '@ember/service';
import { equal } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
    queryParams: ['rawSubject'],

    chat: service(),

    activePanel: null,

    showSearchPanel: equal('activePanel', 'search'),
    showInvitePanel: equal('activePanel', 'invite'),

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
            console.log('Entity: ', entity);
        }
    }
});
