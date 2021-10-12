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
        this.communicationModifier = parameters.default.communicationModifier;
        this.communicationPathWeight = parameters.default.edgeWeightCommunication;
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
    StrategyService.prototype.performStrategySwitchCalculation = function (agentA, agentB, payoffObject, populationInfo, initialAgentArray) {
        switch (this.strategy.decisionStrategy) {
            case 'best': {
                this.simpleSwitch(agentA, agentB, payoffObject);
                break;
            }
            case 'original-payoff': {
                // Wahrscheinlichkeit wird für jeden Agenten berechnet
                this.originalSwitchPayoff(agentA, agentB, populationInfo);
                break;
            }
            case 'original-wealth': {
                // Wahrscheinlichkeit wird für jeden Agenten berechnet
                this.originalSwitchWealth(agentA, agentB, payoffObject, populationInfo, false);
                break;
            }
            case 'original-wealth-communication-network': {
                // Wahrscheinlichkeit wird für jeden Agenten berechnet, mit kommunikation
                this.originalSwitchWealth(agentA, agentB, payoffObject, populationInfo, true, initialAgentArray);
                break;
            }
            default: {
                console.log("### Wrong Decision Strategy ###");
                return false;
            }
        }
        return true;
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
    /**
     * Nachgebaute originale Strategieentscheidung aus dem Paper. Die Fittness (Reichtum) der Agenten werden verglichen
     * @param agentA
     * @param agentB
     * @param payoffs
     * @param populationInfo
     */
    StrategyService.prototype.originalSwitchWealth = function (agentA, agentB, payoffs, populationInfo, communication, agentsAtStartOfStep) {
        // if (payoffs.payoffA === 0 || payoffs.payoffB === 0) { return; }
        // Zur Identifizierung die Strategien speichern
        var aStrategyName = agentA.strategy.name + '';
        var bStrategyName = agentB.strategy.name + '';
        // Maximum von 0 und der Differenz der beiden Reichtümer im letzten Schritt
        var wA = Math.max(0, (agentB.wealth - payoffs.payoffB) - (agentA.wealth - payoffs.payoffA));
        var wB = Math.max(0, (agentA.wealth - payoffs.payoffA) - (agentB.wealth - payoffs.payoffB));
        var maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
        // wahrscheinlichkeit eines Strategiewechsel
        var probabilityA = wA / maxNetWealthDifference || 0;
        var probabilityB = wB / maxNetWealthDifference || 0;
        if (communication) {
            /**
             * wenn Kommunikation an ist, wird die Wahrscheinlichkeit erhöht zu der Strategie zu wechseln,
             * die von den Nachbarn am meisten gewählt wurde
             */
            if (this.getNeighborsMostChosenStrategies(agentA, agentsAtStartOfStep).includes(bStrategyName) && probabilityA > 0) {
                // modify Probability of A to switch
                probabilityA += this.communicationModifier;
            }
            if (this.getNeighborsMostChosenStrategies(agentB, agentsAtStartOfStep).includes(aStrategyName) && probabilityB > 0) {
                // modify Probability of B to switch
                probabilityB += this.communicationModifier;
            }
        }
        // agent a switcht zu agent b Strategy
        if (Math.random() < probabilityA) {
            agentA.strategy = this.strategies.find(function (strategy) { return strategy.name === bStrategyName; });
        }
        // agent b switcht zu agent a Strategy
        if (Math.random() < probabilityB) {
            agentB.strategy = this.strategies.find(function (strategy) { return strategy.name === aStrategyName; });
        }
    };
    /**
     * Nutzt den letzten Payoff im Vergleich zu maximal möglichen Payoff. Nicht gut, da das Verhältniss immer Größer wird (letzter Payoff < max Payoff * runs)
     * @param agentA
     * @param agentB
     * @param populationInfo
     */
    StrategyService.prototype.originalSwitchPayoff = function (agentA, agentB, populationInfo) {
        var aStrategyName = agentA.strategy.name + '';
        var bStrategyName = agentB.strategy.name + '';
        // Payoff von t-1 (eigentlich t-2 da der handel durch ist) bekommen. Im ersten Handel ist er nicht da => 0
        var aPayoff = agentA.payoffs.length > 1 ? agentA.payoffs[agentA.payoffs.length - 2] : 0;
        var bPayoff = agentB.payoffs.length > 1 ? agentB.payoffs[agentB.payoffs.length - 2] : 0;
        // Maximal möglicher Unterschied aller bisherigen Handel
        var maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
        // wahrscheinlichkeit eines Strategiewechsel
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
    StrategyService.prototype.getNeighborsMostChosenStrategies = function (agent, agents) {
        var _this = this;
        var neighbors = [];
        var TP = 0;
        var UP = 0;
        var TC = 0;
        var UC = 0;
        /**
         * Wahrscheinlichkeit, dass die direkten Nachbarn ausgewertet werden.
         * Ansonsten werden alle Nachbarn (ausser der eigene Agent) eines direkten Nachbarn ausgewertet
         */
        var takeDirectNeighbor = Math.random() < this.communicationPathWeight;
        if (takeDirectNeighbor) {
            agent.communicationNode.neighbors.forEach(function (n) {
                if (!agents) {
                    neighbors.push(_this.networkService.getAgentFromNodeID(n));
                }
                else {
                    // agents array wurde übergeben
                    var neighbor = agents.find(function (a) { return a.node.id === n; });
                    neighbors.push(neighbor);
                }
            });
        }
        else {
            // Nachbaragenten bekommen
            var travelTo_1 = [];
            agent.communicationNode.neighbors.forEach(function (n) {
                travelTo_1.push(_this.networkService.getAgentFromNodeID(n));
            });
            // zufälligen Nachbaragenten auswählen
            var index = Math.floor(Math.random() * travelTo_1.length);
            // Nachbarn des gewählten Agenten in Array pushen. Ausser den eigenen.
            travelTo_1[index].communicationNode.neighbors.forEach(function (n) {
                // alle Nachbarn des Nachbarn ausser den eigenen Agenten auswerten
                if (n !== agent.communicationNode.id) {
                    if (!agents) {
                        neighbors.push(_this.networkService.getAgentFromNodeID(n));
                    }
                    else {
                        // agents array wurde übergeben
                        var neighbor = agents.find(function (a) { return a.node.id === n; });
                        neighbors.push(neighbor);
                    }
                }
            });
        }
        // Strategien der Nachbarn zählen
        neighbors.forEach(function (n) {
            if (n.strategy.name === 'TP') {
                TP++;
            }
            else if (n.strategy.name === 'UP') {
                UP++;
            }
            else if (n.strategy.name === 'TC') {
                TC++;
            }
            else if (n.strategy.name === 'UC') {
                UC++;
            }
        });
        // Anzahl der am meisten gewählten Strategie nehmen.
        var max = Math.max(TP, UP, TC, UC);
        var result = [];
        // alle Strategien die am meisten gewählt wurden in Array pushen und zurückgeben
        if (TP === max) {
            result.push('TP');
        }
        if (UP === max) {
            result.push('UP');
        }
        if (TC === max) {
            result.push('TC');
        }
        if (UC === max) {
            result.push('UC');
        }
        return result;
    };
    return StrategyService;
}());
exports.StrategyService = StrategyService;
