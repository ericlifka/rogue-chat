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
        const systemPromise = this.get('ajax').request('https://api.inindca.com/api/v2/systempresences');
        const secondaryPromise = this.get('ajax').request('https://api.inindca.com/api/v2/presencedefinitions');

        const [systemPresences, secondaryPresences] = await Promise.all([systemPromise, secondaryPromise]);
        const primaryPresences = await this.loadPrimaryPresences(systemPresences);
        this.sortSecondaryPresences(primaryPresences, secondaryPresences.entities);
        this.set('presences', primaryPresences);
    },

    async loadPrimaryPresences(systemPresences) {
        const primaryPromises = systemPresences.map((presence) => {
            return this.get('ajax').request(`https://api.inindca.com/api/v2/presencedefinitions/${presence.id}`);
        });
        const primaryPresences = await Promise.all(primaryPromises);
        return primaryPresences.map(presence => {
            return PresenceModel.create({
                presence
            }, getOwner(this).ownerInjection());
        });
    },

    sortSecondaryPresences(primaryPresences, secondaryPresences = []) {
        primaryPresences.map(presence => {
            const secondaries = secondaryPresences.filter(({ systemPresence }) => systemPresence === presence.key);
            presence.set('secondaryPresences', secondaries);
        });
    }
});
