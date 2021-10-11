import {
    SimulationService
} from "./service/simulation.service";
import {
    StrategyService
} from "./service/strategy.service";
import {
    Simulation
} from "./simulation/simulation";
import * as data from './parameters.json';
import {
    Logger
} from "./util/logger.service";
import {
    Analyzer
} from "./simulation/analyzer";
import { PopulationInfo } from "./model/population-info";
const parameters = ((data as any).default)
const fs = require("fs");

console.log(`--- Starting ${parameters.simulations} Simulations with ${parameters.agents} Agents, ${parameters.runs} Runs, ${parameters.repititions} Repitions ---`);

for (let simulationCounter = 0; simulationCounter < parameters.simulations; simulationCounter++) {
    const logger = new Logger();
    const analyzer = new Analyzer(logger);

    const simService = new SimulationService();
    const strategyService = new StrategyService();

    const strategies = strategyService.initStrategies()
    const agents = simService.initAgents(data.agents, strategies)

    const simulationResults = [];

    const start = new Date().toISOString();
    // Simulationen, mehrere erstellen um damit zu arbeiten.
    const x = new Simulation(agents, strategyService);
    simulationResults.push({
        run: 0,
        history: x.runSimulation(data.runs),
        populationData: x.populationInfo
    });

    for (let i = 1; i < data.repititions; i++) {
        const x = new Simulation(agents, strategyService);
        simulationResults.push({
            run: i,
            history: x.runSimulation(data.runs),
            populationData: x.populationInfo
        });
    }

    
    const result = analyzer.analyzeResults(simulationResults);
    const populationInfo = analyzer.analyzePopulationInfo(simulationResults)

    const end = new Date().toISOString();
    logger.logHistory(start, end, simulationResults)
    logger.logRun(start, end, result, populationInfo)
}

console.log("--- Finished execution of simulation ---")