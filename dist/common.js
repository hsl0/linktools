'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.printError = void 0;
function printError(element, message) {
    $(element).addClass('error').empty().text(message);
}
exports.printError = printError;
//# sourceMappingURL=common.js.map
