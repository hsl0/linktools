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
        while (_) try {
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
var _a, _b;
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
var RESERVED_BEFORE = Symbol('modifiers reserved before');
var RESERVED_AFTER = Symbol('modifiers reserved after');
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
        /** Pre-modifier storage */
        this[_a] = new Map();
        /** Post-modifier storage */
        this[_b] = new Map();
        if (modifiers)
            this.add(modifiers);
    }
    LinkModifierCollection.prototype.add = function (a, modifier) {
        if (typeof a === 'string') {
            // Single modifier
            var name_1 = a;
            if (typeof modifier === 'function')
                this.modifiers[name_1] = modifier;
            else
                throw new TypeError('Modifier is not function');
        }
        else if (typeof a === 'object') {
            // Multiple modifiers
            var modifiers = a;
            if (modifiers instanceof LinkModifierCollection)
                Object.assign(this.modifiers, modifiers.modifiers);
            else
                for (var name_2 in modifiers)
                    this.add(name_2, modifiers[name_2]);
        }
        else
            throw TypeError('First argument is not name string or modifiers object');
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
     * Apply the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     */
    LinkModifierCollection.prototype.apply = function (element) {
        var collection = this;
        var globalPromise = Promise.resolve();
        var localPromises = [];
        if (this.fired)
            return globalPromise;
        // Pre-modifiers
        this[RESERVED_BEFORE].forEach(function (modifiers, element) {
            return $(element)
                .filter('a')
                .each(function () {
                var _this = this;
                modifiers.forEach(function (modifier) {
                    globalPromise = globalPromise.then(function () { return modifier(_this); });
                });
            });
        });
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
        // After-modifiers
        this[RESERVED_AFTER].forEach(function (modifiers, element) {
            return $(element)
                .filter('a')
                .each(function () {
                var _this = this;
                modifiers.forEach(function (modifier) {
                    return (globalPromise = globalPromise.then(function () {
                        return modifier(_this);
                    }));
                });
            });
        });
        this.fired = true;
        return globalPromise;
    };
    /**
     * Add pre link modifier for specific elements that runs before named modifiers run
     * @param element Target element of modifier
     * @param modifier Link modifier function
     */
    LinkModifierCollection.prototype.before = function (element, modifier) {
        var _c;
        var map = this[RESERVED_BEFORE];
        if (typeof modifier === 'function') {
            if (map.has(element))
                (_c = map.get(element)) === null || _c === void 0 ? void 0 : _c.add(modifier);
            else
                map.set(element, new Set().add(modifier));
        }
        else
            throw new TypeError('Modifier is not function');
    };
    /**
     * Add after link modifier for specific elements that runs after named modifiers run
     * @param element Target element of modifier
     * @param modifier Link modifier function
     */
    LinkModifierCollection.prototype.after = function (element, modifier) {
        var _c;
        var map = this[RESERVED_AFTER];
        if (typeof modifier === 'function') {
            if (map.has(element))
                (_c = map.get(element)) === null || _c === void 0 ? void 0 : _c.add(modifier);
            else
                map.set(element, new Set().add(modifier));
        }
        else
            throw new TypeError('Modifier is not function');
    };
    LinkModifierCollection.prototype.removeBefore = function (x) {
        var map = this[RESERVED_BEFORE];
        if (typeof x === 'function') {
            // By modifier function
            var modifier_1 = x;
            map.forEach(function (modifiers) { return modifiers.delete(modifier_1); });
        }
        else {
            // By target element
            var element = x;
            map.delete(element);
        }
    };
    LinkModifierCollection.prototype.removeAfter = function (x) {
        var map = this[RESERVED_AFTER];
        if (typeof x === 'function') {
            // By modifier function
            var modifier_2 = x;
            map.forEach(function (modifiers) { return modifiers.delete(modifier_2); });
        }
        else {
            // By target element
            var element = x;
            map.delete(element);
        }
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
_a = RESERVED_BEFORE, _b = RESERVED_AFTER;
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
/** Stores action listeners or handlers */
var LinkActionCollection = /** @class */ (function () {
    /**
     * Construct ActionCollection
     * @param handlers Object of actions that are being added for collection. Key for action name.
     */
    function LinkActionCollection(handlers) {
        /** Indicate whether any of action has already fired once */
        this.fired = false;
        /** Named actions storage */
        this.actions = {};
        if (handlers)
            this.add(handlers);
    }
    LinkActionCollection.prototype.add = function (a, action) {
        if (typeof a === 'string') {
            // Single action
            var name_3 = a;
            if (typeof action === 'function')
                this.actions[name_3] = action;
            else
                throw new TypeError('Action handler or listener is not function');
        }
        else if (typeof a === 'object') {
            // Multiple actions
            var action_1 = a;
            if (action_1 instanceof LinkActionCollection)
                Object.assign(this.actions, action_1.actions);
            else
                for (var name_4 in action_1)
                    this.add(name_4, action_1[name_4]);
        }
        else
            throw TypeError('First argument is not name string or action object');
    };
    /**
     * Unregister named action
     * @param name name of action
     */
    LinkActionCollection.prototype.remove = function (name) {
        if (name === 'string')
            delete this.actions[name];
        else
            throw new TypeError('Name is not string');
    };
    /**
     * Apply the collection's actions to child elements which its handlers are defined
     * @param element Target parent element
     */
    LinkActionCollection.prototype.apply = function (element) {
        if (this.fired)
            return;
        $('.event-listener-cloak').addClass('event-listener');
        $('.event-handler-cloak').addClass('event-handler');
        var collection = this;
        element = $(element);
        if (element.is('.event-listener[data-target="link"], .event-handler[data-target="link"]'))
            element = element.find('a');
        else
            element = element.find('.event-listener[data-target="link"] a, .event-handler[data-target="link"] a');
        element.each(function () {
            var _this = this;
            var listeners = {};
            var handlers = {};
            $(this)
                .parents('.event-listener[data-target="link"]')
                .each(function () {
                var actions = parseJSON(this.dataset.listener);
                if (actions)
                    for (var event_1 in actions) {
                        listeners[event_1] = __spreadArray(__spreadArray([], actions[event_1], true), (listeners[event_1] || []), true);
                    }
            });
            $(this)
                .parents('.event-handler[data-target="link"]')
                .get()
                .reverse()
                .forEach(function (handler) {
                var actions = parseJSON(handler.dataset.handler);
                if (actions)
                    for (var event_2 in actions) {
                        if (!handlers[event_2])
                            handlers[event_2] = actions[event_2];
                    }
            });
            new Set(__spreadArray(__spreadArray([], Object.keys(listeners), true), Object.keys(handlers), true)).forEach(function (eventName) {
                return $(_this).on(eventName, function (event) {
                    var _c, _d;
                    var _e = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        _e[_i - 1] = arguments[_i];
                    }
                    var prev = _e[0];
                    // if(!event.isTrusted && prev instanceof Event && prev.defaultPrevented && prev.fulfilled)
                    if ((prev === null || prev === void 0 ? void 0 : prev.isDefaultPrevented()) && (prev === null || prev === void 0 ? void 0 : prev.fulfilled)) {
                        return;
                    }
                    event.preventDefault();
                    event.pending = true;
                    event.settled = false;
                    event.fulfilled = false;
                    event.rejected = false;
                    var promise = Promise.resolve();
                    (_c = listeners[event.type]) === null || _c === void 0 ? void 0 : _c.forEach(function (_c) {
                        var name = _c[0], args = _c.slice(1);
                        promise = promise.then(function () {
                            return collection.execute.apply(collection, __spreadArray([name, event], args, false));
                        });
                    });
                    if (handlers[event.type])
                        (_d = handlers[event.type]) === null || _d === void 0 ? void 0 : _d.forEach(function (_c) {
                            var name = _c[0], args = _c.slice(1);
                            promise = promise.then(function () {
                                return collection.execute.apply(collection, __spreadArray([name, event], args, false));
                            });
                        });
                    else
                        event.promise =
                            promise.then(function (value) {
                                event.pending = false;
                                event.fulfilled = true;
                                event.settled = true;
                                if (event.type === 'click' &&
                                    //@ts-ignore target exists in JQuery.Event
                                    event.target
                                        .href)
                                    // prettier-ignore
                                    //@ts-ignore target exists in JQuery.Event
                                    location.href = event.target.href;
                                return value;
                            }, function (error) {
                                event.pending = false;
                                event.rejected = true;
                                event.settled = true;
                                throw error;
                            });
                });
            });
        });
        this.fired = true;
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
        var _c;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return (_c = this.actions)[name].apply(_c, __spreadArray([event], args, false));
    };
    return LinkActionCollection;
}());
exports.LinkActionCollection = LinkActionCollection;
exports.linkModifier = new LinkModifierCollection();
exports.linkAction = new LinkActionCollection();
registerRenderer(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                linkCreater.apply('#mw-content-text');
                return [4 /*yield*/, exports.linkModifier.apply('#mw-content-text')];
            case 1:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
registerHandler(function () { return exports.linkAction.apply('#mw-content-text'); });
//# sourceMappingURL=LinkTools.js.map