import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
    presence: service(),

    init() {
        this._super(...arguments);
        const presences = this.get('presence.presences');
        console.log('Presences: ', presences);
    }
});
