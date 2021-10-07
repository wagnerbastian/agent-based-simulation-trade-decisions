import { Agent } from "../model/agent";
import { PopulationInfo } from "../model/population-info";
import { Strategy } from "../model/strategy";
import { Trade } from "../model/trade";
import { StrategyService } from "../service/strategy.service";
import * as parameters from '../parameters.json';

export class Simulation {
    agents: Agent[];
    strategies: Strategy[];
    trade: Trade;
    strategyHistory: any[] = [];
    populationInfo: PopulationInfo;

    parameters = ((parameters as any).default).payoff as PayoffParameter;
    


    constructor(agents: Agent[], private strategyService: StrategyService) {
        this.strategies = this.strategyService.initStrategies();

        // copy Agents damit jede Simulation die gleichen hat
        this.agents = JSON.parse(JSON.stringify(agents)) as Agent[];
        console.log( this.agents.length, " Agents copied");

        this.trade = new Trade(this.parameters.r, this.parameters.temp, this.parameters.s, this.parameters.x);
        this.populationInfo = new PopulationInfo(this.trade);
    }

    runSimulation(steps: number): any {
        for (let index = 0; index < steps; index++) {
          
          for (let i = 0; i < this.agents.length / 2; i++) {
    
            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            const agents = this.agents.filter(agent => !agent.didTradeInThisStep);
            if (agents.length > 1) {
    
              // einen zufälligen Agenten auswählen
              const a = agents[Math.floor(Math.random() * agents.length)];
    
              // gewählten Agenten aus dem Array entfernen
              const elIndex = agents.indexOf(a);
              agents.splice(elIndex, 1);
    
              // Agenten aus den restlichen auswählen
              const b = agents[Math.floor(Math.random() * agents.length)];
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(a, b);
    
              // Strategiewechsel
              this.strategyService.performStrategySwitchCalculation(a, b, payoffObject, this.populationInfo);
            } else {
              // break;
            }
             
          }
    
          // Verlauf der Strategies anlegen:
          this.strategyHistory.push(this.countStrategies(this.agents));
    
          // Population Info updaten
          this.populationInfo.updatePopulationInfo(this.agents, index + 1);
    
    
          this.agents.forEach(agent => {
            agent.didTradeInThisStep = false;
          })
        }
    
        console.log(this.strategyHistory[this.strategyHistory.length -1 ]);
        return this.strategyHistory;
      }

      countStrategies(agents: Agent[]): any {
        const result = {
          TC: 0,
          UC: 0,
          TP: 0,
          UP: 0
        }
           
        agents.forEach(agent => {
          switch (agent.strategy.name) {
            case 'TC': {
              result.TC++;
              break;
            }
            case 'UC': {
              result.UC++;
              break;
            }
            case 'TP': {
              result.TP++;
              break;
            }
            case 'UP': {
              result.UP++;
              break;
              
            }
          }
        })
        return result;
    }
}

interface PayoffParameter  {
    r: number,
    temp: number,
    s: number,
    x: number
}