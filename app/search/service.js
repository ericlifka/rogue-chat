import DiamondBuilder from './diamond/diamond-builder';
import SuggestBuilder from './suggest/suggest-builder';
import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import Service from '@ember/service';

export default Service.extend({
    baseUrl: computed(function () {
        return 'https://api.inindca.com/api/v2/search';
    }),

    suggestUrl: computed(function () {
        return `${this.get('baseUrl')}/suggest?profile=false`;
    }),

    getSuggestBuilder() {
        return SuggestBuilder.create({suggestUrl: this.get('suggestUrl')}, getOwner(this).ownerInjection());
    },

    getDiamondBuilder() {
        return DiamondBuilder.create({diamondUrl: this.get('baseUrl')}, getOwner(this).ownerInjection());
    }
});
