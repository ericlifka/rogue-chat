import BaseRequestMixin from '../base-request-mixin';
import { singularize } from 'ember-inflector';
import EmberObject from '@ember/object';

export default EmberObject.extend(BaseRequestMixin, {
    value: null,
    types: null,
    url: null,
    expands: null,

    buildPayload() {
        return {
            data: {
                pageNumber: 1,
                types: this.get('types'),
                query: [
                    { value: this.get('value') }
                ],
                expand: this.get('expands')
            }
        };
    },

    normalizeResponse(store, results) {
        const entities = results.map((result) => {
            let type = singularize(result._type);
            return store.normalize(type, result).data;
        });
        return store.push({data: entities});
    }
});
