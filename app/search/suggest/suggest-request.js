import { inject as service } from '@ember/service';
import { singularize } from 'ember-inflector';
import EmberObject from '@ember/object';

export default EmberObject.extend({
    store: service(),
    ajax: service(),

    value: null,
    pageSize: null,
    types: null,
    url: null,

    initialRequest: true,
    inflightRequest: false,
    nextPageUrl: null,
    numberOfPages: null,
    totalPages: null,
    currentPage: 0,

    init() {
        this._super(...arguments);
        this.set('results', []);
    },

    async startSearch() {
        if (!this.get('initialRequest')) {
            return new Error('Cannot send initial request again');
        }
        this.set('initialRequest', false);

        const data = {
            data: {
                pageSize: this.get('pageSize'),
                pageNumber: 1,
                types: this.get('types'),
                query: [
                    { value: this.get('value') }
                ]
            }
        };

        const url = this.get('url');
        this.set('inflightRequest', true);
        return this.get('ajax').post(url, data)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('currentPage', response.pageNumber);

                const store = this.get('store');
                const entities = normalizeSuggestResponse(store, response.results);
                this.get('results').pushObjects(entities);
            })
            .finally(() => this.set('inflightRequest', false));
    },

    async next() {
        const nextPageUrl = this.get('nextPageUrl');
        if (!this.get('nextPageUrl')) {
            throw new Error('No valid next page to iterate to');
        }

        this.set('inflightRequest', true);
        return this.get('ajax').request(nextPageUrl)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('currentPage', response.pageNumber);

                const store = this.get('store');
                const entities = normalizeSuggestResponse(store, response.results);
                this.get('results').pushObjects(entities);
            })
            .finally(() => this.set('inflightRequest', false));
    }
});

const normalizeSuggestResponse = function (store, results) {
    const entities = results.map((result) => {
        let type = singularize(result._type);
        return store.normalize(type, result).data;
    });
    return store.push({data: entities});
};
