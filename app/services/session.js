import { inject as service } from '@ember/service';
import Service from '@ember/service';
import RSVP from 'rsvp';

export default Service.extend({
    ajax: service(),
    application: service(),
    store: service(),
    ipc: service(),

    accessToken: null,
    user: null,
    org: null,

    async authenticate() {
        const sessionToken = await this.getAuthToken();
        this.set('accessToken', sessionToken);
        const user = await this.getUser();
        this.set('user', user);
        const org = await this.getOrg();
        this.set('org', org);

        return sessionToken;
    },

    getAuthToken() {
        return new RSVP.Promise((resolve, reject) => {
            const tid = setTimeout(() => {
                reject(new Error('never received an auth token from node'));
            }, 1000);

            this.get('ipc').registerOneTimeListener('auth-token', (event, token) => {
               clearTimeout(tid);
               resolve(token);
            });

            this.get('ipc').sendEvent('request-token');
        });
    },

    async getUser() {
        const url = this.get('application').buildApiUri('api/v2/users/me?expand=presence');
        const user = await this.get('ajax').request(url);
        return this.get('store').createRecord('user', user);
    },

    async getOrg() {
        const url = this.get('application').buildApiUri('api/v2/organizations/me');
        return this.get('ajax').request(url);
    }

});
