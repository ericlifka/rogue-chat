//import { inject as service } from '@ember/service';
//import { reads } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
    actions: {
        sendMessage(message) {
            const room = this.get('activeInteraction');
            this.get('chat').sendMessage(room, message);
        }
    }
});
