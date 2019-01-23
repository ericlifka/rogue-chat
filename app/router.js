import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
    this.route('roster', { path: '/' }, function () {
        this.route('room', { path: ':jid' });
    });
    this.route('chat', function () {
        this.route('room', { path: ':jid' });
    });
});

export default Router;
