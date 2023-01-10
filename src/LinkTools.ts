type HTMLElements<Element extends HTMLElement = HTMLElement> =
    | Element
    | ArrayLike<Element>
    | string;

/**
 * @callback LinkModifier
 * @param link Link element (anchor element) object
 * @param caller link-modifier class element that called this modifier
 */
type LinkModifier = (
    link: HTMLAnchorElement,
    caller: HTMLElement
) => unknown | PromiseLike<unknown>;

type LinkModifierMap = Map<
    HTMLElements<HTMLAnchorElement>,
    Set<(link: HTMLAnchorElement) => void>
>;

/**
 * @callback Action
 * @param event Event object for control and view details
 * @param args Arguments that passed into the action
 */
type Action = (
    event: Event | JQuery.Event,
    ...args: unknown[]
) => unknown | PromiseLike<unknown>;

interface AsyncEvent<T> extends JQuery.Event {
    pending?: boolean;
    fulfilled?: boolean;
    rejected?: boolean;
    settled?: boolean;
    promise?: PromiseLike<T>;
}

function parseJSON(
    json: string,
    reviver?: (this: any, key: string, value: any) => any
) {
    try {
        return JSON.parse(json, reviver);
    } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
    }
}

const RESERVED_BEFORE = Symbol('modifiers reserved before');
const RESERVED_AFTER = Symbol('modifiers reserved after');

/** Stores link modifiers */
export class LinkModifierCollection {
    /** Indicate whether any of modifier has already fired once */
    fired = false;

    /** Named modifier storage */
    private modifiers: Record<string, LinkModifier> = {};

    /** Pre-modifier storage */
    private [RESERVED_BEFORE]: LinkModifierMap = new Map();

    /** Post-modifier storage */
    private [RESERVED_AFTER]: LinkModifierMap = new Map();

    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    constructor(modifiers?: Record<string, LinkModifier> | LinkModifierCollection) {
        if (modifiers) this.add(modifiers);
    }

    /**
     * Add multiple named link modifier in once
     * @param modifiers Object of named link modifier. Key for modifier's name. Value for modifier function or name of alias.
     */
    add(
        modifiers: Record<string, LinkModifier | string> | LinkModifierCollection
    ): void;

    //add(modifiers: HTMLElements): void;

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

