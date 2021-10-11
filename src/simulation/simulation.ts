import {
  Agent, AgentPair
} from "../model/agent";
import {
  PopulationInfo
} from "../model/population-info";
import {
  Strategy
} from "../model/strategy";
import {
  Trade
} from "../model/trade";
import {
  StrategyService
} from "../service/strategy.service";
import * as parameters from '../parameters.json';
import { PairingService } from "../service/pairing.service";
import { NetworkService } from "../service/network.service";
import { Logger } from "../util/logger.service";

export class Simulation {
  agents: Agent[];
  strategies: Strategy[];
  trade: Trade;
  strategyHistory: any[] = [];
  populationInfo: PopulationInfo;
  pairingService: PairingService;
  networkService = new NetworkService();
  logger = new Logger();

  parameters = ((parameters as any).default).payoff as PayoffParameter;
  pairingMethod = (parameters as any).default.pairingMethod;



  constructor(agents: Agent[], private strategyService: StrategyService) {
    this.pairingService = new PairingService();
    this.strategies = this.strategyService.initStrategies();

    // copy Agents damit jede Simulation die gleichen hat
    this.agents = JSON.parse(JSON.stringify(agents)) as Agent[];
    console.log(this.agents.length, " Agents copied");
    this.trade = new Trade(this.parameters.r, this.parameters.temp, this.parameters.s, this.parameters.x);
    this.populationInfo = new PopulationInfo(this.trade);

    // Netzwerk wird gebaut und Nachbarn zugewiesen
    this.networkService.createNetwork(this.agents);

    // Kommunikationsnetzwerk wird gebaut und Nachbarn zugewiesen
    this.networkService.createCommunicationNetwork(this.agents);

    // Pairingservice kriegt NetzwerkInfo übergeben
    this.pairingService.networkService = this.networkService;


    this.strategyService.networkService = this.networkService;

    // this.pairingService.networkPairAgentsForTrade(this.agents);
    
  }

  runSimulation(steps: number): any {
    for (let index = 0; index < steps; index++) {

      switch (this.pairingMethod) {
        case 'simple': {
          for (let i = 0; i < this.agents.length / 2; i++) {

            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            const agentsToTrade: AgentPair = this.pairingService.simplePairAgents(this.agents);
    
            // prüfen dass beide Agenten ausgewählt wurden
            if (agentsToTrade.a && agentsToTrade.b) {
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
    
              // Strategiewechsel
              this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo);
            }
    
          }
        }
        case 'network': {
          for (let i = 0; i < this.agents.length - 1; i++) {

            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            const agentsToTrade: AgentPair = this.pairingService.networkPairAgentsForTrade(this.agents);
    
            // prüfen dass beide Agenten ausgewählt wurden
            if (agentsToTrade.a && agentsToTrade.b) {
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
    
              // Strategiewechsel
              this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo);
            }
    
          }
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

    console.log('\nRepitions initial distribution:\n', this.strategyHistory[0]);
    console.log('\nRepitions last distribution:\n', this.strategyHistory[this.strategyHistory.length - 1], '\n');
    console.log('Saved steps: ', this.strategyHistory.length);
    
    let w = 0;
    this.agents.forEach(agent => {
      w += agent.wealth;
    })

    console.log("wealth:", w);
    this.logger.logGraphInfo(this.agents);
    return this.strategyHistory;
  }

  countStrategies(agents: Agent[]): StrategyDistribution {
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

interface PayoffParameter {
  r: number,
    temp: number,
    s: number,
    x: number
}

export interface StrategyDistribution {
  TC: number;
  UC: number;
  TP: number;
  UP: number;
}