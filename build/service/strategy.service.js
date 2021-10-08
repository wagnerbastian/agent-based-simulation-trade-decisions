"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyService = void 0;
var strategy_1 = require("../model/strategy");
var parameters = __importStar(require("../parameters.json"));
var StrategyService = /** @class */ (function () {
    function StrategyService() {
        this.strategy = parameters.default.decisionStrategy;
    }
    StrategyService.prototype.initStrategies = function () {
        var strategies = [];
        strategies.push(new strategy_1.Strategy(0, 'TC', true, this.strategy.distribution[0]));
        strategies.push(new strategy_1.Strategy(1, 'UC', true, this.strategy.distribution[1]));
        strategies.push(new strategy_1.Strategy(2, 'TP', false, this.strategy.distribution[2]));
        strategies.push(new strategy_1.Strategy(3, 'UP', false, this.strategy.distribution[3]));
        this.strategies = strategies;
        return strategies;
    };
    StrategyService.prototype.performStrategySwitchCalculation = function (agentA, agentB, payoffObject, populationInfo) {
        switch (this.strategy.type) {
            case 'best': {
                this.simpleSwitch(agentA, agentB, payoffObject);
                break;
            }
            case 'original': {
                // Wahrscheinlichkeit wird für jeden Agenten berechnet
                this.originalSwitch(agentA, agentB, populationInfo);
                break;
            }
            case 'original-old': {
                // Wahrscheinlichkeit wird für jeden Agenten berechnet
                this.originalSwitchWrong(agentA, agentB, payoffObject, populationInfo);
                break;
            }
        }
        return null;
    };
    // der Agent mit dem niedrigeren Payoff übernimmt die Strategy des Agenten mit dem höheren
    // es kann nur einer der beiden Agenten Strategie wechseln
    StrategyService.prototype.simpleSwitch = function (agentA, agentB, payoffs) {
        if (payoffs.payoffA < payoffs.payoffB) {
            agentA.strategy = agentB.strategy;
        }
        else if (payoffs.payoffA > payoffs.payoffB) {
            agentB.strategy = agentA.strategy;
        }
    };
    StrategyService.prototype.originalSwitchWrong = function (agentA, agentB, payoffs, populationInfo) {
        if (payoffs.payoffA === 0 || payoffs.payoffB === 0) {
            return;
        }
        // Zur Identifizierung die Strategien speichern
        var aStrategyName = agentA.strategy.name + '';
        var bStrategyName = agentB.strategy.name + '';
        // Maximum von 0 und der Differenz der beiden Reichtümer im letzten Schritt
        var wA = Math.max(0, (agentB.wealth - payoffs.payoffB) - (agentA.wealth - payoffs.payoffA));
        var wB = Math.max(0, (agentA.wealth - payoffs.payoffA) - (agentB.wealth - payoffs.payoffB));
        var maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
        var probabilityA = wA / maxNetWealthDifference || 0;
        var probabilityB = wB / maxNetWealthDifference || 0;
        // agent a switcht to agent b Strategy
        if (Math.random() < probabilityA) {
            agentA.strategy = this.strategies.find(function (strategy) { return strategy.name === bStrategyName; });
        }
        // agent b switcht to agent a Strategy
        if (Math.random() < probabilityB) {
            agentB.strategy = this.strategies.find(function (strategy) { return strategy.name === aStrategyName; });
        }
    };
    StrategyService.prototype.originalSwitch = function (agentA, agentB, populationInfo) {
        var aStrategyName = agentA.strategy.name + '';
        var bStrategyName = agentB.strategy.name + '';
        // Payoff von t-1 (eigentlich t-2 da der handel durch ist) bekommen. Im ersten Handel ist er nicht da => 0
        var aPayoff = agentA.payoffs.length > 1 ? agentA.payoffs[agentA.payoffs.length - 2] : 0;
        var bPayoff = agentB.payoffs.length > 1 ? agentB.payoffs[agentB.payoffs.length - 2] : 0;
        // Maximal möglicher Unterschied aller bisherigen Handel
        var maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
        // const maxNetWealthDifference = 60;
        var probabilityA = Math.max(0, bPayoff - aPayoff) / maxNetWealthDifference || 0;
        var probabilityB = Math.max(0, aPayoff - bPayoff) / maxNetWealthDifference || 0;
        // console.log(aPayoff, bPayoff, maxNetWealthDifference);
        // agent a switcht to agent b Strategy
        if (Math.random() < probabilityA) {
            agentA.strategy = this.strategies.find(function (strategy) { return strategy.name === bStrategyName; });
        }
        // agent b switcht to agent a Strategy
        if (Math.random() < probabilityB) {
            agentB.strategy = this.strategies.find(function (strategy) { return strategy.name === aStrategyName; });
        }
    };
    return StrategyService;
}());
exports.StrategyService = StrategyService;
