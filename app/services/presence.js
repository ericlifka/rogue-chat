import { inject as service } from '@ember/service';
import PresenceModel from '../models/presence';
import { getOwner } from '@ember/application';
import Service from '@ember/service';

export default Service.extend({
    ipc: service(),
    ajax: service(),
    store: service(),
    session: service(),
    application: service(),

    presences: null,

    init() {
        this._super(...arguments);
        this._topicGuidMap = {};
        this.set('presences', []);
        this.loadPresences();
        this.boundHandler = this.pigeonHandler.bind(this);
    },

    async loadPresences() {
        const primaryPresences = await this.loadPrimaryPresences();
        const secondaryPresences = await this.loadSecondaryPresences();
        this.sortSecondaryPresences(primaryPresences, secondaryPresences);
        this.set('presences', primaryPresences);
    },

    async loadPrimaryPresences() {
        const url = this.get('application').buildApiUri('api/v2/systempresences');
        const systemPresences = await this.get('ajax').request(url);

        const primaryPromises = systemPresences.map((presence) => {
            const url = this.get('application').buildApiUri(`api/v2/presencedefinitions/${presence.id}`);
            return this.get('ajax').request(url);
        });
        const primaryPresences = await Promise.all(primaryPromises);
        return primaryPresences.map(presence => {
            return PresenceModel.create({
                locale: "en_US",
                presence
            }, getOwner(this).ownerInjection());
        });
    },

    async loadSecondaryPresences() {
        //TODO: Secondary Presences are a paged api, were only fetching the first page for now
        const url = this.get('application').buildApiUri('api/v2/presencedefinitions');
        let secondaryPresences = await this.get('ajax').request(url);
        secondaryPresences = secondaryPresences.entities || [];
        return secondaryPresences
            .filter(({primary}) => !primary)
            .map(presence => {
                return PresenceModel.create({
                    locale: "en_US",
                    presence
                }, getOwner(this).ownerInjection());
            });
    },

    sortSecondaryPresences(primaryPresences, secondaryPresences = []) {
        primaryPresences.map(primaryPresence => {
            const secondaries = secondaryPresences.filter((secondaryPresence) => {
                return secondaryPresence.get('key') === primaryPresence.get('key');
            });
            primaryPresence.set('secondaryPresences', secondaries);
        });
    },

    subscribeToPresenceUpdates(user, priority = false) {
        user.incrementProperty('subscriptionCount', 1);
        if (user.get('subscriptionCount') > 1) {
            return;
        }

        const topic = `v2.users.${user.get('id')}.presence`;
        this._topicGuidMap[topic] = user.get('id');
        this.get('ipc').registerListener(`pigeon:${topic}`, this.boundHandler);
        this.get('ipc').sendEvent('add-pigeon-topic', { payload: { topic, priority } })
    },

    unsubscribeFromPresenceUpdates(user, priority) {
        const subscriptionCount = user.get('subscriptionCount');
        if (subscriptionCount === 0) {
            return;
        } else if (subscriptionCount > 1) {
            user.decrementProperty('subscriptionCount', 1);
            return;
        }

        const topic = `v2.users.${user.get('id')}.presence`;
        delete this._topicGuidMap[topic];
        this.get('ipc').removeListener(`pigeon:${topic}`, this.boundHandler);
        this.get('ipc').sendEvent('remove-pigeon-topic', { payload: { topic, priority } });
    },

    pigeonHandler(event, data) {
        const { topicName, eventBody } = data;
        const userGuid = this._topicGuidMap[topicName];
        const user = this.get('store').peekRecord('user', userGuid);
        if (!user) {
            return;
        }
        user.set('presence.presenceDefinition', eventBody.presenceDefinition);
    },

    async setUserPresence(presence) {
        const user = this.get('session.user');
        const url = this.get('application').buildApiUri(`api/v2/users/${user.get('id')}/presences/PURECLOUD`);
        const setPresence = await this.get('ajax').patch(url, {
            data: {
                presenceDefinition: {
                    id: presence.get('id')
                }
            }
        });
        user.set('presence', setPresence);
    }
});
