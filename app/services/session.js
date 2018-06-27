import {computed} from '@ember/object';
import Service from '@ember/service';

export default Service.extend({

    clientId: '@@CLIENT_ID',
    redirectUri: computed(() => `${window.location.origin}${window.location.pathname}`),

    authenticate() {
        // const platformClient = window.require('platformClient');
        // platformClient.ApiClient.instance.setEnvironment('inindca.com');
        //
        // return platformClient.ApiClient.instance
        //     .loginImplicitGrant(this.get('clientId'), this.get('redirectUri'))
        //     .then(({accessToken}) =>
        //         this.set('accessToken', accessToken));
    }

});
