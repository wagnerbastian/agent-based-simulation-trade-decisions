"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PopulationInfo = void 0;
var PopulationInfo = /** @class */ (function () {
    function PopulationInfo(trade) {
        this.wealthTotal = 0;
        this.wealthTotalHistory = [];
        this.totalPayoffHistory = [];
        this.maxWealthTotal = 0;
        this.minWealthTotal = 0;
        this.maxIndividualWealthTotal = 0;
        this.minIndividualWealthTotal = 0;
        this.maxPossibleIndividualWealth = 0;
        this.minPossibleIndividualWealth = 0;
        this.maxIndividualWealth = 0;
        this.minIndividualWealth = 0;
        this.tradeInfo = trade;
    }
    PopulationInfo.prototype.updatePopulationInfo = function (agents, steps) {
        var _this = this;
        this.maxIndividualWealth = Math.max.apply(Math, agents.map(function (o) { return o.wealth; }));
        this.minIndividualWealth = Math.min.apply(Math, agents.map(function (o) { return o.wealth; }));
        this.wealthTotal = 0;
        agents.forEach(function (agent) { _this.wealthTotal += agent.wealth; });
        this.wealthTotalHistory.push(this.wealthTotal);
        if (this.maxIndividualWealth > this.maxIndividualWealthTotal) {
            this.maxIndividualWealthTotal = this.maxIndividualWealth;
        }
        if (this.minIndividualWealth < this.minIndividualWealthTotal) {
            this.minIndividualWealthTotal = this.minIndividualWealth;
        }
        if (this.wealthTotal < this.minWealthTotal) {
            this.minWealthTotal = this.wealthTotal;
        }
        if (this.wealthTotal > this.maxWealthTotal) {
            this.maxWealthTotal = this.wealthTotal;
        }
        this.maxPossibleIndividualWealth = this.tradeInfo.maxPayoff * steps;
        this.minPossibleIndividualWealth = this.tradeInfo.minPayoff * steps;
        // console.log("minWealth: ", this.minPossibleIndividualWealth, '   MaxWealth: ', this.maxPossibleIndividualWealth);
    };
    return PopulationInfo;
}());
exports.PopulationInfo = PopulationInfo;
