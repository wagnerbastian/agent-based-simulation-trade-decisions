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
var simulation_service_1 = require("./service/simulation.service");
var strategy_service_1 = require("./service/strategy.service");
var simulation_1 = require("./simulation/simulation");
var data = __importStar(require("./parameters.json"));
var logger_service_1 = require("./util/logger.service");
var analyzer_1 = require("./simulation/analyzer");
var parameters = (data.default);
var fs = require("fs");
for (var simulationCounter = 0; simulationCounter < parameters.simulations; simulationCounter++) {
    var logger = new logger_service_1.Logger();
    var analyzer = new analyzer_1.Analyzer(logger);
    var simService = new simulation_service_1.SimulationService();
    var strategyService = new strategy_service_1.StrategyService();
    var strategies = strategyService.initStrategies();
    var agents = simService.initAgents(data.agents, strategies);
    var simulationResults = [];
    var start = new Date().toISOString();
    // Simulationen, mehrere erstellen um damit zu arbeiten.
    var x = new simulation_1.Simulation(agents, strategyService);
    console.log(simService.countStrategies(x.agents));
    x.runSimulation(data.runs);
    for (var i = 0; i < data.repititions; i++) {
        var x_1 = new simulation_1.Simulation(agents, strategyService);
        simulationResults.push({
            run: i,
            history: x_1.runSimulation(data.runs)
        });
    }
    var result = analyzer.analyzeResults(simulationResults);
    var end = new Date().toISOString();
    logger.logHistory(start, end, simulationResults);
    logger.logRun(start, end, result);
}
