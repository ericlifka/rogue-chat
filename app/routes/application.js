import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
    session: service(),
    realtime: service(),

    beforeModel() {
        const session = this.get('session');
        const realtime = this.get('realtime');

        return Promise.resolve()
            .then(() => session.authenticate())
            .then(token => realtime.connect(token));
    }
});
