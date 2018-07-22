const AuthWindow = require('./AuthWindow');
const RosterWindow = require('./RosterWindow');
const ChatWindow = require('./ChatWindow');

module.exports = {
  createWindow(type, opts) {
      switch (type) {
          case 'AuthWindow':
              return new AuthWindow(opts);
          case 'RosterWindow':
              return new RosterWindow(opts);
          case 'ChatWindow':
              return new ChatWindow(opts);
      }
  }
};
