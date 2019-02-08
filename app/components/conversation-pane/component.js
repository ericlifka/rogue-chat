import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['conversation-pane'],

    roster: service(),
    router: service(),
    ipc: service(),

    searchTypes: null,

    init() {
        this._super(...arguments);
        this.set('searchTypes', ['users', 'groups']);
    },

    actions: {
        openRoom (rosterModel) {
            this.get('router').transitionTo('roster.room', rosterModel.get('jid'))
                .then(() => this.get('ipc').sendEvent('resize-window', { width: 1400, height: window.outerHeight}));
        },

        popoutRoom (rosterModel) {
            this.get('ipc').sendEvent('open-room', {
                jid: rosterModel.jid,
                rawSubject: rosterModel.get('rawSubject')
            })
        },

        onSearchSelection (entity) {
            this.get('router').transitionTo('roster.room', entity.get('chat.jabberId'))
                .then(() => this.get('ipc').sendEvent('resize-window', { width: 1400, height: window.outerHeight}));
        }
    }
});
