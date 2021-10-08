const fs = require("fs");
import * as data from '../parameters.json';

export class Logger {

    logHistory(start: string, end: string, simulationResults: any[]): void {
        const parameters = ((data as any).default)

        const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;

        const text = {
            start,
            end,
            duration,
            agents: data.agents,
            iterations: data.runs,
            runs: data.repititions,
            strategy: data.decisionStrategy.type,
            results: simulationResults
        }

        
        fs.writeFileSync("results.json", JSON.stringify(text), function(){});
        fs.writeFileSync(`logs/results-${start}.json`, JSON.stringify(text), function(){});

    }

    logRun(start: string, end: string, results: any) {
        const parameters = ((data as any).default)

        const duration = (new Date(end).getTime() - new Date(start).getTime()) / 1000;

        const text = {
            start,
            end,
            duration,
            agents: data.agents,
            iterations: data.runs,
            runs: data.repititions,
            strategy: data.decisionStrategy.type,
            results
        }

        
        fs.writeFileSync("run.json", JSON.stringify(text), function(){})
        fs.writeFileSync(`logs/run-${start}.json`, JSON.stringify(text), function(){});
    }
}