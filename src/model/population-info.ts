import { Agent } from "./agent";
import { Trade } from "./trade";


export class PopulationInfo {
    wealthTotal= 0;
    wealthTotalHistory: number[] = [];
    maxWealthTotal = 0;
    minWealthTotal = 0;
    maxIndividualWealthTotal= 0;
    minIndividualWealthTotal= 0;

    maxPossibleIndividualWealth = 0;
    minPossibleIndividualWealth = 0;


    maxIndividualWealth = 0;
    minIndividualWealth = 0;

    tradeInfo: Trade;

    constructor(trade: Trade) {
        this.tradeInfo = trade;        
    }


    updatePopulationInfo(agents: Agent[], steps: number): void {
        
        this.maxIndividualWealth = Math.max.apply(Math, agents.map(function(o) { return o.wealth; }));
        this.minIndividualWealth = Math.min.apply(Math, agents.map(function(o) { return o.wealth; }));

        this.wealthTotal = 0;
        agents.forEach(agent => { this.wealthTotal += agent.wealth; })
        this.wealthTotalHistory.push(this.wealthTotal);

        if (this.maxIndividualWealth > this.maxIndividualWealthTotal) {
            this.maxIndividualWealthTotal = this.maxIndividualWealth;
        }

        if (this.minIndividualWealth < this.minIndividualWealthTotal) {
            this.minIndividualWealthTotal = this.minIndividualWealth;
        }

        if (this.wealthTotal < this.minWealthTotal) { this.minWealthTotal = this.wealthTotal; }
        if (this.wealthTotal > this.maxWealthTotal) { this.maxWealthTotal = this.wealthTotal; }

        this.maxPossibleIndividualWealth = this.tradeInfo.maxPayoff * steps;
        this.minPossibleIndividualWealth = this.tradeInfo.minPayoff * steps;
        // console.log("minWealth: ", this.minPossibleIndividualWealth, '   MaxWealth: ', this.maxPossibleIndividualWealth);
    }
    
}

