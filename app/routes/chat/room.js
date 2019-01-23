import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    templateName: 'chat/room',

    chat: service(),

    model(params) {
        return this.get('chat').getChatRoom(params.jid);
    },

    afterModel(model) {
        this.get('chat.rooms').addObject(model);
    },

    setupController(controller, model) {
        this._super(controller, model);

        const rawSubject = controller.get('rawSubject');
        if (rawSubject) {
            model.set('rawSubject', rawSubject);
        }
    }
});
