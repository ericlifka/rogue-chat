import Markdown from "markdown-it";
import hljs from "highlight.js";
import Ember from 'ember';

hljs.configure({
    languages: ['bash', 'clojure', 'coffeescript', 'cpp', 'cs', 'css', 'elm', 'go', 'xml',
        'handlebars', 'http', 'ini', 'java', 'javascript', 'json', 'makefile', 'objectivec',
        'python', 'ruby', 'rust', 'sql', 'swift', 'typescript']
});

const markdownParser = new Markdown({
    html: false,
    linkify: true,
    typographer: false,
    highlight(code, lang) {
        if (lang === 'no-highlight') {
            return Ember.Handlebars.Utils.escapeExpression(code);
        } else if (lang) {
            try {
                return hljs.highlight(lang, code).value;
            } catch (e) {
                return Ember.Handlebars.Utils.escapeExpression(code);
            }
        } else {
            return hljs.highlightAuto(code).value;
        }
    }
});

function markdownToHTML (markdown) {
    return markdownParser.render(markdown);
}

export {
    markdownToHTML
}
