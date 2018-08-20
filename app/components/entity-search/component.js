import { reads, lt, gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    classNames: ['entity-search'],
    search: service(),

    searchInput: null,
    requestBuilder: null,
    suggestRequest: null,

    init() {
        this._super(...arguments);
        const requestBuilder = this.get('search')
            .getSuggestBuilder()
            .setExpansions(['presence'])
            .setTypes(['users']);
        this.set('requestBuilder', requestBuilder);
    },

    searchResults: reads('suggestRequest.results'),
    searching: reads('suggestRequest.inflightRequest'),
    hasResults: gt('searchResults.length', 0),
    moreResults: computed('suggestRequest.currentPage', 'suggestRequest.totalPages', function () {
        return this.get('suggestRequest.currentPage') < this.get('suggestRequest.totalPages');
    }),

    actions: {
        onInput() {
            const searchInput = this.get('searchInput');
            if (searchInput && searchInput.length > 2) {
                Ember.run.throttle(this, this.sendSearchRequest, searchInput, 200, false);
            } else {
                this.set('suggestRequest', null);
            }
        },

        loadMoreResults() {
            this.get('suggestRequest').next();
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
