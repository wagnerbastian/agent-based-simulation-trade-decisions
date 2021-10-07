import { SimulationService } from "./service/simulation.service";
import { StrategyService } from "./service/strategy.service";
import { Simulation } from "./simulation/simulation";
import * as data from './parameters.json';
import { Logger } from "./util/logger.service";
const parameters = ((data as any).default)
const fs = require("fs");

const logger = new Logger();

const simService = new SimulationService();
const strategyService = new StrategyService();

const strategies = strategyService.initStrategies()
const agents = simService.initAgents(data.agents, strategies)

const simulationResults = [];

const start = new Date().toISOString();
// Simulationen, mehrere erstellen um damit zu arbeiten.
const x = new Simulation(agents, strategyService);
console.log(simService.countStrategies(x.agents));
x.runSimulation(data.runs);

for (let i = 0; i < data.repititions; i++) {
    const x = new Simulation(agents, strategyService);
    simulationResults.push({
        run: i,
        history: x.runSimulation(data.runs)
    });
}

const end = new Date().toISOString();
logger.logHistory(start, end, simulationResults)