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
var Simulation = /** @class */ (function () {
    function Simulation(agents, strategyService) {
        this.strategyService = strategyService;
        this.strategyHistory = [];
        this.parameters = (parameters.default).payoff;
        this.strategies = this.strategyService.initStrategies();
        // copy Agents damit jede Simulation die gleichen hat
        this.agents = JSON.parse(JSON.stringify(agents));
        console.log(this.agents.length, " Agents copied");
        this.trade = new trade_1.Trade(this.parameters.r, this.parameters.temp, this.parameters.s, this.parameters.x);
        this.populationInfo = new population_info_1.PopulationInfo(this.trade);
    }
    Simulation.prototype.runSimulation = function (steps) {
        for (var index = 0; index < steps; index++) {
            for (var i = 0; i < this.agents.length / 2; i++) {
                // Agenten filtern die in diesem Step noch nicht gehandelt haben
                var agents = this.agents.filter(function (agent) { return !agent.didTradeInThisStep; });
                if (agents.length > 1) {
                    // einen zufälligen Agenten auswählen
                    var a = agents[Math.floor(Math.random() * agents.length)];
                    // gewählten Agenten aus dem Array entfernen
                    var elIndex = agents.indexOf(a);
                    agents.splice(elIndex, 1);
                    // Agenten aus den restlichen auswählen
                    var b = agents[Math.floor(Math.random() * agents.length)];
                    // Handel ausführen
                    var payoffObject = this.trade.performTrade(a, b);
                    // Strategiewechsel
                    this.strategyService.performStrategySwitchCalculation(a, b, payoffObject, this.populationInfo);
                }
                else {
                    // break;
                }
            }
            // Verlauf der Strategies anlegen:
            this.strategyHistory.push(this.countStrategies(this.agents));
            // Population Info updaten
            this.populationInfo.updatePopulationInfo(this.agents, index + 1);
            this.agents.forEach(function (agent) {
                agent.didTradeInThisStep = false;
            });
        }
        console.log(this.strategyHistory[this.strategyHistory.length - 1]);
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
    return Simulation;
}());
exports.Simulation = Simulation;
