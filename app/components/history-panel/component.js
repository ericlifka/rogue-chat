import { reads, notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { throttle } from '@ember/runloop';
import Component from '@ember/component';
import RSVP from 'rsvp';

export default Component.extend({
    classNames: ['history-panel', 'panel'],

    search: service(),
    history: service(),

    roomJid: null,
    searchInput: null,
    requestBuilder: null,
    diamondRequest: null,
    selectedMessage: null,
    historyResults: null,

    init() {
        this._super(...arguments);
        const requestBuilder = this.get('search')
            .getDiamondBuilder()
            .setPageSize(15)
            .setSortBy('created')
            .setSortOrder('DESC')
            .setTypes(['messages'])
            .setExpansions(['from']);
        this.set('requestBuilder', requestBuilder);
        this.set('historyResults', []);
    },

    results: reads('diamondRequest.results'),
    totalResults: reads('diamondRequest.totalResults'),
    hasData: notEmpty('diamondRequest.totalResults'),
    searching: reads('diamondRequest.inflightRequest'),
    moreResults: notEmpty('diamondRequest.nextPageUrl'),

    actions: {
        onInput() {
            const searchInput = this.get('searchInput');
            if (searchInput && searchInput.length > 2) {
                throttle(this, this.sendSearchRequest, searchInput, 200, false);
            } else {
                this.set('diamondRequest', null);
            }
        },

        loadMoreResults() {
            this.get('diamondRequest').next();
        },

        selectHistoryMessage(message) {
            this.set('selectedMessage', message);
            this.loadHistoryForMessage(message);
        },

        closeHistory() {
            this.set('selectedMessage', null);
            this.get('historyResults').clear();
        }
    },

    sendSearchRequest(searchInput) {
        const searchQuery = this.buildHistoryQuery(searchInput);
        const diamondRequest = this.get('requestBuilder')
            .setQuery(searchQuery)
            .build();
        this.set('diamondRequest', diamondRequest);
        diamondRequest.startSearch();
    },

    buildHistoryQuery(searchInput) {
        return [
            {
                type: 'EXACT',
                fields: [
                    'targetJids'
                ],
                values: [
                    this.get('roomJid')
                ]
            },
            {
                type: 'SIMPLE',
                value: searchInput,
                fields: [
                    'body'
                ]
            }
        ];
    },

    async loadHistoryForMessage(message) {
        const timestamp = message.get('time').valueOf();
        const jid = this.get('roomJid');

        const afterOptions = {
            jid,
            after: timestamp,
            limit: 30
        };
        const after = await this.get('history').loadHistoryWithoutRoom(afterOptions);

        const messages = [message].concat(after);
        const correctedMessages = this.processCorrections(messages);
        this.set('historyResults', correctedMessages);
    },

    processCorrections(messages) {
        // since we don't have a chat room we have to handle corrections manually, this will change as realtime migrates to dynamo
        const messageCache = {};
        return messages.filter(message => {
            const messageId = message.get('id');
            messageCache[messageId] = message;

            const correctionId = message.get('corrects');
            if (correctionId) {
                const originalMessage = messageCache[correctionId];
                if (originalMessage) {
                    originalMessage.set('correctionRaw', message.get('raw'));
                    return false;
                }
            }
            return true;
        });
    }
});
