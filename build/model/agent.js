"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
var Agent = /** @class */ (function () {
    function Agent(index) {
        this.index = index;
        this.wealth = 0;
        this.tradings = 0;
        this.didTradeInThisStep = false;
        this.payoffs = [];
    }
    return Agent;
}());
exports.Agent = Agent;
