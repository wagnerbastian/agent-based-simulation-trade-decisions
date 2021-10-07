import { SimulationService } from "./service/simulation.service";
import { StrategyService } from "./service/strategy.service";
import { Simulation } from "./simulation/simulation";
import * as data from './parameters.json';
const parameters = ((data as any).default)
const fs = require("fs");

const simService = new SimulationService();
const strategyService = new StrategyService();

const strategies = strategyService.initStrategies()
const agents = simService.initAgents(data.agents, strategies)

const simulationResults = [];


// Simulationen, mehrere erstellen um damit zu arbeiten.
const x = new Simulation(agents, strategyService);
console.log(simService.countStrategies(x.agents));
x.runSimulation(data.runs);

for (let i = 0; i < 5; i++) {
    const x = new Simulation(agents, strategyService);
    simulationResults.push({
        run: i,
        history: x.runSimulation(data.runs)
    });
}

fs.writeFileSync("results.json", JSON.stringify(simulationResults), function(){})