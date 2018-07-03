import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
    classNames: ['conversation-item'],

    chatRoom: null,

    isPerson: computed.equal('chatRoom.type', 'person')
});
