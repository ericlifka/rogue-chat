import Component from '@ember/component';

const MEDIA_ITEMS = [
    {
        name: 'image',
        path: 'media-item/image',
        regex: /.*(jpg|jpeg|gif|png)$/i
    }
];

export default Component.extend({
    classNames: ['media-item'],

    children: null,
    links: null,

    mediaRenderer: null,
    data: null,

    init() {
        this._super(...arguments);
        const links = this.get('links');
        this.determineMediaItem(links);
    },

    determineMediaItem(links = []) {
        const link = links.get('firstObject');
        if (!link || typeof link !== 'string') {
            return;
        }

        // TODO: If there are multiple matches only take the first one for now
        const [ mediaItem ] = MEDIA_ITEMS.filter(({regex}) => regex.test(link));
        if (mediaItem) {
            this.setProperties({
                mediaRender: mediaItem.path,
                data: link
            });
        }
    }
});
