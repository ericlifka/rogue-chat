import { run, scheduleOnce, throttle, bind, later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { reads, gt } from '@ember/object/computed';
import { htmlSafe } from '@ember/template';
import Component from '@ember/component';

export default Component.extend({
    classNames: ['chat-mentions'],

    search: service(),

    requestBuilder: null,
    suggestRequest: null,
    mentionedUsers: null,
    flyoutPosition: null,
    highlightedIndex: null,
    mentionedEntities: null,

    hasResults: gt('searchResults.length', 0),
    searchResults: reads('suggestRequest.results'),

    actions: {
        selectResult(entity) {
            this.insertMention(entity);
        },

        updateHighlightedIndex(index) {
            this.set('highlightedIndex', index);
        }
    },

    init() {
        this._super(...arguments);
        const requestBuilder = this.get('search')
            .getSuggestBuilder()
            .setTypes(['users']);
        this.set('highlightedIndex', 0);
        this.set('mentionedEntities', []);
        this.set('requestBuilder', requestBuilder);
    },

    didInsertElement() {
        this._super(...arguments);
        run(() => scheduleOnce('afterRender', this, this.setupBindings));
    },

    setupBindings() {
        const $textarea = this.$().find('textarea');
        $textarea
            .keydown(bind(this, this.onKeyUp))
            .click(bind(this, this.handleInputChange))
            .on('input', bind(this, this.handleInputChange))
            .on('focus', bind(this, this.handleInputChange))
            .on('blur', bind(this, function () {
                later(this, function () {
                    this.set('suggestRequest', null)
                }, 200)
            }));

        this.set('$textarea', $textarea);
    },

    onKeyUp(event) {
        const currentIndex = this.get('highlightedIndex');
        const maxIndex = this.get('searchResults.length') - 1;
        switch(event.key) {
            case 'Backspace':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleInputChange();
                break;
            case 'Tab':
            case 'Enter':
                const entity = this.get(`searchResults.${currentIndex}`);
                if (entity) {
                    this.insertMention(entity);
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case 'ArrowUp':
                this.set('highlightedIndex', Math.max(currentIndex - 1, 0));
                break;
            case 'ArrowDown':
                this.set('highlightedIndex', Math.min(currentIndex + 1, maxIndex));
                break;
            case 'Escape':
                if (this.get('hasResults')) {
                    const $textarea = this.get('$textarea');
                    $textarea.val(`${$textarea.val()} `);

                    this.set('suggestRequest', null);
                }
                break;
        }
    },

    handleInputChange() {
        // Grab the caret position and get a substring up to this current point
        const $textarea = this.get('$textarea');
        const caretPosition = $textarea.caret('pos');
        const subString = $textarea.val().substring(0, caretPosition);

        const regex = new RegExp('(?:\\s|^)@([a-z,][\\s]?){2,20}$', 'ig');
        let mention = regex.exec(subString);

        if (!mention) {
            return this.set('suggestRequest', null);
        }

        mention = mention.get('firstObject');
        throttle(this, this.requestMentionData, mention, 150, false);
        this.set('highlightedIndex', 0);
        this.updateFlyoutPosition();
    },

    insertMention(entity) {
        const $textarea = this.get('$textarea');
        const caretPosition = $textarea.caret('pos');
        const preString = $textarea.val().substring(0, caretPosition);

        let postString = $textarea.val().substring(caretPosition);
        if (postString.length < 1) {
            postString = " ";
        }

        const startOfMention = preString.lastIndexOf('@');
        const preMentionString = preString.substring(0, startOfMention);

        const name = entity.get('name');
        const mentionString = `${preMentionString}[@${name}]${postString}`;

        $textarea.val(mentionString);
        $textarea.trigger('change');
        this.set('suggestRequest', null);
        this.handleMentionedUser(entity);
    },

    requestMentionData(searchInput) {
        const suggestRequest = this.get('requestBuilder')
            .setSearchValue(searchInput)
            .build();
        this.set('suggestRequest', suggestRequest);

        suggestRequest.startSearch();
    },

    updateFlyoutPosition() {
        const position = this.get('$textarea').caret('position');
        const left = Math.max(position.left - (250 / 2), 0);
        const bottom = 39 + position.top;
        const safeCss = htmlSafe(`left:${left}px; bottom:${bottom}px`);
        this.set('flyoutPosition', safeCss);
    }
});
