import Service from '@ember/service';

export default Service.extend({
    getEnvironment() {
        return 'inindca.com';
    },

    getBaseApiUri() {
        const environment = this.getEnvironment();
        return `https://api.${environment}`;
    },

    getBaseUri() {
        const environment = this.getEnvironment();
        return `https://apps.${environment}`;
    },

    buildBaseUrl(path) {
        return [].concat(this.getBaseUri(), path).join('/');
    },

    buildApiUri(path) {
        return [].concat(this.getBaseApiUri(), path).join('/');
    }
});
