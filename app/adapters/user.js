import {inject as service} from '@ember/service';
import {isPersonJid} from '../utils/jid-helpers';
import DS from 'ember-data';
import _ from 'lodash';

const { RESTAdapter } = DS;

export default RESTAdapter.extend({
    session: service(),

    baseUrl() {
        const orgGuid = this.get('session.org.id');
        return `https://directory.us-east-1.inindca.com/directory/v1/organizations/${orgGuid}/users`;
    },

    urlForFindRecord(id) {
        if (isPersonJid(id)) {
            return `${this.baseUrl()}/bulk/jid/${id}`;
        }
        return `${this.baseUrl()}/${id}`;
    },

    async findRecord(store, type, id, snapshot) {
        const url = this.buildURL(type.modelName, id, snapshot, 'findRecord');
        const query = this.buildQuery(snapshot);

        let response = await this.ajax(url, 'GET', { data: query });
        if (_.isArray(response)) {
            response = response[0];
        }
        return {
            user: response
        };
    }
});
