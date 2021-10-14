const fs = require("fs");
import { Agent } from '../model/agent';
import { PopulationInfo } from '../model/population-info';
import * as data from '../parameters.json';

export class Logger {

    constructor() {
    }

    log(data: string, title: string): void {
        fs.writeFile(title, data, function(){});
    }

    logHistory(start: string, end: string, simulationResults: any[]): void {
        if (!simulationResults || simulationResults.length === 0 || !simulationResults[0].history) { return; }
        const parameters = ((data as any).default)

        const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;

        const text = {
            start,
            end,
            duration,
            agents: data.agents,
            iterations: data.runs,
            runs: data.repititions,
            strategy: data.decisionStrategy.decisionStrategy,
            pairingMethod: data.pairingMethod,
            results: simulationResults
        }

        try {
            fs.mkdirSync('logs');
        } catch(e) {}
        fs.writeFile("results.json", JSON.stringify(text), function(){});
        // fs.writeFile("../masterarbeit-visualisierung/src/app/results.json", JSON.stringify(text), function(){});
        

        if (parameters.extendedLogging) {
            fs.writeFile(`./logs/results-${start.split(':').join('-')}.json`, JSON.stringify(text), function(){});
        }


    }

    logRun(start: string, end: string, results: any, populationInfo: PopulationInfo) {
        if (!populationInfo) { return; }
        const parameters = ((data as any).default)

        const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;

        const text = {
            start,
            end,
            duration,
            agents: data.agents,
            iterations: data.runs,
            runs: data.repititions,
            strategy: data.decisionStrategy.decisionStrategy,
            pairingMethod: data.pairingMethod,
            populationInfo,
            results
        }

        try {
            fs.mkdirSync('logs');
        } catch(e) {}
        fs.writeFile("run.json", JSON.stringify(text), function(){})
        // fs.writeFile("../masterarbeit-visualisierung/src/app/run.json", JSON.stringify(text), function(){})

        if (parameters.extendedLogging) {
            fs.writeFile(`./logs/run-${start.split(':').join('-')}.json`, JSON.stringify(text), function(){});
        }
        

    }

    logGraphInfo(agents: Agent[]): void {
        let connections: {a: number, b: number}[] = [];
        agents.forEach(agent => {
            agent.node.neighbors.forEach(n => {
                connections.push({
                    a: agent.node.id,
                    b: n
                });
            })
        });

        let text = ``;
        connections.forEach(connection => {
            text += `${connection.a} ${connection.b}\n`
        });
        fs.writeFile("graph.txt", text, function(){})
    }


}