    add(a: any, b?: LinkModifier | string) {
        switch (typeof a) {
            case 'string':
                const name = a;
                switch (typeof b) {
                    case 'function':
                        // Single modifier
                        this.modifiers[name] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.modifiers)
                            this.modifiers[name] = this.modifiers[b];
                        else
                            throw new ReferenceError(
                                `Link modifier '${b}' is not exist`
                            );
                        break;
                    default:
                        throw new TypeError('Modifier is not function');
                }
                break;
            case 'object':
                if (a instanceof LinkModifierCollection)
                    // Multiple modifiers
                    Object.assign(this.modifiers, a.modifiers);
                else if (Array.isArray(a) || a instanceof Set)
                    // Multiple aliases
                    switch (typeof b) {
                        case 'function':
                        case 'string':
                            //@ts-ignore Valid union overload
                            a.forEach((name: string) => this.add(name, b));
                            break;
                        default:
                            throw new TypeError(
                                'Second argument is not function or string'
                            );
                    }
                // Multiple modifiers
                else for (const name in a) this.add(name, a[name]);
                break;
            default:
                throw TypeError(
                    'First argument is not name string or modifiers object'
                );
        }
    }

    /**
     * Unregister named link modifier
     * @param name Name of link modifier
     */
    remove(name: string): void {
        if (name === 'string') delete this.modifiers[name];
        else throw new TypeError('Name is not string');
    }

    /**
     * Apply the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     */
    apply(element: HTMLElements): PromiseLike<unknown> {
        const collection = this;
        let globalPromise: PromiseLike<unknown> = Promise.resolve();
        const localPromises: PromiseLike<unknown>[] = [];

        if (this.fired) return globalPromise;

        // Pre-modifiers
        this[RESERVED_BEFORE].forEach((modifiers, element) =>
            $<HTMLAnchorElement>(element as any)
                .filter('a')
                .each(function () {
                    modifiers.forEach((modifier) => {
                        globalPromise = globalPromise.then(() => modifier(this));
                    });
                })
        );

        // Named modifiers
        $('.link-modifier-cloak').addClass('link-modifier');

        element = $<HTMLElement>(element as any);

        if ((element as JQuery).is('.link-modifier'))
            element = (element as JQuery).find('a');
        else element = (element as JQuery).find('.link-modifier a');

        (element as JQuery).each(function () {
            const link = this as HTMLAnchorElement;
            let localPromise: PromiseLike<unknown> = Promise.resolve();

            $(this)
                .parents('.link-modifier')
                .each(function () {
                    const name = this.dataset.modifier;

                    if (!name) {
                        console.error(
                            this,
                            new TypeError(
                                'Modifier name is not specified at data-modifier attribute'
                            )
                        );
                        return;
                    }

                    localPromise = localPromise
                        .then(() => collection.modifiers[name](link, this))
                        .then(() => this.classList.remove('link-modifier-cloak'));
                });

            localPromises.push(localPromise);
        });

        globalPromise = globalPromise.then(() => Promise.allSettled(localPromises));

        // After-modifiers
        this[RESERVED_AFTER].forEach((modifiers, element) =>
            $<HTMLAnchorElement>(element as any)
                .filter('a')
                .each(function () {
                    modifiers.forEach(
                        (modifier) =>
                            (globalPromise = globalPromise.then(() =>
                                modifier(this)
                            ))
                    );
                })
        );

        this.fired = true;

        return globalPromise;
    }

    /**
     * Add pre link modifier for specific elements that runs before named modifiers run
     * @param element Target element of modifier
     * @param modifier Link modifier function
     */
    before(
        element: HTMLElements<HTMLAnchorElement>,
        modifier: (link: HTMLAnchorElement) => void
    ): void {
        const map = this[RESERVED_BEFORE];

        if (typeof modifier === 'function') {
            if (map.has(element)) map.get(element)?.add(modifier);
            else
                map.set(
                    element,
                    new Set<(link: HTMLAnchorElement) => void>().add(modifier)
                );
        } else throw new TypeError('Modifier is not function');
    }

    /**
     * Add after link modifier for specific elements that runs after named modifiers run
     * @param element Target element of modifier
     * @param modifier Link modifier function
     */
    after(
        element: HTMLElements<HTMLAnchorElement>,
        modifier: (link: HTMLAnchorElement) => void
    ): void {
        const map = this[RESERVED_AFTER];

        if (typeof modifier === 'function') {
            if (map.has(element)) map.get(element)?.add(modifier);
            else
                map.set(
                    element,
                    new Set<(link: HTMLAnchorElement) => void>().add(modifier)
                );
        } else throw new TypeError('Modifier is not function');
    }

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

    removeBefore(x: any) {
        const map = this[RESERVED_BEFORE];

        if (typeof x === 'function') {
            // By modifier function
            const modifier = x;
            map.forEach((modifiers) => modifiers.delete(modifier));
        } else {
            // By target element
            const element = x;
            map.delete(element);
        }
    }

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

    removeAfter(x: any) {
        const map = this[RESERVED_AFTER];

        if (typeof x === 'function') {
            // By modifier function
            const modifier = x;
            map.forEach((modifiers) => modifiers.delete(modifier));
        } else {
            // By target element
            const element = x;
            map.delete(element);
        }
    }

    /**
     * Forks modifiers collection
     * @returns New modifiers collection that contains member modifiers of this collection
     */
    fork(): LinkModifierCollection {
        return new LinkModifierCollection(this);
    }
}

export namespace linkCreater {
    /**
     * Create new links that needed
     * @param element Target parent element
     */
    export function apply(element: HTMLElements) {
        element = $<HTMLElement>(element as any);

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
        $<HTMLElement>(target as any)
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
        $<HTMLElement>(target as any)
            .not(':has(a)')
            .not(':has(.link-slot-self)')
            .not(':has(.link-slot-dummy)')
            .wrapInner(
                $('<a />', {
                    class: 'link-dummy',
                })
            );
    }
}

interface CommonActionOption {
    target: string;
}

interface ListenerOption extends CommonActionOption {
    listener: [string, ...unknown[]][] | Action;
}

