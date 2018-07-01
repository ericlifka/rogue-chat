import Service from '@ember/service';

export default Service.extend({
    ipcRenderer: null,

    init () {
        this._super(...arguments);
        this.ipcRenderer = requireNode('electron').ipcRenderer;
    },

    registerListener(topic, handler) {
        this.ipcRenderer.on(topic, handler);
    },

    removeListener(topic, handler) {
        this.ipcRenderer.removeListener(topic, handler);
    },

    notifyReady() {
        this.ipcRenderer.send('main-window-ready', true);
    }
});
