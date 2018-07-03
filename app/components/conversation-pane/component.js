import {inject as service} from '@ember/service';
import Component from '@ember/component';
import Ember from 'ember';

export default Component.extend({
    classNames: ['conversation-pane'],

    roster: service()
});
