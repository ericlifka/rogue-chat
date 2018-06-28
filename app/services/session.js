import {computed} from '@ember/object';
import Service from '@ember/service';

export default Service.extend({

    authenticate() {
        //TODO: this should probably call out to session or users me to validate the token as an authentication

        let token = (
            /token=([^&]*)/.exec(window.location.href)
            || []
        )[1];

        if (!token) {
            throw new Error('NO VALID TOKEN FOUND APP CANNOT BOOTSTRAP');
        }

        this.set('accessToken', token);
        return token;
    }

});
