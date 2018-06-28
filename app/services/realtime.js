import {computed} from '@ember/object';
import Service from '@ember/service';
import Ember from 'ember';

const realtimeConfig = authKey => ({
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

    authKey,
    // host: 'https://apps.inindca.com'
});

export default Service.extend({

    connect(token) {
        // return new Promise(resolve => {
        //     const instance = new window.Realtime(realtimeConfig(token));

        //     this.set('realtime', instance);
        //     this.bindEvents(instance);

        //     instance.on('connect', resolve);
        //     instance.connect();
        // });


    },

    bindEvents(realtime) {

    }
});
