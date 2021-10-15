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
import { GraphService } from "../service/graph.service";

const io = require('@pm2/io');

const tcMetric = io.metric({
  name: 'TC',
})

const tpMetric = io.metric({
  name: 'TP',
})

const upMetric = io.metric({
  name: 'UP',
})

const ucMetric = io.metric({
  name: 'UC',
})

export class Simulation {
  agents: Agent[];
  strategies: Strategy[];
  trade: Trade;
  strategyHistory: any[] = [];
  populationInfo: PopulationInfo;
  pairingService: PairingService;
  logger = new Logger();
  graphService: GraphService;

  parameters = ((parameters as any).default).payoff as PayoffParameter;
  pairingMethod = (parameters as any).default.pairingMethod;
  data = ((parameters as any).default) as any;



  constructor(agents: Agent[], private strategyService: StrategyService, graphService: GraphService, public networkService: NetworkService, private repitition: number) {
    this.strategyService.networkService = this.networkService;
    this.pairingService = new PairingService();
    this.strategies = this.strategyService.initStrategies();
    this.graphService = graphService;
    this.pairingService.graphService = this.graphService;

    // copy Agents damit jede Simulation die gleichen hat
    this.agents = JSON.parse(JSON.stringify(agents)) as Agent[];
    console.log(this.agents.length, " Agents copied");
    this.trade = new Trade(this.parameters.r, this.parameters.temp, this.parameters.s, this.parameters.x);
    this.populationInfo = new PopulationInfo(this.trade);

    // Netzwerk wird gebaut und Nachbarn zugewiesen
    // this.networkService.createNetwork(this.agents);

    // Kommunikationsnetzwerk wird gebaut und Nachbarn zugewiesen
    // this.networkService.createCommunicationNetwork(this.agents);

    // Pairingservice kriegt NetzwerkInfo übergeben
    this.pairingService.networkService = this.networkService;


    this.strategyService.networkService = this.networkService;

    // this.pairingService.networkPairAgentsForTrade(this.agents);
    
  }

  runSimulation(steps: number): any {
    const totalPayoffHistory: number[] = [];
    let success = true;
    console.log("- Starting Simulation " + this.repitition + ", be patient.")
    for (let index = 0; index < steps; index++) {
      

      if (index % 100 === 0) {
        process.stdout.write(`${index}`);
      } else if (index % 10 === 0) {
        process.stdout.write(`.`);
      }

      const start = new Date();
            
      let totalPayoff = 0;

      // Agents kopieren um immer die Ausgangssituation zu haben
      const agentsAtStartOfStep: Agent[] = JSON.parse(JSON.stringify(this.agents)) as Agent[];

      switch (this.pairingMethod) {
        case 'simple': {
          for (let i = 0; i < this.agents.length / 2; i++) {

            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            const agentsToTrade: AgentPair = this.pairingService.simplePairAgents(this.agents);
    
            // prüfen dass beide Agenten ausgewählt wurden
            if (agentsToTrade.a && agentsToTrade.b) {
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
              totalPayoff += payoffObject.payoffA;
              totalPayoff += payoffObject.payoffB;
    
              // Strategiewechsel
              success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
              
              if (!success) {
                console.log("######## Exit simulation");
                return;
                
              }
            }
    
          }
          break;
        }
        case 'network': {
          for (let i = 0; i < this.agents.length - 1; i++) {

            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            const agentsToTrade: AgentPair = this.pairingService.networkPairAgentsForTrade(this.agents, false);
    
            // prüfen dass beide Agenten ausgewählt wurden
            if (agentsToTrade.a && agentsToTrade.b) {
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
              totalPayoff += payoffObject.payoffA;
              totalPayoff += payoffObject.payoffB;
    
              // Strategiewechsel
              success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
              if (!success) {
                console.log("######## Exit simulation");
                return;
                
              }
            }
    
          }
          break;
        }
        case 'dijkstra': {
          for (let i = 0; i < this.agents.length - 1; i++) {

            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            // const agentsToTrade: AgentPair = this.pairingService.networkPairAgentsForTrade(this.agents, false);
            const agentsToTrade = this.pairingService.dijkstraPair(this.agents);

            // console.log(agentsToTrade);
            
    
            // prüfen dass beide Agenten ausgewählt wurden
            if (agentsToTrade.a && agentsToTrade.b) {
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
              totalPayoff += payoffObject.payoffA;
              totalPayoff += payoffObject.payoffB;
    
              // Strategiewechsel
              success = this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
              if (!success) {
                console.log("######## Exit simulation");
                return;
                
              }
            }
    
          }
          break;
        }
        case 'network-tradeable': {          
          for (let i = 0; i < this.agents.length - 1; i++) {            
            // Agenten filtern die in diesem Step noch nicht gehandelt haben
            const agentsToTrade: AgentPair = this.pairingService.networkPairAgentsForTrade(this.agents, true);

            // console.log(agentsToTrade);
            
    
            // prüfen dass beide Agenten ausgewählt wurden
            if (agentsToTrade.a && agentsToTrade.b) {
    
              // Handel ausführen
              const payoffObject = this.trade.performTrade(agentsToTrade.a, agentsToTrade.b);
              totalPayoff += payoffObject.payoffA;
              totalPayoff += payoffObject.payoffB;
    
              // Strategiewechsel
              success= this.strategyService.performStrategySwitchCalculation(agentsToTrade.a, agentsToTrade.b, payoffObject, this.populationInfo, agentsAtStartOfStep);
              if (!success) {
                console.log("######## Exit simulation");
                return;
                
              }
            }
    
          }
          break;
        }
        
      }

      totalPayoffHistory.push(totalPayoff);
      const strategyDis = this.countStrategies(this.agents);

      tcMetric.set(strategyDis.TC);
      tpMetric.set(strategyDis.TP);
      ucMetric.set(strategyDis.UC);
      upMetric.set(strategyDis.UP);

      // Verlauf der Strategies anlegen:
      this.strategyHistory.push(strategyDis);
      

      // Population Info updaten
      this.populationInfo.updatePopulationInfo(this.agents, index + 1);
      
      if (this.data.shuffleAgents) {
        this.agents = this.shuffle(this.agents);
      }

      this.agents.forEach(agent => {
        agent.didTradeInThisStep = false;
      })

      const end = new Date();
      const duration = (end.getTime() - start.getTime()) / 1000;
      if (index % 10 === 0) {
        // console.log("Rep: " + this.repitition + " Step:", index, 'Duration:', duration);
      } else if ((this.pairingMethod as string).includes('dijkstra') && duration > 2) {
        console.log("Rep: " + this.repitition + " Step:", index, 'Duration:', duration);
      }
    }
    this.populationInfo.totalPayoffHistory = totalPayoffHistory;
    console.log('\nRepitions initial distribution:\n', this.strategyHistory[0]);
    console.log('\nRepitions last distribution:\n', this.strategyHistory[this.strategyHistory.length - 1], '\n');
    console.log('Saved steps: ', this.strategyHistory.length);
    
    let w = 0;
    this.agents.forEach(agent => {
      w += agent.wealth;
    })
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


  // Fisher-Yates shuffle algorithmus
  shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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