import { printError } from './common';
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

/**
 * Strip prefix from camelCase names.
 * @param prefix Prefix to strip from name
 * @param name CamelCase name that starts from prefix
 * @returns Name without prefix
 */
function stripCamelCasePrefix(prefix: string, name: string): string {
    if (name.length < prefix.length)
        throw new TypeError('Name should contain prefix');
    return name[prefix.length].toLowerCase() + name.slice(prefix.length + 1);
}

/**
 * Set camelCase prefix to name.
 * @param prefix Prefix to prepend
 * @param name Name to append
 * @returns Joined name
 */
function setCamelCasePrefix(prefix: string, name: string): string {
    return prefix + name[0]?.toUpperCase() + name.slice(1);
}
type SetMember<T> = T extends Set<infer U> ? U : never;
const flags = new Set<keyof EventFlags>(['once', 'defer', 'await']);

interface EventFlags {
    /** This action is executed once */
    once: boolean;
    /** This action is executed when outer actions are done */
    defer: boolean;
    /** Inner actions are executed after this action is done */
    await: boolean;
}

interface EventDeclaration extends EventFlags {
    /** action name */
    action: string;
    /** action arguments */
    arguments: unknown[];
}

/**
 * Parse event declaration (flags, action name, arguments)
 * @param str original declaration text
 * @returns EventDeclaration object (flags and call; call = [action name, ...arguments])
 */
