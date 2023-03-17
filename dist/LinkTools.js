"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkAction = exports.linkModifier = exports.LinkActionCollection = exports.linkCreater = exports.LinkModifierCollection = void 0;
function parseJSON(json, reviver) {
    try {
        return JSON.parse(json, reviver);
    }
    catch (error) {
        if (!(error instanceof SyntaxError))
            throw error;
    }
}
/** Stores link modifiers */
var LinkModifierCollection = /** @class */ (function () {
    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    function LinkModifierCollection(modifiers) {
        /** Indicate whether any of modifier has already fired once */
        this.fired = false;
        /** Named modifier storage */
        this.modifiers = {};
        if (modifiers)
            this.add(modifiers);
    }
    LinkModifierCollection.prototype.add = function (a, b) {
        var _this = this;
        switch (typeof a) {
            case 'string':
                var name_1 = a;
                switch (typeof b) {
                    case 'function':
                        // Single modifier
                        this.modifiers[name_1] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.modifiers)
                            this.modifiers[name_1] = this.modifiers[b];
                        else
                            throw new ReferenceError("Link modifier '".concat(b, "' is not exist"));
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
                            a.forEach(function (name) { return _this.add(name, b); });
                            break;
                        default:
                            throw new TypeError('Second argument is not function or string');
                    }
                // Multiple modifiers
                else
                    for (var name_2 in a)
                        this.add(name_2, a[name_2]);
                break;
            default:
                throw TypeError('First argument is not name string or modifiers object');
        }
    };
    /**
     * Unregister named link modifier
     * @param name Name of link modifier
     */
    LinkModifierCollection.prototype.remove = function (name) {
        if (name === 'string')
            delete this.modifiers[name];
        else
            throw new TypeError('Name is not string');
    };
    /**
     * Mount the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     */
    LinkModifierCollection.prototype.mount = function (element) {
        var collection = this;
        var globalPromise = Promise.resolve();
        var localPromises = [];
        if (this.fired)
            return globalPromise;
        // Named modifiers
        $('.link-modifier-cloak').addClass('link-modifier');
        element = $(element);
        if (element.is('.link-modifier'))
            element = element.find('a');
        else
            element = element.find('.link-modifier a');
        element.each(function () {
            var link = this;
            var localPromise = Promise.resolve();
            $(this)
                .parents('.link-modifier')
                .each(function () {
                var _this = this;
                var name = this.dataset.modifier;
                if (!name) {
                    console.error(this, new TypeError('Modifier name is not specified at data-modifier attribute'));
                    return;
                }
                localPromise = localPromise
                    .then(function () { return collection.modifiers[name](link, _this); })
                    .then(function () { return _this.classList.remove('link-modifier-cloak'); });
            });
            localPromises.push(localPromise);
        });
        globalPromise = globalPromise.then(function () { return Promise.allSettled(localPromises); });
        this.fired = true;
        return globalPromise;
    };
    /**
     * Forks modifiers collection
     * @returns New modifiers collection that contains member modifiers of this collection
     */
    LinkModifierCollection.prototype.fork = function () {
        return new LinkModifierCollection(this);
    };
    return LinkModifierCollection;
}());
exports.LinkModifierCollection = LinkModifierCollection;
var linkCreater;
(function (linkCreater) {
    /**
     * Create new links that needed
     * @param element Target parent element
     */
    function apply(element) {
        element = $(element);
        if (element.is('.link-slot-self'))
            createSelf(element);
        else
            createSelf(element.find('.link-slot-self'));
        if (element.is('.link-slot-dummy'))
            createDummy(element);
        else
            createDummy(element.find('.link-slot-dummy'));
    }
    linkCreater.apply = apply;
    /**
     * Create new link that wraps the children of the target when the target has self links
     * @param target Target element
     */
    function createSelf(target) {
        $(target)
            .not(':has(a)')
            .not(':has(.link-slot-self)')
            .not(':has(.link-slot-dummy)')
            .wrapInner($('<a />', {
            class: 'link-self',
            href: location.href,
        }));
    }
    linkCreater.createSelf = createSelf;
    /**
     * Create new link that wraps the children of the target when the target has no links
     * @param target Target element
     */
    function createDummy(target) {
        $(target)
            .not(':has(a)')
            .not(':has(.link-slot-self)')
            .not(':has(.link-slot-dummy)')
            .wrapInner($('<a />', {
            class: 'link-dummy',
        }));
    }
    linkCreater.createDummy = createDummy;
})(linkCreater = exports.linkCreater || (exports.linkCreater = {}));
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
    return prefix + ((_a = name[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) + name.slice(1);
}
/** Strip 'on' prefix from camelCase event type name. */
var stripEventTypePrefix = stripCamelCasePrefix.bind(null, 'on');
/** Set 'on' camelCase prefix to event type name */
var setEventTypePrefix = setCamelCasePrefix.bind(null, 'on');
var allowedTypes = {
    click: 'click',
};
function removeData(element, key) {
    delete element.dataset[key];
    element.removeAttribute('data-' + key);
}
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
        /** Indicate whether any of action has already mounted once */
        this.mounted = false;
        /** Named actions storage */
        this.actions = {};
        if (handlers) {
            this.add(handlers);
            // if (handlers instanceof LinkActionCollection) this.alias(handlers);
        }
    }
    LinkActionCollection.prototype.add = function (a, b) {
        var _this = this;
        switch (typeof a) {
            case 'string':
                var name_3 = a;
                switch (typeof b) {
                    case 'function':
                        // Single action
                        this.actions[name_3] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.actions)
                            this.actions[name_3] = this.actions[b];
                        else
                            throw new ReferenceError("Action '".concat(b, "' is not exist"));
                        break;
                    default:
                        throw new TypeError('Action handler or listener is not function');
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
                            a.forEach(function (name) { return _this.add(name, b); });
                            break;
                        default:
                            throw new TypeError('Second argument is not function or string');
                    }
                // Multiple actions
                else
                    for (var name_4 in a)
                        this.add(name_4, a[name_4]);
                break;
            default:
                throw TypeError('First argument is not name string or action object');
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
                    name.forEach(function (name) { return _this.remove(name); });
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
     */
    LinkActionCollection.prototype.mount = function (parent) {
        if (this.mounted)
            return;
        $('.event-listener-cloak').addClass('event-listener');
        $('.event-handler-cloak').addClass('event-handler');
        var collection = this;
        $(parent)
            .find('.event-listener a, .event-handler a')
            .each(function () {
            var link = this;
            var eventTypes = new Set();
            $(this)
                .parents('.event-listener, .event-handler')
                .each(function () {
                for (var key in this.dataset) {
                    // Test if the key has 'on-' prefix.
                    if (!/^on[A-Z]/.test(key))
                        continue;
                    var type = stripEventTypePrefix(key);
                    if (!allowedTypes[type])
                        continue;
                    eventTypes.add(type);
                }
            });
            eventTypes.forEach(function (type) {
                return link.addEventListener(type, collection.eventHandler);
            });
        });
        this.mounted = true;
        $('.event-listener-cloak, .event-handler-cloak').removeClass([
            'event-listener-cloak',
            'event-handler-cloak',
        ]);
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
        return (_a = this.actions)[name].apply(_a, __spreadArray([event], args, false));
    };
    LinkActionCollection.prototype.eventHandler = function (event) {
        var collection = this;
        var queue = Promise.resolve();
        var awaiting = Promise.resolve();
        var $parents = $(event.target).parents(".event-handler[data-on-".concat(event.type, "], .event-listener[data-on-").concat(event.type, "]"));
        if (!$parents.length) {
            event.target.removeEventListener(event.type, this.eventHandler);
            return;
        }
        $parents.each(function () {
            var _this = this;
            var promise = ('defer' in this.dataset ? Promise.all([awaiting, queue]) : awaiting).then(function () {
                return collection.execute.apply(collection, __spreadArray(['all',
                    event], parseJSON(_this.dataset[setEventTypePrefix(event.type)]), false));
            });
            if ('await' in this.dataset)
                promise.then(function (promise) {
                    awaiting = Promise.all([awaiting, promise]);
                });
            if ('once' in this.dataset) {
                for (var key in this.dataset) {
                    if (!/^on[A-Z]/.test(key))
                        continue;
                    delete this.dataset[key];
                    this.removeAttribute('data-on-' + stripEventTypePrefix(key));
                }
                this.classList.remove('event-listener', 'event-handler');
                removeData(this, 'await');
                removeData(this, 'defer');
                removeData(this, 'once');
            }
        });
    };
    return LinkActionCollection;
}());
exports.LinkActionCollection = LinkActionCollection;
exports.linkModifier = new LinkModifierCollection();
exports.linkAction = new LinkActionCollection();
registerRenderer(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                linkCreater.apply('#mw-content-text');
                return [4 /*yield*/, exports.linkModifier.mount('#mw-content-text')];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
registerHandler(function () { return exports.linkAction.mount('#mw-content-text'); });
//# sourceMappingURL=LinkTools.js.map