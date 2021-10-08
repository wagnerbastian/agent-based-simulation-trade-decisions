const fs = require("fs");
const fsPath = require('fs-path');
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

        this.writeFile("results.json", JSON.stringify(text));
        this.writeFile(`./logs/results-${start.split(':').join('-')}.json`, JSON.stringify(text));

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
        
        this.writeFile("run.json", JSON.stringify(text));
        this.writeFile(`./logs/run-${start.split(':').join('-')}.json`, JSON.stringify(text));
    }

    writeFile(path: string, content: string): void {
        fsPath.writeFile(path, content, function(err: any){
            if(err) {
              console.error("error in writing file");
              
            } else {
            }
          });
    }
}