interface HandlerOption extends CommonActionOption {
    handler: [string, ...unknown[]][] | Action;
}

/** Stores action listeners or handlers */
export class LinkActionCollection {
    /** Indicate whether any of action has already fired once */
    fired = false;

    /** Named actions storage */
    private actions: Record<string, Action> = {};

    /** Alias selectors storage */
    private aliases: Map<
        string | ((parent: HTMLElement) => HTMLElements),
        | ListenerOption
        | HandlerOption
        | ((element: HTMLElement) => ListenerOption | HandlerOption)
    > = new Map();

    /** Listeners registry of element */
    private listeners: WeakMap<
        HTMLElement,
        Record<string, [string, ...unknown[]][]>
    > = new WeakMap();

    /** Handlers registry of element */
    private handlers: WeakMap<
        HTMLElement,
        Record<string, [string, ...unknown[]][]>
    > = new WeakMap();

    /**
     * Construct ActionCollection
     * @param handlers Object of actions that are being added for collection. Key for action name.
     */
    constructor(handlers?: Record<string, Action> | LinkActionCollection) {
        if (handlers) this.add(handlers);
    }

    /**
     * Add multiple named action in once
     * @param actions Object of named actions. Key for action's name. Value for action handler/listener function or name of alias.
     */
    add(actions: Record<string, Action | string> | LinkActionCollection): void;

    //add(handlers: HTMLElements): void;

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

