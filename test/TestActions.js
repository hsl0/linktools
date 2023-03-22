function require(name) {
    return window[name];
}
const { linkModifier, linkAction } = require('linktools');

linkModifier.add('a', (link) => {
    link.hash += 'a';
});
linkModifier.add('b', (link) => {
    link.hash += 'b';
});

linkAction.add('a', () => {
    // eslint-disable-next-line no-undef
    return OO.ui.alert('a');
});
linkAction.add('b', () => {
    // eslint-disable-next-line no-undef
    return OO.ui.alert('b');
});
