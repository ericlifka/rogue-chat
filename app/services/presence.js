import { inject as service } from '@ember/service';
import PresenceModel from '../models/presence';
import { getOwner } from '@ember/application';
import Service from '@ember/service';

//TODO: Don't hard code path for requests, seriously stop doing this...
export default Service.extend({
    ajax: service(),

    presences: null,

    init() {
        this._super(...arguments);
        this.loadPresences();
    },

    async loadPresences() {
        const primaryPresences = await this.loadPrimaryPresences();
        const secondaryPresences = await this.loadSecondaryPresences();
        this.sortSecondaryPresences(primaryPresences, secondaryPresences);
        this.set('presences', primaryPresences);
    },

    async loadPrimaryPresences() {
        const systemPresences = await this.get('ajax').request('https://api.inindca.com/api/v2/systempresences');

        const primaryPromises = systemPresences.map((presence) => {
            return this.get('ajax').request(`https://api.inindca.com/api/v2/presencedefinitions/${presence.id}`);
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
        let secondaryPresences = await this.get('ajax').request('https://api.inindca.com/api/v2/presencedefinitions');
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
    }
});
