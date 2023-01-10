/// <reference types="jquery" />
declare type HTMLElements<Element extends HTMLElement = HTMLElement> = Element | ArrayLike<Element> | string;
/**
 * @callback LinkModifier
 * @param link Link element (anchor element) object
 * @param caller link-modifier class element that called this modifier
 */
declare type LinkModifier = (link: HTMLAnchorElement, caller: HTMLElement) => unknown | PromiseLike<unknown>;
/**
 * @callback Action
 * @param event Event object for control and view details
 * @param args Arguments that passed into the action
 */
declare type Action = (event: Event | JQuery.Event, ...args: unknown[]) => unknown | PromiseLike<unknown>;
declare const RESERVED_BEFORE: unique symbol;
declare const RESERVED_AFTER: unique symbol;
/** Stores link modifiers */
export declare class LinkModifierCollection {
    /** Indicate whether any of modifier has already fired once */
    fired: boolean;
    /** Named modifier storage */
    private modifiers;
    /** Pre-modifier storage */
    private [RESERVED_BEFORE];
    /** Post-modifier storage */
    private [RESERVED_AFTER];
    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    constructor(modifiers?: Record<string, LinkModifier> | LinkModifierCollection);
    /**
     * Add multiple named link modifier in once
     * @param modifiers Object of named link modifier. Key for modifier's name.
     */
    add(modifiers: Record<string, LinkModifier> | LinkModifierCollection): void;
    /**
     * Add a named link modifier
     * @param name Name of link modifier
     * @param modifier Link modifier function
     */
    add(name: string, modifier: LinkModifier): void;
    /**
     * Unregister named link modifier
     * @param name Name of link modifier
     */
    remove(name: string): void;
    /**
     * Apply the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     */
    apply(element: HTMLElements): PromiseLike<unknown>;
    /**
     * Add pre link modifier for specific elements that runs before named modifiers run
     * @param element Target element of modifier
     * @param modifier Link modifier function
     */
    before(element: HTMLElements<HTMLAnchorElement>, modifier: (link: HTMLAnchorElement) => void): void;
    /**
     * Add after link modifier for specific elements that runs after named modifiers run
     * @param element Target element of modifier
     * @param modifier Link modifier function
     */
    after(element: HTMLElements<HTMLAnchorElement>, modifier: (link: HTMLAnchorElement) => void): void;
    /**
     * Unregister after link modifier by target element
     * @param element Target element of modifier
     */
    removeBefore(element: HTMLElements<HTMLAnchorElement>): void;
    /**
     * Unregister after link modifier by modifier function
     * @param modifier Link modifier function
     */
    removeBefore(modifier: (link: HTMLAnchorElement) => void): void;
    /**
     * Unregister after link modifier by target element
     * @param element Target element of modifier
     */
    removeAfter(element: HTMLElements<HTMLAnchorElement>): void;
    /**
     * Unregister after link modifier by modifier function
     * @param modifier Link modifier function
     */
    removeAfter(modifier: (link: HTMLAnchorElement) => void): void;
    /**
     * Forks modifiers collection
     * @returns New modifiers collection that contains member modifiers of this collection
     */
    fork(): LinkModifierCollection;
}
export declare namespace linkCreater {
    /**
     * Create new links that needed
     * @param element Target parent element
     */
    function apply(element: HTMLElements): void;
    /**
     * Create new link that wraps the children of the target when the target has self links
     * @param target Target element
     */
    function createSelf(target: HTMLElements): void;
    /**
     * Create new link that wraps the children of the target when the target has no links
     * @param target Target element
     */
    function createDummy(target: HTMLElements): void;
}
/** Stores action listeners or handlers */
export declare class LinkActionCollection {
    /** Indicate whether any of action has already fired once */
    fired: boolean;
    /** Named actions storage */
    private actions;
    /**
     * Construct ActionCollection
     * @param handlers Object of actions that are being added for collection. Key for action name.
     */
    constructor(handlers?: Record<string, Action> | LinkActionCollection);
    /**
     * Add multiple named action in once
     * @param handlers Object of named actions. Key for action's name.
     */
    add(actions: Record<string, Action> | LinkActionCollection): void;
    /**
     * Add a named action
     * @param name Name of action
     * @param action Action handler/listener function
     */
    add(name: string, action: Action): void;
    /**
     * Unregister named action
     * @param name name of action
     */
    remove(name: string): void;
    /**
     * Apply the collection's actions to child elements which its handlers are defined
     * @param element Target parent element
     */
    apply(element: HTMLElements): void;
    /**
     * Forks actions collection
     * @returns New action collection that contains member actions of this collection
     */
    fork(): LinkActionCollection;
    /**
     * Execute action
     * @param event Event object for control and view details
     * @param args Arguments that passed into the action

     */
    execute(name: string, event: Event | JQuery.Event, ...args: unknown[]): unknown;
}
export declare const linkModifier: LinkModifierCollection;
export declare const linkAction: LinkActionCollection;
export {};
