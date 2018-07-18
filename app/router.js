import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
    this.route('navigation-portal', { path: '/' });
    this.route('chat-portal', { path: '/chat'});
});

export default Router;
