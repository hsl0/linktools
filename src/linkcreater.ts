import type { HTMLElements } from './common';

/**
 * Create new links that needed
 * @param element Target parent element
 */
export function mount(element: HTMLElements) {
    //@ts-ignore Valid union overload
    element = $<HTMLElement>(element);

    if ((element as JQuery).is('.link-slot-self')) createSelf(element);
    else createSelf((element as JQuery).find('.link-slot-self'));

    if ((element as JQuery).is('.link-slot-dummy')) createDummy(element);
    else createDummy((element as JQuery).find('.link-slot-dummy'));
}

/**
 * Create new link that wraps the children of the target when the target has self links
 * @param target Target element
 */
export function createSelf(target: HTMLElements) {
    //@ts-ignore Valid union overload
    ($(target) as JQuery<HTMLElement>)
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

/**
 * Create new link that wraps the children of the target when the target has no links
 * @param target Target element
 */
export function createDummy(target: HTMLElements) {
    //@ts-ignore Valid union overload
    ($(target) as JQuery<HTMLElement>)
        .not(':has(a)')
        .not(':has(.link-slot-self)')
        .not(':has(.link-slot-dummy)')
        .wrapInner(
            $('<a />', {
                class: 'link-dummy',
            })
        );
}
