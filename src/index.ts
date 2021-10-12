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
import { GraphService } from "./service/graph.service";
import { NetworkService } from "./service/network.service";
const parameters = ((data as any).default)
const fs = require("fs");

function shuffle (a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

console.log(`--- Starting ${parameters.simulations} Simulations with ${parameters.agents} Agents, ${parameters.runs} Runs, ${parameters.repititions} Repitions ---`);

for (let simulationCounter = 0; simulationCounter < parameters.simulations; simulationCounter++) {
    const logger = new Logger();
    const analyzer = new Analyzer(logger);

    const simService = new SimulationService();
    const strategyService = new StrategyService();

    const strategies = strategyService.initStrategies()
    let agents = simService.initAgents(data.agents, strategies);
    const networkService = new NetworkService();

    const graphService = new GraphService();
    networkService.graphService = graphService;

    agents = shuffle(agents);
    networkService.createNetwork(agents);
    networkService.createCommunicationNetwork(agents);

    const simulationResults = [];

    const start = new Date().toISOString();
    // Simulationen, mehrere erstellen um damit zu arbeiten.
    const x = new Simulation(agents, strategyService, graphService, networkService, 1);
    simulationResults.push({
        run: 0,
        history: x.runSimulation(data.runs),
        populationData: x.populationInfo
    });

    for (let i = 1; i < data.repititions; i++) {
        const x = new Simulation(agents, strategyService, graphService, networkService, i);
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