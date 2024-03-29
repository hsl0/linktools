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
var mount_1 = require('./mount');
mount_1.linkAction.register('all', function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return Promise.all(
        args.map(function (_a) {
            var name = _a[0],
                args = _a.slice(1);
            return mount_1.linkAction.execute.apply(
                mount_1.linkAction,
                __spreadArray([name, event], args, false)
            );
        })
    );
});
mount_1.linkAction.register('race', function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return Promise.race(
        args.map(function (_a) {
            var name = _a[0],
                args = _a.slice(1);
            return mount_1.linkAction.execute.apply(
                mount_1.linkAction,
                __spreadArray([name, event], args, false)
            );
        })
    );
});
mount_1.linkAction.register('allSettled', function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return Promise.allSettled(
        args.map(function (_a) {
            var name = _a[0],
                args = _a.slice(1);
            return mount_1.linkAction.execute.apply(
                mount_1.linkAction,
                __spreadArray([name, event], args, false)
            );
        })
    );
});
mount_1.linkAction.register('any', function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return Promise.any(
        args.map(function (_a) {
            var name = _a[0],
                args = _a.slice(1);
            return mount_1.linkAction.execute.apply(
                mount_1.linkAction,
                __spreadArray([name, event], args, false)
            );
        })
    );
});
// eslint-disable-next-line @typescript-eslint/no-empty-function
mount_1.linkAction.register('void', function () {});
//# sourceMappingURL=EssentialActions.js.map
