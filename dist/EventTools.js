'use strict';
var __spreadArray =
    (this && this.__spreadArray) ||
    function (to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
Object.defineProperty(exports, '__esModule', { value: true });
var common_1 = require('./common');
/**
 * Strip prefix from camelCase names.
 * @param prefix Prefix to strip from name
 * @param name CamelCase name that starts from prefix
 * @returns Name without prefix
 */
function stripCamelCasePrefix(prefix, name) {
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
function setCamelCasePrefix(prefix, name) {
    var _a;
    return (
        prefix +
        ((_a = name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) +
        name.slice(1)
    );
}
var flags = new Set(['once', 'defer', 'await']);
/**
 * Parse event declaration (flags, action name, arguments)
 * @param str original declaration text
 * @returns EventDeclaration object (flags and call; call = [action name, ...arguments])
 */
function parseEventDeclaration(str) {
    var _a;
    var obj = {
        once: false,
        defer: false,
        await: false,
    };
    if (typeof str !== 'string')
        throw new TypeError('Argument of parseEventDeclaration is not string');
    var pos = str.trim().search(/\s+/); // 공백 찾고 위치 저장
    while (pos !== -1) {
        // 공백이 존재하면
        var unit = str.trim().slice(0, str.search(/\s+/)); // 시작에서 공백까지의 내용
        if (
            flags.has(unit) // unit이 flags 중 하나와 일치하면
        ) {
            obj[unit] = true; // 일치한 flag를 참으로 저장
            str = str.slice(pos); // 시작부터 unit 까지의 내용을 제거함
            pos = str.trim().search(/\s+/); // 다음 공백을 찾고 위치 저장
        } else break; // unit이 flags와 일치하지 않으면 반복 종료
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    (_a = JSON.parse(str)), (obj.action = _a[0]), (obj.arguments = _a.slice(1)); // JSON 파싱 시도
    if (typeof obj.action !== 'string')
        throw new TypeError('마지막에 첫번째 값이 문자열인 배열이 오지 않았음');
    return obj;
}
/** Allowed event types and mapping from virtual name to actual name */
var eventTypes = {
    click: 'click',
};
/** Stores action listeners or handlers */
var LinkActionCollection = /** @class */ (function () {
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
    function LinkActionCollection(handlers) {
        /** Named actions storage */
        this.actions = {};
        if (handlers) {
            this.add(handlers);
            // if (handlers instanceof LinkActionCollection) this.alias(handlers);
        }
        this.eventHandler = this.eventHandler.bind(this);
    }
    LinkActionCollection.prototype.add = function (a, b) {
        var _this = this;
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
                                "Action '".concat(b, "' is not exist")
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
                            a.forEach(function (name) {
                                return _this.add(name, b);
                            });
                            break;
                        default:
                            throw new TypeError(
                                'Second argument is not function or string'
                            );
                    }
                //@ts-ignore Valid union overload
                else for (var name_1 in a) this.add(name_1, a[name_1]);
                break;
            default:
                throw TypeError(
                    'First argument is not name string or action object'
                );
        }
    };
    LinkActionCollection.prototype.remove = function (name) {
        var _this = this;
        switch (typeof name) {
            case 'string':
                delete this.actions[name];
                break;
            case 'object':
                if (Array.isArray(name) || name instanceof Set)
                    name.forEach(function (name) {
                        return _this.remove(name);
                    });
                break;
            default:
                throw new TypeError('Name is not string or array');
        }
    };
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
    LinkActionCollection.prototype.mount = function (parent, _a) {
        var _b = _a === void 0 ? { force: false } : _a,
            force = _b.force;
        //@ts-ignore Valid union overload
        var $parent = $(parent);
        if (!force && $parent.hasClass('event-mounted')) return;
        $parent.find('.event-listener-cloak').addClass('event-listener');
        $parent.find('.event-handler-cloak').addClass('event-handler');
        var collection = this;
        $parent.find('.event-listener a, .event-handler a').each(function () {
            var link = this;
            var listening = new Set();
            $(this)
                .parents(
                    '.event-listener[data-target="link"], .event-handler[data-target="link"]'
                )
                .each(function () {
                    for (var key in this.dataset) {
                        var type = void 0;
                        var prefix = void 0;
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
                                        '[data-'
                                            .concat(prefix, '-')
                                            .concat(
                                                type,
                                                '] \uC18D\uC131\uC774 \uBE44\uC5B4\uC788\uC2B5\uB2C8\uB2E4'
                                            )
                                    );
                                var action = parseEventDeclaration(
                                    this.dataset[key]
                                ).action;
                                if (!collection.actions[action])
                                    throw new TypeError(
                                        "\uB3D9\uC791 '".concat(
                                            action,
                                            "'\uC740(\uB294) \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
                                        )
                                    );
                            } catch (error) {
                                (0, common_1.printError)(this, error.message);
                                return;
                            }
                        listening.add(type);
                    }
                });
            listening.forEach(function (type) {
                // Already bound in constructor
                // eslint-disable-next-line @typescript-eslint/unbound-method
                return link.addEventListener(type, collection.eventHandler);
            });
        });
        $parent
            .find(
                '.event-listener-cloak:not([data-target]), .event-handler-cloak:not([data-target])'
            )
            .each(function () {
                (0,
                common_1.printError)(this, '[data-target] 속성에 이벤트 적용 대상이 지정되지 않았습니다');
            });
        $parent.addClass('event-mounted');
        $parent
            .find('.event-listener-cloak, .event-handler-cloak')
            .removeClass(['event-listener-cloak', 'event-handler-cloak']);
    };
    /**
     * Forks actions collection
     * @returns New action collection that contains member actions of this collection
     */
    LinkActionCollection.prototype.fork = function () {
        return new LinkActionCollection(this);
    };
    /**
     * Execute action
     * @param event Event object for control and view details
     * @param args Arguments that passed into the action
     */
    LinkActionCollection.prototype.execute = function (name, event) {
        var _a;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_a = this.actions)[name].apply(
            _a,
            __spreadArray([event], args, false)
        );
    };
    LinkActionCollection.prototype.eventHandler = function (event) {
        var collection = this;
        var $handlers = $(event.target).parents('.event-handler');
        var $listeners = $(event.target).parents('.event-listener');
        if ($handlers.length) {
            for (var index = 1; index <= $handlers.length; index++) {
                var handler = $handlers.get($handlers.length - index);
                var key = setCamelCasePrefix('handle', event.type);
                var declarationStr = handler.dataset[key];
                try {
                    if (typeof declarationStr !== 'string')
                        throw new TypeError(
                            '[data-handle-'.concat(
                                event.type,
                                '] \uC18D\uC131\uC774 \uC5C6\uC74C'
                            )
                        );
                    var declaration = parseEventDeclaration(declarationStr);
                    collection.execute.apply(
                        collection,
                        __spreadArray(
                            [declaration.action, event],
                            declaration.arguments,
                            false
                        )
                    );
                    event.preventDefault();
                    if (declaration.once) {
                        delete handler.dataset[key];
                        handler.removeAttribute('data-handle-' + event.type);
                        if (
                            !Object.keys(handler.dataset).filter(function (
                                key
                            ) {
                                return /^handle[A-Z]/.test(key);
                            }).length
                        )
                            handler.classList.remove('event-handler');
                    }
                    break;
                } catch (error) {
                    console.error(handler, error);
                }
            }
        } else if ($listeners.length) {
            var queue_1 = Promise.resolve();
            var awaiting_1 = Promise.resolve();
            event.preventDefault();
            $listeners.each(function () {
                var key = setCamelCasePrefix('listen', event.type);
                var declarationStr = this.dataset[key];
                if (typeof declarationStr !== 'string')
                    throw new TypeError(
                        '[data-listen-'.concat(
                            event.type,
                            '] \uC18D\uC131\uC774 \uC5C6\uC74C'
                        )
                    );
                var declaration = parseEventDeclaration(declarationStr);
                var promise = (
                    declaration.defer
                        ? Promise.all([awaiting_1, queue_1])
                        : awaiting_1
                ).then(function () {
                    return collection.execute.apply(
                        collection,
                        __spreadArray(
                            [declaration.action, event],
                            declaration.arguments,
                            false
                        )
                    );
                });
                if (declaration.await)
                    awaiting_1 = Promise.all([awaiting_1, promise]);
                if (declaration.once) {
                    delete this.dataset[key];
                    this.removeAttribute('data-listen-' + event.type);
                    if (
                        !Object.keys(this.dataset).filter(function (key) {
                            return /^listen[A-Z]/.test(key);
                        }).length
                    )
                        this.classList.remove('event-handler');
                }
            });
            // Defered link default click event
            void Promise.all([awaiting_1, queue_1]).then(function () {
                var href = event.target.href;
                if (href) location.href = href;
            });
        } else {
            event.target.removeEventListener(
                event.type,
                // Already bound in constructor
                // eslint-disable-next-line @typescript-eslint/unbound-method
                this.eventHandler
            );
        }
    };
    return LinkActionCollection;
})();
exports.default = LinkActionCollection;
//# sourceMappingURL=eventtools.js.map
