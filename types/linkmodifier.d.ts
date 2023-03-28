import type { HTMLElements } from './common';
/**
 * @callback LinkModifier
 * @param link Link element (anchor element) object
 * @param caller link-modifier class element that called this modifier
 */
type LinkModifier = (
    link: HTMLAnchorElement,
    caller: HTMLElement
) => unknown | PromiseLike<unknown>;
/** Stores link modifiers */
export default class LinkModifierCollection {
    /** Named modifier storage */
    private modifiers;
    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    constructor(
        modifiers?: Record<string, LinkModifier> | LinkModifierCollection
    );
    /**
     * Add multiple named link modifier in once
     * @param modifiers Object of named link modifier. Key for modifier's name. Value for modifier function or name of alias.
     */
    register(
        modifiers:
            | Record<string, LinkModifier | string>
            | LinkModifierCollection
    ): void;
    /**
     * Add a named link modifier
     * @param name Name of link modifier
     * @param modifier Link modifier function
     */
    register(name: string, modifier: LinkModifier): void;
    /**
     * Add a named link modifier
     * @param names Names of link modifier
     * @param modifier Link modifier function
     */
    register(names: string[] | Set<string>, modifier: LinkModifier): void;
    /**
     * Add a alias of named link modifier
     * @param alias Alias of link modifier
     * @param modifier Link modifier name
     */
    register(alias: string, modifier: string): void;
    /**
     * Add aliases of named link modifier
     * @param aliases Aliases of link modifier
     * @param modifier Link modifier name
     */
    register(aliases: string[] | Set<string>, modifier: string): void;
    /**
     * Mount the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     * @param options Mount options
     * @returns Async modification promise
     */
    mount(
        element: HTMLElements,
        {
            force,
        }?: {
            /** If true, always mount even when already mounted. If false, don't mount when already mounted. Default is false. */
            force: boolean;
        }
    ): PromiseLike<unknown>;
    /**
     * Forks modifiers collection
     * @returns New modifiers collection that contains member modifiers of this collection
     */
    fork(): LinkModifierCollection;
}
export {};
//# sourceMappingURL=linkmodifier.d.ts.map
