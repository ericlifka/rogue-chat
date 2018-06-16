import {computed} from '@ember/object';
import Service from '@ember/service';
import Ember from 'ember';

export default Service.extend({

    connect(token) {
        const instance = new window.Realtime({
            carrierPigeon: true,
            fetchGroupsOnConnect: false,
            fetchRosterOnConnect: false,
            focusV2: true,
            jidResource: 'roguechat',
            jidRouting: true,
            offlineJoinNotifications: true,
            rawMessageIds: true,
            recentlyClosed: true,
            roomsV2: true,
            logger: Ember.Logger,
            authKey: token,
            host: 'https://apps.inindca.com'
        });

        instance.connect();

        this.set('instance', instance);
    }

});
