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
exports.Simulation = void 0;
var population_info_1 = require("../model/population-info");
var trade_1 = require("../model/trade");
var parameters = __importStar(require("../parameters.json"));
var pairing_service_1 = require("../service/pairing.service");
var logger_service_1 = require("../util/logger.service");
var Simulation = /** @class */ (function () {
    function Simulation(agents, strategyService, graphService, networkService, repitition) {
        this.strategyService = strategyService;
        this.networkService = networkService;
        this.repitition = repitition;
        this.strategyHistory = [];
        this.logger = new logger_service_1.Logger();
        this.parameters = (parameters.default).payoff;
        this.pairingMethod = parameters.default.pairingMethod;
        this.data = (parameters.default);
        this.strategyService.networkService = this.networkService;
        this.pairingService = new pairing_service_1.PairingService();
        this.strategies = this.strategyService.initStrategies();
        this.graphService = graphService;
        this.pairingService.graphService = this.graphService;
        // copy Agents damit jede Simulation die gleichen hat
        this.agents = JSON.parse(JSON.stringify(agents));
        console.log(this.agents.length, " Agents copied");
        this.trade = new trade_1.Trade(this.parameters.r, this.parameters.temp, this.parameters.s, this.parameters.x);
        this.populationInfo = new population_info_1.PopulationInfo(this.trade);
        // Netzwerk wird gebaut und Nachbarn zugewiesen
        // this.networkService.createNetwork(this.agents);
        // Kommunikationsnetzwerk wird gebaut und Nachbarn zugewiesen
        // this.networkService.createCommunicationNetwork(this.agents);
        // Pairingservice kriegt NetzwerkInfo übergeben
        this.pairingService.networkService = this.networkService;
        this.strategyService.networkService = this.networkService;
        // this.pairingService.networkPairAgentsForTrade(this.agents);
    }
    Simulation.prototype.runSimulation = function (steps) {
        var totalPayoffHistory = [];
        var success = true;
        console.log("- Starting Simulation " + this.repitition + ", be patient.");
        for (var index = 0; index < steps; index++) {
            if (index % 100 === 0) {
                process.stdout.write("" + index);
            }
            else if (index % 10 === 0) {
                process.stdout.write(".");
            }
            var start = new Date();
            var totalPayoff = 0;
            // Agents kopieren um immer die Ausgangssituation zu haben
            var agentsAtStartOfStep = JSON.parse(JSON.stringify(this.agents));
            switch (this.pairingMethod) {
                case 'simple': {
                    for (var i = 0; i < this.agents.length / 2; i++) {
                        // Agenten filtern die in diesem Step noch nicht gehandelt haben
                        var agentsToTrade = this.pairingService.simplePairAgents(this.agents);
                        // prüfen dass beide Agenten ausgewählt wurden
                        if (agentsToTrade.a && agentsToTrade.b) {
                            // Handel ausführen
                            var payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
                            totalPayoff += payoffObject.payoffA;
                            totalPayoff += payoffObject.payoffB;
                            // Strategiewechsel
                            success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
                            if (!success) {
                                console.log("######## Exit simulation");
                                return;
                            }
                        }
                    }
                    break;
                }
                case 'network': {
                    for (var i = 0; i < this.agents.length - 1; i++) {
                        // Agenten filtern die in diesem Step noch nicht gehandelt haben
                        var agentsToTrade = this.pairingService.networkPairAgentsForTrade(this.agents, false);
                        // prüfen dass beide Agenten ausgewählt wurden
                        if (agentsToTrade.a && agentsToTrade.b) {
                            // Handel ausführen
                            var payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
                            totalPayoff += payoffObject.payoffA;
                            totalPayoff += payoffObject.payoffB;
                            // Strategiewechsel
                            success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
                            if (!success) {
                                console.log("######## Exit simulation");
                                return;
                            }
                        }
                    }
                    break;
                }
                case 'dijkstra': {
                    for (var i = 0; i < this.agents.length - 1; i++) {
                        // Agenten filtern die in diesem Step noch nicht gehandelt haben
                        // const agentsToTrade: AgentPair = this.pairingService.networkPairAgentsForTrade(this.agents, false);
                        var agentsToTrade = this.pairingService.dijkstraPair(this.agents);
                        // console.log(agentsToTrade);
                        // prüfen dass beide Agenten ausgewählt wurden
                        if (agentsToTrade.a && agentsToTrade.b) {
                            // Handel ausführen
                            var payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
                            totalPayoff += payoffObject.payoffA;
                            totalPayoff += payoffObject.payoffB;
                            // Strategiewechsel
                            success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
                            if (!success) {
                                console.log("######## Exit simulation");
                                return;
                            }
                        }
                    }
                    break;
                }
                case 'network-tradeable': {
                    for (var i = 0; i < this.agents.length - 1; i++) {
                        // Agenten filtern die in diesem Step noch nicht gehandelt haben
                        var agentsToTrade = this.pairingService.networkPairAgentsForTrade(this.agents, true);
                        // console.log(agentsToTrade);
                        // prüfen dass beide Agenten ausgewählt wurden
                        if (agentsToTrade.a && agentsToTrade.b) {
                            // Handel ausführen
                            var payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
                            totalPayoff += payoffObject.payoffA;
                            totalPayoff += payoffObject.payoffB;
                            // Strategiewechsel
                            success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
                            if (!success) {
                                console.log("######## Exit simulation");
                                return;
                            }
                        }
                    }
                    break;
                }
            }
            totalPayoffHistory.push(totalPayoff);
            // Verlauf der Strategies anlegen:
            this.strategyHistory.push(this.countStrategies(this.agents));
            // Population Info updaten
            this.populationInfo.updatePopulationInfo(this.agents, index + 1);
            if (this.data.shuffleAgents) {
                this.agents = this.shuffle(this.agents);
            }
            this.agents.forEach(function (agent) {
                agent.didTradeInThisStep = false;
            });
            var end = new Date();
            var duration = (end.getTime() - start.getTime()) / 1000;
            if (index % 10 === 0) {
                // console.log("Rep: " + this.repitition + " Step:", index, 'Duration:', duration);
            }
            else if (this.pairingMethod.includes('dijkstra') && duration > 2) {
                console.log("Rep: " + this.repitition + " Step:", index, 'Duration:', duration);
            }
        }
        this.populationInfo.totalPayoffHistory = totalPayoffHistory;
        console.log('\nRepitions initial distribution:\n', this.strategyHistory[0]);
        console.log('\nRepitions last distribution:\n', this.strategyHistory[this.strategyHistory.length - 1], '\n');
        console.log('Saved steps: ', this.strategyHistory.length);
        var w = 0;
        this.agents.forEach(function (agent) {
            w += agent.wealth;
        });
        return this.strategyHistory;
    };
    Simulation.prototype.countStrategies = function (agents) {
        var result = {
            TC: 0,
            UC: 0,
            TP: 0,
            UP: 0
        };
        agents.forEach(function (agent) {
            switch (agent.strategy.name) {
                case 'TC': {
                    result.TC++;
                    break;
                }
                case 'UC': {
                    result.UC++;
                    break;
                }
                case 'TP': {
                    result.TP++;
                    break;
                }
                case 'UP': {
                    result.UP++;
                    break;
                }
            }
        });
        return result;
    };
    // Fisher-Yates shuffle algorithmus
    Simulation.prototype.shuffle = function (a) {
        var _a;
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            _a = [a[j], a[i]], a[i] = _a[0], a[j] = _a[1];
        }
        return a;
    };
    return Simulation;
}());
exports.Simulation = Simulation;
