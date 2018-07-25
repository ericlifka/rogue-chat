import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['conversation-pane'],

    roster: service(),
    ipc: service(),

    actions: {
        openRoom(rosterModel) {
            this.get('ipc').sendEvent('open-room', {
                jid: rosterModel.jid,
                rawSubject: rosterModel.get('rawSubject')
            })
        }
    }
});
