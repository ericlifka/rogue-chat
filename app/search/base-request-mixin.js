import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
    store: service(),
    ajax: service(),

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

    buildPayload() {
       throw new Error('all requests must implement build payload');
    },

    normalizeResponse() {
        throw new Error('all request must have response normalizer');
    },

    async startSearch() {
        if (!this.get('initialRequest')) {
            return new Error('Cannot send initial request again');
        }
        this.set('initialRequest', false);

        const data = this.buildPayload();

        const url = this.get('url');
        this.set('inflightRequest', true);
        return this.get('ajax').post(url, data)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('currentPage', response.pageNumber);
                this.set('totalPages', response.pageCount);

                const store = this.get('store');
                const entities = this.normalizeResponse(store, response.results);
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

        const url = `https://api.inindca.com${nextPageUrl}`;
        return this.get('ajax').request(url)
            .then((response) => {
                this.set('nextPageUrl', response.nextPage);
                this.set('currentPage', response.pageNumber);

                const store = this.get('store');
                const entities = this.normalizeResponse(store, response.results);
                this.get('results').pushObjects(entities);
            })
            .finally(() => this.set('inflightRequest', false));
    }
});
