import EmberObject from '@ember/object';

export default EmberObject.extend({
    //properties from realtime
    id: null,
    oid: null,
    from: null,
    to: null,
    time: null,
    corrects: null,
    raw: null,
    links: null,
    stanza: null,
    files: null,

    //properties create when the message is received in chat
    user: null,

    //set by history service when message is received
    history: false
});
