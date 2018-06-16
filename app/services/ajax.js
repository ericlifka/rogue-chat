import AjaxService from 'ember-ajax/services/ajax';
import {computed} from '@ember/object';
import { inject as service } from '@ember/service';

export default AjaxService.extend({
    session: service(),

    contentType: 'application/json; charset=utf-8',

    trustedHosts: [
        /api.(?:inindca|mypurecloud).(?:com|jp).?(?:ie|au)?/
    ],

    headers: computed('session.accessToken', function () {
        let headers = {};

        const token = this.get('session.accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    })
});
