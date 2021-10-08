"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
var Strategy = /** @class */ (function () {
    function Strategy(id, name, isConsumer, distribution) {
        this.id = id;
        this.name = name;
        this.isConsumer = isConsumer;
        this.distribution = distribution;
    }
    return Strategy;
}());
exports.Strategy = Strategy;
