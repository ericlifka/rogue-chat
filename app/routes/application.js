import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
    session: service(),
    roster: service(),
    ipc: service(),

    beforeModel() {
        const session = this.get('session');
        const roster = this.get('roster');
        const ipc = this.get('ipc');

        return Promise.resolve()
            .then(() => session.authenticate())
            .then(() => roster.bindToEvents())
            .then(() => ipc.notifyReady());

    }
});
