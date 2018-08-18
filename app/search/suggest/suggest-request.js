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
    nextPageUrl: null,
    previousPageUrl: null,
    numberOfPages: null,
    totalPages: null,
    currentPage: 0,

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
        return this.get('ajax').post(url, data)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('previousPageUrl', response.previousPage);
                this.set('currentPage', response.pageNumber);

                const store = this.get('store');
                return normalizeSuggestResponse(store, response.results);
            });
    },

    async next() {
        const nextPageUrl = this.get('nextPageUrl');
        if (!this.get('nextPageUrl')) {
            throw new Error('No valid next page to iterate to');
        }

        return this.get('ajax').request(nextPageUrl)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('previousPageUrl', response.previousPage);
                this.set('currentPage', response.pageNumber);

                const store = this.get('store');
                return normalizeSuggestResponse(store, response.results);
            });
    },

    async previous() {
        const previousPageUrl = this.get('previousPageUrl');
        if (!previousPageUrl) {
            throw new Error('No valid previous page to iterate to');
        }

        return this.get('ajax').request(previousPageUrl)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('previousPageUrl', response.previousPage);
                this.set('currentPage', response.pageNumber);

                const store = this.get('store');
                return normalizeSuggestResponse(store, response.results);
            })
    }
});

const normalizeSuggestResponse = function (store, results) {
    const entities = results.map((result) => {
        let type = singularize(result._type);
        return store.normalize(type, result).data;
    });
    return store.push({data: entities});
};
