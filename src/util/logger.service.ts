const fs = require("fs");
import * as data from '../parameters.json';

export class Logger {

    constructor() {
       

    }

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

        try {
            fs.mkdirSync('logs');
        } catch(e) {}
        fs.writeFile("results.json", JSON.stringify(text), function(){});
        fs.writeFile(`./logs/results-${start.split(':').join('-')}.json`, JSON.stringify(text), function(){});


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

        try {
            fs.mkdirSync('logs');
        } catch(e) {}
        fs.writeFile("run.json", JSON.stringify(text), function(){})
        fs.writeFile(`./logs/run-${start.split(':').join('-')}.json`, JSON.stringify(text), function(){});

    }


}