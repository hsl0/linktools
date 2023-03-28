'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var common_1 = require('./common');
/** Stores link modifiers */
var LinkModifierCollection = /** @class */ (function () {
    /**
     * Construct LinkModifierCollection
     * @param modifiers Object of link modifiers that are being added for collection. Key for modifier's name.
     */
    function LinkModifierCollection(modifiers) {
        /** Named modifier storage */
        this.modifiers = {};
        if (modifiers) this.register(modifiers);
    }
    LinkModifierCollection.prototype.register = function (a, b) {
        var _this = this;
        switch (typeof a) {
            case 'string':
                // name = a;
                if (this.modifiers[a]) {
                    this.modifiers[a] = function () {
                        throw new Error(
                            "\uB9C1\uD06C \uC218\uC815\uC790 '".concat(
                                a,
                                "'\uC774(\uAC00) \uC911\uBCF5\uC73C\uB85C \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4"
                            )
                        );
                    };
                    throw new TypeError(
                        "Link modifier '".concat(a, "' is already defined")
                    );
                }
                switch (typeof b) {
                    case 'function':
                        // Single modifier
                        this.modifiers[a] = b;
                        break;
                    case 'string':
                        // Single alias
                        if (b in this.modifiers)
                            this.modifiers[a] = this.modifiers[b];
                        else
                            throw new ReferenceError(
                                "Link modifier '".concat(b, "' is not exist")
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
                            a.forEach(function (name) {
                                return _this.register(name, b);
                            });
                            break;
                        default:
                            throw new TypeError(
                                'Second argument is not function or string'
                            );
                    }
                // Multiple modifiers
                //@ts-ignore Valid union overload
                else for (var name_1 in a) this.register(name_1, a[name_1]);
                break;
            default:
                throw TypeError(
                    'First argument is not name string or modifiers object'
                );
        }
    };
    // /**
    //  * Unregister named link modifier
    //  * @param name Name of link modifier
    //  */
    // remove(name: string): void {
    //     if (name === 'string') delete this.modifiers[name];
    //     else throw new TypeError('Name is not string');
    // }
    /**
     * Mount the collection's modifiers to child elements which its modifiers are defined
     * @param element Target parent element
     * @param options Mount options
     * @returns Async modification promise
     */
    LinkModifierCollection.prototype.mount = function (element, _a) {
        var _b = _a === void 0 ? { force: false } : _a,
            force = _b.force;
        var collection = this;
        var globalPromise = Promise.resolve();
        var localPromises = [];
        // Named modifiers
        $('.link-modifier-cloak').addClass('link-modifier');
        //@ts-ignore Valid union overload
        element = $(element);
        if (element.is('.link-modifier')) element = element.find('a');
        else element = element.find('.link-modifier a');
        element.each(function () {
            var link = this;
            var localPromise = Promise.resolve();
            $(this)
                .parents('.link-modifier')
                .each(function () {
                    var _this = this;
                    if (!force && this.classList.contains('link-modified'))
                        return;
                    var name = this.dataset.modifier;
                    if (!name) {
                        console.error(
                            this,
                            new TypeError(
                                'data-modifier 속성에 링크 수정자를 지정하지 않았습니다'
                            )
                        );
                        if (this.classList.contains('link-modifier-cloak'))
                            (0, common_1.printError)(
                                this,
                                'data-modifier 속성에 링크 수정자를 지정하지 않았습니다'
                            );
                        return;
                    }
                    if (!collection.modifiers[name]) {
                        console.error(
                            this,
                            new TypeError(
                                "\uB9C1\uD06C \uC218\uC815\uC790 '".concat(
                                    name,
                                    "'\uC740(\uB294) \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
                                )
                            )
                        );
                        if (this.classList.contains('link-modifier-cloak'))
                            (0, common_1.printError)(
                                this,
                                "\uB9C1\uD06C \uC218\uC815\uC790 '".concat(
                                    name,
                                    "'\uC740(\uB294) \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4"
                                )
                            );
                        return;
                    }
                    localPromise = localPromise
                        .then(function () {
                            return collection.modifiers[name](link, _this);
                        })
                        .then(
                            function () {
                                _this.classList.remove('link-modifier-cloak');
                                _this.classList.add('link-modified');
                            },
                            function (error) {
                                (0, common_1.printError)(
                                    _this,
                                    error.toString()
                                );
                            }
                        );
                });
            localPromises.push(localPromise);
        });
        globalPromise = globalPromise.then(function () {
            return Promise.allSettled(localPromises);
        });
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
})();
exports.default = LinkModifierCollection;
//# sourceMappingURL=linkmodifier.js.map