    add(a: any, b?: Action | string) {
        switch (typeof a) {
            case 'string':
                const name = a;
                switch (typeof b) {
                    case 'function':
                        // Single action
                        this.actions[name] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.actions) this.actions[name] = this.actions[b];
                        else throw new ReferenceError(`Action '${b}' is not exist`);
                        break;
                    default:
                        throw new TypeError(
                            'Action handler or listener is not function'
                        );
                }
                break;
            case 'object':
                if (a instanceof LinkActionCollection)
                    // Multiple actions
                    Object.assign(this.actions, a.actions);
                else if (Array.isArray(a) || a instanceof Set)
                    // Multiple aliases
                    switch (typeof b) {
                        case 'function':
                        case 'string':
                            //@ts-ignore Valid union overload
                            a.forEach((name: string) => this.add(name, b));
                            break;
                        default:
                            throw new TypeError(
                                'Second argument is not function or string'
                            );
                    }
                // Multiple actions
                else for (const name in a) this.add(name, a[name]);
                break;
            default:
                throw TypeError(
                    'First argument is not name string or action object'
                );
        }
    }

    /**
     * Unregister named action
     * @param name name of action
     */
    remove(name: string): void {
        if (name === 'string') delete this.actions[name];
        else throw new TypeError('Name is not string');
    }

    /**
     * Register alias selector for listener/handler statically
     * @param selector alias selector
     * @param option listener/handler option contains action
     */
    alias(selector: string, option: ListenerOption | HandlerOption): void;

    /**
     * Register alias selector for listener/handler dynamically
     * @param selector function that gets parent element and returns elements selected
     * @param option listener/handler option contains action
     */
    alias(
        selector: (parent: HTMLElement) => HTMLElements,
        option: ListenerOption | HandlerOption
    ): void;

    /**
     * Register alias selector for listener/handler dynamically
     * @param selector alias selector
     * @param option function that gets selected element and returns listener/handler option contains action
     */
    alias(
        selector: string,
        option: (element: HTMLElement) => ListenerOption | HandlerOption
    ): void;

    /**
     * Register alias selector for listener/handler dynamically
     * @param selector function that gets parent element and returns elements selected
     * @param option function that gets selected element and returns listener/handler option contains action
     */
    alias(
        selector: (parent: HTMLElement) => HTMLElements,
        option: (element: HTMLElement) => ListenerOption | HandlerOption
    ): void;

    alias(selector: any, option: any): void {
        switch (typeof selector) {
            case 'string':
            case 'function':
                switch (typeof option) {
                    case 'object':
                    case 'function':
                        this.aliases.set(selector, option);
                        break;
                    default:
                        throw new TypeError('Option is not object or function');
                }
                break;
            default:
                throw new TypeError('Selector is not string or function');
        }
    }

    /**
     * Apply the collection's actions to child elements which its handlers are defined
     * @param element Target parent element
     */
    apply(element: HTMLElements): void {
        if (this.fired) return;

        $('.event-listener-cloak').addClass('event-listener');
        $('.event-handler-cloak').addClass('event-handler');

        const collection = this;
        element = $<HTMLElement>(element as any);

        if (
            (element as JQuery).is(
                '.event-listener[data-target="link"], .event-handler[data-target="link"]'
            )
        )
            element = (element as JQuery).find('a');
        else
            element = (element as JQuery).find(
                '.event-listener[data-target="link"] a, .event-handler[data-target="link"] a'
            );

        (element as JQuery).each(function () {
            const listeners: Record<string, [string, ...any[]][]> =
                collection.listeners.get(this) ||
                collection.listeners.set(this, {}).get(this)!;
            const handlers: Record<string, [string, ...any[]][]> =
                collection.listeners.get(this) ||
                collection.listeners.set(this, {}).get(this)!;

            $(this)
                .parents('.event-listener[data-target="link"]')
                .each(function () {
                    const actions = parseJSON(this.dataset.listener as any);

                    if (actions)
                        for (const event in actions) {
                            listeners[event] = [
                                ...actions[event],
                                ...(listeners[event] || []),
                            ];
                        }
                });

            $(this)
                .parents('.event-handler[data-target="link"]')
                .get()
                .reverse()
                .forEach((handler) => {
                    const actions = parseJSON(handler.dataset.handler as any);

                    if (actions)
                        for (const event in actions) {
                            if (!handlers[event]) handlers[event] = actions[event];
                        }
                });

            new Set([...Object.keys(listeners), ...Object.keys(handlers)]).forEach(
                (eventName) =>
                    $(this).on(
                        eventName,
                        (event: AsyncEvent<unknown>, ...[prev]) => {
                            // if(!event.isTrusted && prev instanceof Event && prev.defaultPrevented && prev.fulfilled)
                            if (prev?.isDefaultPrevented() && prev?.fulfilled) {
                                return;
                            }

                            event.preventDefault();

                            event.pending = true;
                            event.settled = false;
                            event.fulfilled = false;
                            event.rejected = false;

                            let promise: PromiseLike<unknown> = Promise.resolve();

                            listeners[event.type]?.forEach(([name, ...args]) => {
                                promise = promise.then(() =>
                                    collection.execute(name, event, ...args)
                                );
                            });

                            if (handlers[event.type])
                                handlers[event.type]?.forEach(([name, ...args]) => {
                                    promise = promise.then(() =>
                                        collection.execute(name, event, ...args)
                                    );
                                });
                            else
                                (event as AsyncEvent<unknown>).promise =
                                    promise.then(
                                        (value) => {
                                            event.pending = false;
                                            event.fulfilled = true;
                                            event.settled = true;
                                            if (
                                                event.type === 'click' &&
                                                //@ts-ignore target exists in JQuery.Event
                                                (event.target as HTMLAnchorElement)
                                                    .href
                                            )
                                                // prettier-ignore
                                                //@ts-ignore target exists in JQuery.Event
                                                location.href = (event.target as HTMLAnchorElement).href;
                                            return value;
                                        },
                                        (error) => {
                                            event.pending = false;
                                            event.rejected = true;
                                            event.settled = true;
                                            throw error;
                                        }
                                    );
                        }
                    )
            );
        });

        this.fired = true;

        $('.event-listener-cloak, .event-handler-cloak').removeClass([
            'event-listener-cloak',
            'event-handler-cloak',
        ]);
    }

    /**
     * Forks actions collection
     * @returns New action collection that contains member actions of this collection
     */
    fork(): LinkActionCollection {
        return new LinkActionCollection(this);
    }

    /**
     * Execute action
     * @param event Event object for control and view details
     * @param args Arguments that passed into the action

     */
    execute(name: string, event: Event | JQuery.Event, ...args: unknown[]) {
        return this.actions[name](event, ...args);
    }
}

export const linkModifier = new LinkModifierCollection();
export const linkAction = new LinkActionCollection();

registerRenderer(async () => {
    linkCreater.apply('#mw-content-text');
    await linkModifier.apply('#mw-content-text');
});
registerHandler(() => linkAction.apply('#mw-content-text'));
