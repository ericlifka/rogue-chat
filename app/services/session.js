import { inject as service } from '@ember/service';
import Service from '@ember/service';
import RSVP from 'rsvp';

export default Service.extend({
    ajax: service(),
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
        //TODO: Don't hard code path for user me endpoint
        const user = await this.get('ajax').request('https://api.inindca.com/api/v2/users/me?expand=presence');
        //TODO: After switching all user request to public api, create a transform for presences
        user.presence = user.presence.presenceDefinition;
        return this.get('store').createRecord('user', user);
    },

    async getOrg() {
        //TODO: Don't hard code path for org me endpoint
       return this.get('ajax').request('https://api.inindca.com/api/v2/organizations/me');
    }

});
