'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.createDummy = exports.createSelf = exports.mount = void 0;
/**
 * Create new links that needed
 * @param element Target parent element
 */
function mount(element) {
    //@ts-ignore Valid union overload
    element = $(element);
    if (element.is('.link-slot-self')) createSelf(element);
    else createSelf(element.find('.link-slot-self'));
    if (element.is('.link-slot-dummy')) createDummy(element);
    else createDummy(element.find('.link-slot-dummy'));
}
exports.mount = mount;
/**
 * Create new link that wraps the children of the target when the target has self links
 * @param target Target element
 */
function createSelf(target) {
    //@ts-ignore Valid union overload
    $(target)
        .not(':has(a)')
        .not(':has(.link-slot-self)')
        .not(':has(.link-slot-dummy)')
        .wrapInner(
            $('<a />', {
                class: 'link-self',
                href: location.href,
            })
        );
}
exports.createSelf = createSelf;
/**
 * Create new link that wraps the children of the target when the target has no links
 * @param target Target element
 */
function createDummy(target) {
    //@ts-ignore Valid union overload
    $(target)
        .not(':has(a)')
        .not(':has(.link-slot-self)')
        .not(':has(.link-slot-dummy)')
        .wrapInner(
            $('<a />', {
                class: 'link-dummy',
            })
        );
}
exports.createDummy = createDummy;
//# sourceMappingURL=linkcreater.js.map
