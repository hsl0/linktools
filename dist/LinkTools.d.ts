type HTMLElements<Element extends HTMLElement = HTMLElement> = Element | ArrayLike<Element> | string;
/**
 * @callback LinkModifier
 * @param link Link element (anchor element) object
 * @param caller link-modifier class element that called this modifier
 */
type LinkModifier = (link: HTMLAnchorElement, caller: HTMLElement) => unknown | PromiseLike<unknown>;
/**
 * @callback Action
 * @param event Event object for control and view details
 * @param args Arguments that passed into the action
 */
type Action = (event: Event, ...args: unknown[]) => unknown | PromiseLike<unknown>;
/** Stores link modifiers */
export declare class LinkModifierCollection {
    /** Indicate whether any of modifier has already fired once */
    fired: boolean;
    /** Named modifier storage */
    private modifiers;
    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    constructor(modifiers?: Record<string, LinkModifier> | LinkModifierCollection);
    /**
     * Add multiple named link modifier in once
     * @param modifiers Object of named link modifier. Key for modifier's name. Value for modifier function or name of alias.
     */
    add(modifiers: Record<string, LinkModifier | string> | LinkModifierCollection): void;
    /**
     * Add a named link modifier
     * @param name Name of link modifier
     * @param modifier Link modifier function
     */
    add(name: string, modifier: LinkModifier): void;
    /**
     * Add a named link modifier
     * @param names Names of link modifier
     * @param modifier Link modifier function
     */
    add(names: string[] | Set<string>, modifier: LinkModifier): void;
    /**
     * Add a alias of named link modifier
     * @param alias Alias of link modifier
     * @param modifier Link modifier name
     */
    add(alias: string, modifier: string): void;
    /**
     * Add aliases of named link modifier
     * @param aliases Aliases of link modifier
     * @param modifier Link modifier name
     */
    add(aliases: string[] | Set<string>, modifier: string): void;
    /**
     * Unregister named link modifier
     * @param name Name of link modifier
     */
    remove(name: string): void;
    /**
     * Mount the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     */
    mount(element: HTMLElements): PromiseLike<unknown>;
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
    /** Indicate whether any of action has already mounted once */
    mounted: boolean;
    /** Named actions storage */
    private actions;
    /**
     * Construct ActionCollection
     * @param handlers Object of actions that are being added for collection. Key for action name.
     */
    constructor(handlers?: Record<string, Action> | LinkActionCollection);
    /**
     * Add multiple named action in once
     * @param actions Object of named actions. Key for action's name. Value for action handler/listener function or name of alias.
     */
    add(actions: Record<string, Action | string> | LinkActionCollection): void;
    /**
     * Add a named action
     * @param name Name of action
     * @param action Action handler/listener function
     */
    add(name: string, action: Action): void;
    /**
     * Add a named action
     * @param names Names of action
     * @param action Action handler/listener function
     */
    add(names: string[] | Set<string>, action: Action): void;
    /**
     * Add a alias of named action
     * @param alias Alias of action
     * @param action Action name
     */
    add(alias: string, action: string): void;
    /**
     * Add aliases of named action
     * @param aliases Aliases of action
     * @param action Action name
     */
    add(aliases: string[] | Set<string>, action: string): void;
    /**
     * Unregister a named action
     * @param name name of action
     */
    remove(name: string): void;
    /**
     * Unregister named actions
     * @param name name of action
     */
    remove(names: string[] | Set<string>): void;
    /**
     * Mount the collection's actions to child elements which its listeners or handlers are defined
     * @param parent Target parent element
     */
    mount(parent: HTMLElements): void;
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
    execute(name: string, event: Event, ...args: unknown[]): unknown;
    private eventHandler;
}
export declare const linkModifier: LinkModifierCollection;
export declare const linkAction: LinkActionCollection;
export {};
