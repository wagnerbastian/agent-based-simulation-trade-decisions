import { Logger } from "../util/logger.service";
import { StrategyDistribution } from "./simulation";
import * as data from '../parameters.json';



export class Analyzer {
    logger: Logger;
    parameters = ((data as any).default).analytics as Analytics;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    analyzeResults(history: any[]): StrategyDistribution {
        let result: any[] = [];
        
        history.forEach(his => {
            let index = (1 - this.parameters.analyzePercentage) * his.history.length;
            const analyze = his.history.splice(index, his.history.length - index);

            let TC = 0;
            let UC = 0;
            let TP = 0;
            let UP = 0;
            analyze.forEach((el: { TC: number; UC: number; TP: number; UP: number}) => {
                TC += el.TC;
                UC += el.UC;
                TP += el.TP;
                UP += el.UP;
            })
            
            
            TC = TC / analyze.length;
            UC = UC / analyze.length;
            TP = TP / analyze.length;
            UP = UP / analyze.length;
            result.push({TC, UC, TP, UP})
        })

        let TC = 0;
        let UC = 0;
        let TP = 0;
        let UP = 0;
        result.forEach((el: { TC: number; UC: number; TP: number; UP: number}) => {
            TC += el.TC;
            UC += el.UC;
            TP += el.TP;
            UP += el.UP;
        })

        TC = TC / result.length;
        UC = UC / result.length;
        TP = TP / result.length;
        UP = UP / result.length;

        return {
            TC,
            UC,
            TP,
            UP
        }
        // let index = (1 - this.parameters.analyzePercentage) * h.length;
        // const analyze = h.splice(0, index);
        // console.log("yyy");
        
        
        
    }
}


interface Analytics {
    analyzePercentage: number;
}