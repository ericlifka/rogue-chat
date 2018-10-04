import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    chat: service(),
    ipc: service(),

    beforeModel() {
        const chat = this.get('chat');
        const ipc = this.get('ipc');

        return Promise.resolve()
            .then(() => chat.bindToEvents())
            .then(() => ipc.sendEvent('window-ready', true));
    }
});
