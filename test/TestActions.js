function require(name) {
    return window[name];
}
const { linkModifier, linkAction } = require('linktools');

linkModifier.add('a', (link, modifier) => {
    link.hash += 'a';
});
linkModifier.add('b', (link, modifier) => {
    link.hash += 'b';
});

linkAction.add('a', (event) => {
    return OO.ui.alert('a');
});
linkAction.add('b', (event) => {
    return OO.ui.alert('b');
});
