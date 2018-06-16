import Ember from 'ember';
const {
    Route
} = Ember;

export default Route.extend({
    builtinClientId: '@@CLIENT_ID',

    beforeModel() {
        const CLIENT_ID = this.get('builtinClientId');
        console.log(`CLIENT_ID ${CLIENT_ID}`);

        const platformClient = window.require('platformClient');
        let client = platformClient.ApiClient.instance;
        client.setEnvironment('inindca.com');
        return client.loginImplicitGrant(CLIENT_ID, `${window.location.origin}${window.location.pathname}`)
            .then(function(data) {
                console.log(data);
                // Do authenticated things
            })
            .catch(function(err) {
                // Handle failure response
                console.log(err);
            });
    }
});
