import AjaxService from 'ember-ajax/services/ajax';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default AjaxService.extend({
    session: service(),

    contentType: 'application/json; charset=utf-8',
    trustedHosts: null,

    init() {
        this._super(...arguments);
        this.trustedHosts = [
            /api.(?:inindca|mypurecloud).(?:com|jp).?(?:ie|au)?/
        ];
    },

    headers: computed('session.accessToken', function () {
        let headers = {};

        const token = this.get('session.accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    })
});
