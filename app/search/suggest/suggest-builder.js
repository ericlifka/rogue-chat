import EmberObject, { computed } from '@ember/object';
import SuggestRequest from './suggest-request';
import { getOwner } from '@ember/application';
import _ from 'lodash';

const SEARCH_TYPES = [
    'users',
    'groups' ,
    'locations'
];

const EXPANSIONS = [
    'routingStatus',
    'presence',
    'conversationSummary',
    'outOfOffice',
    'geolocation',
    'station',
    'authorization',
    'profileSkills',
    'locations',
    'groups'
];

export default EmberObject.extend({
    suggestUrl: null,
    types: null,
    pageSize: null,
    searchValue: null,
    expansions: null,

    setTypes(types) {
        if (!_.isArray(types)) {
            throw new Error('types must be in the form of an array');
        }

        const validTypes = _.intersection(SEARCH_TYPES, types);
        if (validTypes.length !== types.length) {
            const invalidTypes = _.difference(validTypes, types);
            throw new Error(`the following are not valid search types: ${invalidTypes}`);
        }

        this.set('types', types);
        return this;
    },

    setSearchValue(searchValue) {
        if (!searchValue) {
            throw new Error('must supply a search value');
        }

        if (searchValue.trim().length <= 1) {
            throw new Error('suggest request must be at least two characters');
        }

        this.set('searchValue', searchValue);
        return this;
    },

    setExpansions(expansions) {
        if (!_.isArray(expansions)) {
            throw new Error('expansions must be in the form of an array');
        }

        const validExpansions = _.intersection(EXPANSIONS, expansions);
        if (validExpansions.length !== expansions.length) {
            const invalidExpansions = _.difference(validExpansions, expansions);
            throw new Error(`the following are not valid search types: ${invalidExpansions}`);
        }

        this.set('expansions', expansions);
        return this;
    },

    build() {
        const types = this.get('types') || SEARCH_TYPES;
        const url = this.get('suggestUrl');
        const value = this.get('searchValue');
        const expands = this.get('expansions') || [];

        if (!value) {
            throw new Error('attempted to build a suggest request without supplying a search value');
        }

        return SuggestRequest.create({value, types, url, expands}, getOwner(this).ownerInjection());
    },
});
