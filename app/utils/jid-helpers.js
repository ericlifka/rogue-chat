
import _ from 'lodash';
const isPersonRegex = /^[0-9a-f]{24}@(?:[-a-z0-9\._]+)\.orgspan\.com$/i;
const isGroupRegex = /^[0-9a-f]{24}@conference\.(?:[-a-z0-9\._]+)\.orgspan\.com$/i;

export function isPersonJid(jid) {
    return jid && isPersonRegex.test(jid);
}

export function isGroupJid(jid) {
    return jid && isGroupRegex.test(jid);
}

export function isSupervisorJid (jid) {
    return _.startsWith(jid, 'supervisorassistance');
}

export function isAcdJid (jid) {
    return _.startsWith(jid, 'acd-');
}

export function isScreenRecordingJid (jid) {
    return _.startsWith(jid, 'screenrecording-');
}
