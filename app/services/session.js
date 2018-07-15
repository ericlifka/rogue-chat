import { inject as service } from '@ember/service';
import Service from '@ember/service';

export default Service.extend({
    ajax: service(),
    store: service(),

    accessToken: null,
    user: null,
    org: null,

    async authenticate() {
        const sessionToken = this.getAuthToken();
        this.set('accessToken', sessionToken);
        const user = await this.getUser();
        this.set('user', user);
        const org = await this.getOrg();
        this.set('org', org);

        return sessionToken;
    },

    getAuthToken() {
        const token = (
            /token=([^&]*)/.exec(window.location.href)
            || []
        )[1];

        if (!token) {
            throw new Error('NO VALID TOKEN FOUND APP CANNOT BOOTSTRAP');
        }

        return token;
    },

    async getUser() {
        //TODO: Don't hard code path for user me endpoint
        const user = await this.get('ajax').request('https://api.inindca.com/api/v2/users/me');
        return this.get('store').createRecord('user', user);
    },

    async getOrg() {
        //TODO: Don't hard code path for org me endpoint
       return this.get('ajax').request('https://api.inindca.com/api/v2/organizations/me');
    }

});
