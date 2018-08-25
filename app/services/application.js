import Service from '@ember/service';

export default Service.extend({
    getBaseApiUri() {
        return 'https://api.inindca.com';
    },

    getBaseUri() {
        return 'https://apps.inindca.com';
    },

    buildBaseUrl(path) {
        return [].concat(this.getBaseUri(), path).join('/');
    },

    buildApiUri(path) {
        return [].concat(this.getBaseApiUri(), path).join('/');
    }
});
