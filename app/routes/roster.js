import {inject as service} from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
    session: service(),
    roster: service(),
    ipc: service(),

    beforeModel() {
        const roster = this.get('roster');
        const ipc = this.get('ipc');

        return Promise.resolve()
            .then(() => roster.bindToEvents())
            .then(() => ipc.sendEvent('window-ready', true));
    }
});
