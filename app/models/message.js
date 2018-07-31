import { computed } from '@ember/object';
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
});
