import BaseRequestMixin from '../base-request-mixin';
import { inject as service } from '@ember/service';
import {singularize} from "ember-inflector/index";
import EmberObject from '@ember/object';
import RSVP from 'rsvp';

export default EmberObject.extend(BaseRequestMixin, {
    chat: service(),

    sortOrder: null,
    sortBy: null,
    pageSize: null,
    expand: null,
    types: null,
    query: null,

    buildPayload() {
        const data = {
            types: this.get('types'),
            sortOrder: this.get('sortOrder'),
            pageSize: this.get('pageSize'),
            query: this.get('query')
        };

        const expand = this.get('expand');
        if (expand) {
            data.expand = expand;
        }

        const sortBy = this.get('sortBy');
        if (sortBy) {
            data.sortBy = sortBy;
        }

        return { data };
    },

    async normalizeResponse(store, results) {
        const resultPromises = results.map(async (result) => {
            const type = singularize(result._type);
            if (type === 'message') {
                return this.normalizeMessage(result);
            }
            const normalizedRecord = store.normalize(type, result);
            return store.push(normalizedRecord);
        });

        return RSVP.Promise.all(resultPromises);
    },

    async normalizeMessage(store, result) {
        const message = await this.get('chat').setupMessageModel({
            raw: result.body,
            time: result.created,
            to: result.to.jid
        });
        const normalizedRecord = store.normalize('user', result.from);
        const user = store.push(normalizedRecord);
        message.set('user', user);

        return message;
    }
});
