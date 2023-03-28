import type { HTMLElements } from './common';
/**
 * Create new links that needed
 * @param element Target parent element
 */
export declare function mount(element: HTMLElements): void;
/**
 * Create new link that wraps the children of the target when the target has self links
 * @param target Target element
 */
export declare function createSelf(target: HTMLElements): void;
/**
 * Create new link that wraps the children of the target when the target has no links
 * @param target Target element
 */
export declare function createDummy(target: HTMLElements): void;
//# sourceMappingURL=linkcreater.d.ts.map
