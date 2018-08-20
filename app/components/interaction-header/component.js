import { reads } from '@ember/object/computed';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['interaction-header'],

    participantCount: reads('occupants.length')
});
