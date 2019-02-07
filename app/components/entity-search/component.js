import { reads, gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { throttle } from '@ember/runloop';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['entity-search'],
    search: service(),

    searchInput: null,
    requestBuilder: null,
    suggestRequest: null,
    types: null,

    init() {
        this._super(...arguments);
        const types = this.get('types') || ['users'];
        const requestBuilder = this.get('search')
            .getSuggestBuilder()
            .setExpansions(['presence'])
            .setTypes(types);
        this.set('requestBuilder', requestBuilder);
    },

    searchResults: reads('suggestRequest.results'),
    searching: reads('suggestRequest.inflightRequest'),
    hasResults: gt('searchResults.length', 0),
    moreResults: computed('suggestRequest.{currentPage,totalPages}', function () {
        return this.get('suggestRequest.currentPage') < this.get('suggestRequest.totalPages');
    }),

    actions: {
        onInput() {
            const searchInput = this.get('searchInput');
            if (searchInput && searchInput.length > 2) {
                throttle(this, this.sendSearchRequest, searchInput, 200, false);
            } else {
                this.set('suggestRequest', null);
            }
        },

        loadMoreResults() {
            this.get('suggestRequest').next();
        },

        onSelection(entity) {
            this.onSelection(entity);
            this.set('searchInput', null);
            this.set('suggestRequest', null);
        }
    },

    sendSearchRequest(searchInput) {
        const suggestRequest = this.get('requestBuilder')
            .setSearchValue(searchInput)
            .build();
        this.set('suggestRequest', suggestRequest);
        suggestRequest.startSearch();
    }
});
