import { Logger } from "../util/logger.service";
import { StrategyDistribution } from "./simulation";
import * as data from '../parameters.json';
import { PopulationInfo } from "../model/population-info";



export class Analyzer {
    logger: Logger;
    parameters = ((data as any).default).analytics as Analytics;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    analyzePopulationInfo(historyIn: any[]): PopulationInfo {
        if (!historyIn || historyIn.length === 0 || !historyIn[0].history) { return; }
        const history = JSON.parse(JSON.stringify(historyIn)) as any[];        
        
        let populationInfos: PopulationInfo = history[0].populationData;

        for (let index = 1; index < history.length -1; index++) {
            populationInfos.wealthTotal += history[index].populationData.wealthTotal;
            populationInfos.maxWealthTotal += history[index].populationData.maxWealthTotal;
            populationInfos.minWealthTotal += history[index].populationData.minWealthTotal;
            populationInfos.maxIndividualWealth += history[index].populationData.maxIndividualWealth;
            populationInfos.minIndividualWealth += history[index].populationData.minIndividualWealth;
            populationInfos.maxIndividualWealthTotal += history[index].populationData.maxIndividualWealthTotal;
            populationInfos.minIndividualWealthTotal += history[index].populationData.minIndividualWealthTotal;
            populationInfos.maxPossibleIndividualWealth += history[index].populationData.maxPossibleIndividualWealth;
            populationInfos.minPossibleIndividualWealth += history[index].populationData.minPossibleIndividualWealth;
            populationInfos.maxIndividualWealth
        }
        
        populationInfos.wealthTotal = populationInfos.wealthTotal / history.length;
        populationInfos.maxWealthTotal = populationInfos.maxWealthTotal / history.length;
        populationInfos.minWealthTotal = populationInfos.minWealthTotal / history.length;
        populationInfos.maxIndividualWealth = populationInfos.maxIndividualWealth / history.length;
        populationInfos.minIndividualWealth = populationInfos.minIndividualWealth / history.length;
        populationInfos.maxIndividualWealthTotal = populationInfos.maxIndividualWealthTotal / history.length;
        populationInfos.minIndividualWealthTotal = populationInfos.minIndividualWealthTotal / history.length;
        populationInfos.maxPossibleIndividualWealth = populationInfos.maxPossibleIndividualWealth / history.length;
        populationInfos.minPossibleIndividualWealth = populationInfos.minPossibleIndividualWealth / history.length;


        const wealthHistory: number[] = []

        for (let index = 0; index < history[0].populationData.wealthTotalHistory.length; index++) {
            let wealth = 0;
            history.forEach(h => {
                wealth += h.populationData.wealthTotalHistory[index];
            });
            wealth = wealth / history.length;
            wealthHistory.push(wealth);
        }
        populationInfos.wealthTotalHistory = wealthHistory;


        let payoffHistory: any[] = history[0].populationData.totalPayoffHistory;      
        
        let result: number[] = [];
        let index = 0;
        payoffHistory.forEach(() => {
            let val = 0;
            history.forEach(h => {
                val+= h.populationData.totalPayoffHistory[index];
            })
            const res = val / history.length;
            result.push(res)
            
            index++;
        });

        populationInfos.totalPayoffHistory = result;
        return populationInfos;
        
        
    }

    analyzeResults(historyIn: any[]): StrategyDistribution {
        if (!historyIn || historyIn.length === 0 || !historyIn[0].history) { return; }
        
        const history = JSON.parse(JSON.stringify(historyIn)) as any[];
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