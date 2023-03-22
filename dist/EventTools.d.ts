import type { HTMLElements } from './common';
/**
 * @callback Action
 * @param event Event object for control and view details
 * @param args Arguments that passed into the action
 */
type Action = (
    event: Event,
    ...args: unknown[]
) => unknown | PromiseLike<unknown>;
/** Stores action listeners or handlers */
export default class LinkActionCollection {
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
     * @param options Mount options
     */
    mount(
        parent: HTMLElements,
        {
            force,
        }?: {
            /** If true, always mount even when already mounted. If false, don't mount when already mounted. Default is false. */
            force: boolean;
        }
    ): void;
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
export {};
