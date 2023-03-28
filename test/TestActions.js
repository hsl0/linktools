function require(name) {
    return window[name];
}
const { linkModifier, linkAction } = require('linktools');

linkModifier.register('a', (link) => {
    link.hash += 'a';
});
linkModifier.register('b', (link) => {
    link.hash += 'b';
});

linkAction.register('a', () => {
    // eslint-disable-next-line no-undef
    return OO.ui.alert('a');
});
linkAction.register('b', () => {
    // eslint-disable-next-line no-undef
    return OO.ui.alert('b');
});
