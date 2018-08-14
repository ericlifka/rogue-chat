import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
    queryParams: ['rawSubject'],

    chat: service(),

    actions: {
        sendMessage(message) {
            const model = this.get('model');
            this.get('chat').sendMessage(model, message);
        }
    }
});
