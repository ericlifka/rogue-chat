import { inject as service } from '@ember/service';
import { reads, gt } from '@ember/object/computed';
import { throttle } from '@ember/runloop';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['history-panel', 'panel'],

    search: service(),

    roomJid: null,
    searchInput: null,
    requestBuilder: null,
    diamondRequest: null,

    init() {
        this._super(...arguments);
        const requestBuilder = this.get('search')
            .getDiamondBuilder()
            .setPageSize(15)
            .setSortBy('created')
            .setSortOrder('DESC')
            .setTypes(['messages'])
            .setExpansions(['from']);
        this.set('requestBuilder', requestBuilder);
    },

    results: reads('diamondRequest.results'),
    searching: reads('suggestRequest.inflightRequest'),
    hasResults: gt('searchResults.length', 0),

    actions: {
        onInput() {
            const searchInput = this.get('searchInput');
            if (searchInput && searchInput.length > 2) {
                throttle(this, this.sendSearchRequest, searchInput, 200, false);
            } else {
                this.set('diamondRequest', null);
            }
        },

        loadMoreResults() {
            this.get('diamondRequest').next();
        }
    },

    sendSearchRequest(searchInput) {
        const searchQuery = this.buildHistoryQuery(searchInput);
        const diamondRequest = this.get('requestBuilder')
            .setQuery(searchQuery)
            .build();
        this.set('diamondRequest', diamondRequest);
        diamondRequest.startSearch();
    },

    buildHistoryQuery(searchInput) {
        return [
            {
                type: 'EXACT',
                fields: [
                    'targetJids'
                ],
                values: [
                    this.get('roomJid')
                ]
            },
            {
                type: 'SIMPLE',
                value: searchInput,
                fields: [
                    'body'
                ]
            }
        ];
    }
});
