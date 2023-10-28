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

/**
 * @callback Action
 * @param event Event object for control and view details
 * @param args Arguments that passed into the action
 */
type Action = (event: Event, ...args: unknown[]) => unknown | PromiseLike<unknown>;

function parseJSON(
    json: string | unknown,
    reviver?: (this: any, key: string, value: any) => any
)
{
    try {
        return JSON.parse(json as string, reviver);
    } catch(error) {
        if(!(error instanceof SyntaxError)) throw error;
    }
}

/** Stores link modifiers */
export class LinkModifierCollection
{
    /** Indicate whether any of modifier has already fired once */
    fired = false;

    /** Named modifier storage */
    private modifiers: Record<string, LinkModifier> = {};

    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    constructor(modifiers?: Record<string, LinkModifier> | LinkModifierCollection)
    {
        if(modifiers) this.add(modifiers);
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

    add(a: any, b?: LinkModifier | string)
    {
        switch(typeof a) {
            case 'string':
                const name = a;
                switch(typeof b) {
                    case 'function':
                        // Single modifier
                        this.modifiers[name] = b;
                        break;
                    case 'string':
                        // Single alias
                        if(b in this.modifiers)
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
                if(a instanceof LinkModifierCollection)
                    // Multiple modifiers
                    Object.assign(this.modifiers, a.modifiers);
                else if(Array.isArray(a) || a instanceof Set)
                    // Multiple aliases
                    switch(typeof b) {
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
                else for(const name in a) this.add(name, a[name]);
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
    remove(name: string): void
    {
        if(name === 'string') delete this.modifiers[name];
        else throw new TypeError('Name is not string');
    }

    /**
     * Apply the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     */
    apply(element: HTMLElements): PromiseLike<unknown>
    {
        const collection = this;
        let globalPromise: PromiseLike<unknown> = Promise.resolve();
        const localPromises: PromiseLike<unknown>[] = [];

        if(this.fired) return globalPromise;

        // Named modifiers
        $('.link-modifier-cloak').addClass('link-modifier');

        element = $<HTMLElement>(element as any);

        if((element as JQuery).is('.link-modifier'))
            element = (element as JQuery).find('a');
        else element = (element as JQuery).find('.link-modifier a');

        (element as JQuery).each(function()
        {
            const link = this as HTMLAnchorElement;
            let localPromise: PromiseLike<unknown> = Promise.resolve();

            $(this)
                .parents('.link-modifier')
                .each(function()
                {
                    const name = this.dataset.modifier;

                    if(!name) {
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

        this.fired = true;

        return globalPromise;
    }

    /**
     * Forks modifiers collection
     * @returns New modifiers collection that contains member modifiers of this collection
     */
    fork(): LinkModifierCollection
    {
        return new LinkModifierCollection(this);
    }
}

export namespace linkCreater
{
    /**
     * Create new links that needed
     * @param element Target parent element
     */
    export function apply(element: HTMLElements)
    {
        element = $<HTMLElement>(element as any);

        if((element as JQuery).is('.link-slot-self')) createSelf(element);
        else createSelf((element as JQuery).find('.link-slot-self'));

        if((element as JQuery).is('.link-slot-dummy')) createDummy(element);
        else createDummy((element as JQuery).find('.link-slot-dummy'));
    }

    /**
     * Create new link that wraps the children of the target when the target has self links
     * @param target Target element
     */
    export function createSelf(target: HTMLElements)
    {
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
    export function createDummy(target: HTMLElements)
    {
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

interface CommonActionOption
{
    target: string;
    listener?: [string, ...unknown[]][] | Action;
    handler?: [string, ...unknown[]][] | Action;

    once: boolean;
    defer: boolean;
    await: boolean;
}

interface ListenerOption extends CommonActionOption
{
    listener: [string, ...unknown[]][] | Action;
}

interface HandlerOption extends CommonActionOption
{
    handler: [string, ...unknown[]][] | Action;
}

function getConfig(element: HTMLElement): ListenerOption | HandlerOption | void
{
    if(
        element.classList.contains('event-listener') ||
        element.classList.contains('event-handler')
    )
        return {
            target: element.dataset.target!,
            listener: parseJSON(element.dataset.listener),
            handler: parseJSON(element.dataset.handler),
            once: 'once' in element.dataset,
            defer: 'defer' in element.dataset,
            await: 'await' in element.dataset,
        };
}

/** Stores action listeners or handlers */
export class LinkActionCollection
{
    /** Indicate whether any of action has already fired once */
    fired = false;

    /** Named actions storage */
    private actions: Record<string, Action> = {};

    /** Alias selectors storage */
    private aliases: [
        string | ((parent: JQuery<HTMLElement>) => HTMLElements),
        (
            | ListenerOption
            | HandlerOption
            | ((element: HTMLElement) => ListenerOption | HandlerOption)
        )
    ][] = [];

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
    constructor(handlers?: Record<string, Action> | LinkActionCollection)
    {
        if(handlers) {
            this.add(handlers);
            if(handlers instanceof LinkActionCollection) this.alias(handlers);
        }
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

    add(a: any, b?: Action | string)
    {
        switch(typeof a) {
            case 'string':
                const name = a;
                switch(typeof b) {
                    case 'function':
                        // Single action
                        this.actions[name] = b;
                        break;
                    case 'string':
                        // Single alias
                        if(b in this.actions) this.actions[name] = this.actions[b];
                        else throw new ReferenceError(`Action '${b}' is not exist`);
                        break;
                    default:
                        throw new TypeError(
                            'Action handler or listener is not function'
                        );
                }
                break;
            case 'object':
                if(a instanceof LinkActionCollection)
                    // Multiple actions
                    Object.assign(this.actions, a.actions);
                else if(Array.isArray(a) || a instanceof Set)
                    // Multiple aliases
                    switch(typeof b) {
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
                else for(const name in a) this.add(name, a[name]);
                break;
            default:
                throw TypeError(
                    'First argument is not name string or action object'
                );
        }
    }

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

    remove(name: string | string[] | Set<string>)
    {
        switch(typeof name) {
            case 'string':
                delete this.actions[name];
                break;
            case 'object':
                if(Array.isArray(name) || name instanceof Set)
                    name.forEach((name) => this.remove(name));
                break;
            default:
                throw new TypeError('Name is not string or array');
        }
    }

    /**
     * Register alias selectors for listener/handler
     * @param aliases LinkActionCollection or alias tuples each contains alias selector or function and listener/handler option or function
     */
    alias(
        aliases:
            | [
                string | ((parent: HTMLElement) => HTMLElements),
                (
                    | ListenerOption
                    | HandlerOption
                    | ((element: HTMLElement) => ListenerOption | HandlerOption)
                )
            ][]
            | LinkActionCollection
    ): void;

    /**
     * Register alias selector for listener/handler
     * @param selector alias selector or function that gets parent element and returns elements selected
     * @param option listener/handler option contains action or function that gets selected element and returns listener/handler option
     */
    alias(
        selector: string | ((parent: JQuery<HTMLElement>) => HTMLElements),
        option:
            | ListenerOption
            | HandlerOption
            | ((element: HTMLElement) => ListenerOption | HandlerOption)
    ): void;

    alias(selector: any, option?: any): void
    {
        switch(typeof selector) {
            case 'string':
            case 'function':
                switch(typeof option) {
                    case 'object':
                    case 'function':
                        this.aliases.push([selector, option]);
                        break;
                    default:
                        throw new TypeError('Option is not object or function');
                }
                break;
            default:
                if(Array.isArray(selector)) {
                    this.removeAlias(selector);
                    selector.forEach(([selector, option]) =>
                        this.alias(selector, option)
                    );
                } else if(selector instanceof LinkActionCollection) {
                    this.removeAlias(selector.aliases);
                    this.aliases = this.aliases.concat(selector.aliases);
                } else throw new TypeError('Selector is not string or function');
        }
    }

    /**
     * Unregister aliases
     * @param aliases LinkActionCollection or alias tuples each contains alias selector or function and listener/handler option or function
     */
    removeAlias(
        aliases:
            | [
                string | ((parent: JQuery<HTMLElement>) => HTMLElements),
                (
                    | ListenerOption
                    | HandlerOption
                    | ((element: HTMLElement) => ListenerOption | HandlerOption)
                )
            ][]
            | LinkActionCollection
    ): void;

    /**
     * Unregister alias
     * @param selector alias selector
     * @param option listener/handler option contains action
     */
    removeAlias(
        selector: string | ((parent: JQuery<HTMLElement>) => HTMLElements),
        option:
            | ListenerOption
            | HandlerOption
            | ((element: HTMLElement) => ListenerOption | HandlerOption)
    ): void;

    removeAlias(selector: any, option?: any)
    {
        if(selector instanceof LinkActionCollection) selector = selector.aliases;

        if(Array.isArray(selector))
            return selector.forEach(([selector, option]) =>
                this.removeAlias(selector, option)
            );

        if(!(typeof selector === 'string' || typeof selector === 'function'))
            throw new TypeError('Selector is not string or function');

        if(!(typeof option === 'object' || typeof option === 'function'))
            throw new TypeError('Option is not object or function');

        while(true) {
            const index = this.aliases.findIndex(
                ([sel, opt]) =>
                    sel === selector &&
                    (opt === option ||
                        (typeof opt === 'object' &&
                            typeof option === 'object' &&
                            (opt as ListenerOption).listener ===
                            (option as ListenerOption).listener &&
                            (opt as HandlerOption).handler ===
                            (option as HandlerOption).handler &&
                            opt.target === option.target))
            );
            if(Number.isInteger(index)) this.aliases.splice(index, 1);
            else break;
        }
    }

    /**
     * Apply the collection's actions to child elements which its listeners or handlers are defined
     * @param parent Target parent element
     */
    apply(parent: HTMLElements): void
    {
        if(this.fired) return;

        $('.event-listener-cloak').addClass('event-listener');
        $('.event-handler-cloak').addClass('event-handler');

        const collection = this;

        $<HTMLElement>(parent as any)
            .find('a')
            .each(function()
            {
                this.addEventListener('click', (event) =>
                {
                    const link = this;
                    const parents = $(this).parents().get().reverse();

                    let queue = Promise.resolve();
                    let awaiting = Promise.resolve();
                    let handler;

                    parents.forEach(parent =>
                    {
                        const option = getConfig(parent);
                        const options = collection.aliases
                            .filter(([selector]) =>
                            {
                                switch(typeof selector) {
                                    case 'string':
                                        return $(parent).is(selector);
                                    case 'function':
                                        return $<HTMLElement>(
                                            selector(
                                                $<HTMLElement>(parent as any)
                                            ) as any
                                        )
                                            .get()
                                            .includes(parent);
                                }
                            })
                            .map(([selector, option]) =>
                            {
                                switch(typeof option) {
                                    case 'object':
                                        return option;
                                    case 'function':
                                        return option(link);
                                }
                            });

                        if(option) options.unshift(option);

                        options.forEach(option =>
                        {
                            if(option.target !== 'link') return;

                            if(option.listener)
                        });
                    });
                });
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
    fork(): LinkActionCollection
    {
        return new LinkActionCollection(this);
    }

    /**
     * Execute action
     * @param event Event object for control and view details
     * @param args Arguments that passed into the action
     */
    execute(name: string, event: Event, ...args: unknown[])
    {
        return this.actions[name](event, ...args);
    }
}

export const linkModifier = new LinkModifierCollection();
export const linkAction = new LinkActionCollection();

registerRenderer(async () =>
{
    linkCreater.apply('#mw-content-text');
    await linkModifier.apply('#mw-content-text');
});
registerHandler(() => linkAction.apply('#mw-content-text'));
