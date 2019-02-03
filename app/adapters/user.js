import {inject as service} from '@ember/service';
import {isPersonJid} from '../utils/jid-helpers';
import {computed} from '@ember/object';
import DS from 'ember-data';
import _ from 'lodash';

const { RESTAdapter } = DS;

export default RESTAdapter.extend({
    session: service(),

    headers: computed('session.accessToken', function () {
        let headers = {};

        const token = this.get('session.accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }),

    baseUrl() {
        return `https://api.inindca.com/api/v2/users`;
    },

    urlForFindRecord(id) {
        if (isPersonJid(id)) {
            return `${this.baseUrl()}?jid=${id}`;
        }
        return `${this.baseUrl()}/${id}`;
    },

    async findRecord(store, type, id, snapshot) {
        const url = this.buildURL(type.modelName, id, snapshot, 'findRecord');
        const query = this.buildQuery(snapshot);

        let response = await this.ajax(url, 'GET', { data: query });
        response = _.get(response, 'entities.0');

        return {
            user: response
        };
    }
});