function parseEventDeclaration(str: string): EventDeclaration {
    const obj: Partial<EventDeclaration> = {
        once: false,
        defer: false,
        await: false,
    };

    if (typeof str !== 'string')
        throw new TypeError('Argument of parseEventDeclaration is not string');

    let pos = str.trim().search(/\s+/); // 공백 찾고 위치 저장

    while (pos !== -1) {
        // 공백이 존재하면
        const unit = str.trim().slice(0, str.search(/\s+/)); // 시작에서 공백까지의 내용
        if (
            (flags.has as (value: unknown) => value is SetMember<typeof flags>)(
                unit
            ) // unit이 flags 중 하나와 일치하면
        ) {
            obj[unit] = true; // 일치한 flag를 참으로 저장
            str = str.slice(pos); // 시작부터 unit 까지의 내용을 제거함
            pos = str.trim().search(/\s+/); // 다음 공백을 찾고 위치 저장
        } else break; // unit이 flags와 일치하지 않으면 반복 종료
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    [obj.action, ...obj.arguments] = JSON.parse(str); // JSON 파싱 시도

    if (typeof obj.action !== 'string')
        throw new TypeError('마지막에 첫번째 값이 문자열인 배열이 오지 않았음');

    return obj as EventDeclaration;
}

/** Allowed event types and mapping from virtual name to actual name */
const eventTypes: Record<string, string> = {
    click: 'click',
};

/** Stores action listeners or handlers */
export default class LinkActionCollection {
    /** Named actions storage */
    private actions: Record<string, Action> = {};

    // /** Alias selectors storage */
    // private aliases: [
    //     string | ((parent: JQuery<HTMLElement>) => HTMLElements),
    //     (
    //         | ListenerOption
    //         | HandlerOption
    //         | ((element: HTMLElement) => ListenerOption | HandlerOption)
    //     )
    // ][] = [];

    /**
     * Construct ActionCollection
     * @param handlers Object of actions that are being added for collection. Key for action name.
     */
    constructor(handlers?: Record<string, Action> | LinkActionCollection) {
        if (handlers) {
            this.add(handlers);
            // if (handlers instanceof LinkActionCollection) this.alias(handlers);
        }
        this.eventHandler = this.eventHandler.bind(this);
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

    add(
        a:
            | string
            | string[]
            | Set<string>
            | Record<string, Action | string>
            | LinkActionCollection,
        b?: Action | string
    ) {
        switch (typeof a) {
            case 'string':
                // name = a
                switch (typeof b) {
                    case 'function':
                        // Single action
                        this.actions[a] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.actions)
                            this.actions[a] = this.actions[b];
                        else
                            throw new ReferenceError(
                                `Action '${b}' is not exist`
                            );
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
                //@ts-ignore Valid union overload
                else for (const name in a) this.add(name, a[name]);
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

    remove(name: string | string[] | Set<string>) {
        switch (typeof name) {
            case 'string':
                delete this.actions[name];
                break;
            case 'object':
                if (Array.isArray(name) || name instanceof Set)
                    name.forEach((name) => this.remove(name));
                break;
            default:
                throw new TypeError('Name is not string or array');
        }
    }

    // /**
    //  * Register alias selectors for listener/handler
    //  * @param aliases LinkActionCollection or alias tuples each contains alias selector or function and listener/handler option or function
    //  */
    // alias(
    //     aliases:
    //         | [
    //               string | ((parent: HTMLElement) => HTMLElements),
    //               (
    //                   | ListenerOption
    //                   | HandlerOption
    //                   | ((element: HTMLElement) => ListenerOption | HandlerOption)
    //               )
    //           ][]
    //         | LinkActionCollection
    // ): void;

    // /**
    //  * Register alias selector for listener/handler
    //  * @param selector alias selector or function that gets parent element and returns elements selected
    //  * @param option listener/handler option contains action or function that gets selected element and returns listener/handler option
    //  */
    // alias(
    //     selector: string | ((parent: JQuery<HTMLElement>) => HTMLElements),
    //     option:
    //         | ListenerOption
    //         | HandlerOption
    //         | ((element: HTMLElement) => ListenerOption | HandlerOption)
    // ): void;

    // alias(selector: any, option?: any): void {
    //     switch (typeof selector) {
    //         case 'string':
    //         case 'function':
    //             switch (typeof option) {
    //                 case 'object':
    //                 case 'function':
    //                     this.aliases.push([selector, option]);
    //                     break;
    //                 default:
    //                     throw new TypeError('Option is not object or function');
    //             }
    //             break;
    //         default:
    //             if (Array.isArray(selector)) {
    //                 this.removeAlias(selector);
    //                 selector.forEach(([selector, option]) =>
    //                     this.alias(selector, option)
    //                 );
    //             } else if (selector instanceof LinkActionCollection) {
    //                 this.removeAlias(selector.aliases);
    //                 this.aliases = this.aliases.concat(selector.aliases);
    //             } else throw new TypeError('Selector is not string or function');
    //     }
    // }

    // /**
    //  * Unregister aliases
    //  * @param aliases LinkActionCollection or alias tuples each contains alias selector or function and listener/handler option or function
    //  */
    // removeAlias(
    //     aliases:
    //         | [
    //               string | ((parent: JQuery<HTMLElement>) => HTMLElements),
    //               (
    //                   | ListenerOption
    //                   | HandlerOption
    //                   | ((element: HTMLElement) => ListenerOption | HandlerOption)
    //               )
    //           ][]
    //         | LinkActionCollection
    // ): void;

    // /**
    //  * Unregister alias
    //  * @param selector alias selector
    //  * @param option listener/handler option contains action
    //  */
    // removeAlias(
    //     selector: string | ((parent: JQuery<HTMLElement>) => HTMLElements),
    //     option:
    //         | ListenerOption
    //         | HandlerOption
    //         | ((element: HTMLElement) => ListenerOption | HandlerOption)
    // ): void;

    // removeAlias(selector: any, option?: any) {
    //     if (selector instanceof LinkActionCollection) selector = selector.aliases;

    //     if (Array.isArray(selector))
    //         return selector.forEach(([selector, option]) =>
    //             this.removeAlias(selector, option)
    //         );

    //     if (!(typeof selector === 'string' || typeof selector === 'function'))
    //         throw new TypeError('Selector is not string or function');

    //     if (!(typeof option === 'object' || typeof option === 'function'))
    //         throw new TypeError('Option is not object or function');

    //     while (true) {
    //         const index = this.aliases.findIndex(
    //             ([sel, opt]) =>
    //                 sel === selector &&
    //                 (opt === option ||
    //                     (typeof opt === 'object' &&
    //                         typeof option === 'object' &&
    //                         (opt as ListenerOption).listener ===
    //                             (option as ListenerOption).listener &&
    //                         (opt as HandlerOption).handler ===
    //                             (option as HandlerOption).handler &&
    //                         opt.target === option.target))
    //         );
    //         if (Number.isInteger(index)) this.aliases.splice(index, 1);
    //         else break;
    //     }
    // }

    /**
     * Mount the collection's actions to child elements which its listeners or handlers are defined
     * @param parent Target parent element
     * @param options Mount options
     */
    mount(
        parent: HTMLElements,
        {
            force,
        }: {
            /** If true, always mount even when already mounted. If false, don't mount when already mounted. Default is false. */
            force: boolean;
        } = { force: false }
    ): void {
        //@ts-ignore Valid union overload
        const $parent: JQuery<HTMLElement> = $(parent);

        if (!force && $parent.hasClass('event-mounted')) return;

        $parent.find('.event-listener-cloak').addClass('event-listener');
        $parent.find('.event-handler-cloak').addClass('event-handler');

        const collection = this;

        $parent.find('.event-listener a, .event-handler a').each(function () {
            const link = this;
            const listening = new Set<string>();

            $(this)
                .parents(
                    '.event-listener[data-target="link"], .event-handler[data-target="link"]'
                )
                .each(function () {
                    for (const key in this.dataset) {
                        let type: string;
                        let prefix: string;

                        // Test if the key has 'listen-' or 'handle-' prefix.
                        if (/^listen[A-Z]/.test(key)) {
                            type = stripCamelCasePrefix('listen', key);
                            prefix = 'listen';
                        } else if (/^handle[A-Z]/.test(key)) {
                            type = stripCamelCasePrefix('handle', key);
                            prefix = 'handle';
                        } else continue;

                        if (!eventTypes[type]) continue;

                        if (
                            this.classList.contains('.event-listener-cloak') ||
                            this.classList.contains('.event-handler-cloak')
                        )
                            try {
                                if (this.dataset[key] !== 'string')
                                    throw new TypeError(
                                        `[data-${prefix}-${type}] 속성이 비어있습니다`
                                    );
                                const { action } = parseEventDeclaration(
                                    this.dataset[key]!
                                );
                                if (!collection.actions[action])
                                    throw new TypeError(
                                        `동작 '${action}'은(는) 존재하지 않습니다`
                                    );
                            } catch (error) {
                                printError(this, (error as Error).message);
                                return;
                            }

                        listening.add(type);
                    }
                });

            listening.forEach((type) =>
                // Already bound in constructor
                // eslint-disable-next-line @typescript-eslint/unbound-method
                link.addEventListener(type, collection.eventHandler)
            );
        });

        $parent
            .find(
                '.event-listener-cloak:not([data-target]), .event-handler-cloak:not([data-target])'
            )
            .each(function () {
                printError(
                    this,
                    '[data-target] 속성에 이벤트 적용 대상이 지정되지 않았습니다'
                );
            });

        $parent.addClass('event-mounted');

        $parent
            .find('.event-listener-cloak, .event-handler-cloak')
            .removeClass(['event-listener-cloak', 'event-handler-cloak']);
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
    execute(name: string, event: Event, ...args: unknown[]) {
        return this.actions[name](event, ...args);
    }

    private eventHandler(event: Event) {
        const collection = this;
        const $handlers = $(event.target as HTMLElement).parents(
            '.event-handler'
        );
        const $listeners = $(event.target as HTMLElement).parents(
            '.event-listener'
        );

        if ($handlers.length) {
            for (let index = 1; index <= $handlers.length; index++) {
                const handler = $handlers.get($handlers.length - index)!;
                const key = setCamelCasePrefix('handle', event.type);
                const declarationStr = handler.dataset[key];

                try {
                    if (typeof declarationStr !== 'string')
                        throw new TypeError(
                            `[data-handle-${event.type}] 속성이 없음`
                        );

                    const declaration = parseEventDeclaration(declarationStr);

                    collection.execute(
                        declaration.action,
                        event,
                        ...declaration.arguments
                    );

                    event.preventDefault();

                    if (declaration.once) {
                        delete handler.dataset[key];
                        handler.removeAttribute('data-handle-' + event.type);

                        if (
                            !Object.keys(handler.dataset).filter((key) =>
                                /^handle[A-Z]/.test(key)
                            ).length
                        )
                            handler.classList.remove('event-handler');
                    }

                    break;
                } catch (error) {
                    console.error(handler, error);
                }
            }
        } else if ($listeners.length) {
            const queue: PromiseLike<unknown> = Promise.resolve();
            let awaiting: PromiseLike<unknown> = Promise.resolve();

            event.preventDefault();

            $listeners.each(function () {
                const key = setCamelCasePrefix('listen', event.type);
                const declarationStr = this.dataset[key];

                if (typeof declarationStr !== 'string')
                    throw new TypeError(
                        `[data-listen-${event.type}] 속성이 없음`
                    );

                const declaration = parseEventDeclaration(declarationStr);

                const promise = (
                    declaration.defer
                        ? Promise.all([awaiting, queue])
                        : awaiting
                ).then(() =>
                    collection.execute(
                        declaration.action,
                        event,
                        ...declaration.arguments
                    )
                );

                if (declaration.await)
                    awaiting = Promise.all([awaiting, promise]);

                if (declaration.once) {
                    delete this.dataset[key];
                    this.removeAttribute('data-listen-' + event.type);

                    if (
                        !Object.keys(this.dataset).filter((key) =>
                            /^listen[A-Z]/.test(key)
                        ).length
                    )
                        this.classList.remove('event-handler');
                }
            });

            // Defered link default click event
            void Promise.all([awaiting, queue]).then(() => {
                const href = (event.target as HTMLAnchorElement).href;
                if (href) location.href = href;
            });
        } else {
            (event.target as HTMLElement).removeEventListener(
                event.type,
                // Already bound in constructor
                // eslint-disable-next-line @typescript-eslint/unbound-method
                this.eventHandler
            );
        }
    }
}
