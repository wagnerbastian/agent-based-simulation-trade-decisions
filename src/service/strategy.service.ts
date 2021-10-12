import { Agent } from '../model/agent';
import { PopulationInfo } from '../model/population-info';
import { Strategy } from '../model/strategy';
import { TradePayoff } from '../model/trade';
import * as parameters from '../parameters.json';
import { NetworkService } from './network.service';

export class StrategyService {
    strategy = (parameters as any).default.decisionStrategy as DecisionStrategy;
    strategies: Strategy[];
    networkService: NetworkService;
    communicationModifier = (parameters as any).default.communicationModifier as number;
    communicationPathWeight = (parameters as any).default.edgeWeightCommunication as number;


    initStrategies(): Strategy[] {
        const strategies = [];
        strategies.push(new Strategy(0, 'TC', true, this.strategy.distribution[0]));
        strategies.push(new Strategy(1, 'UC', true, this.strategy.distribution[1]));
        strategies.push(new Strategy(2, 'TP', false, this.strategy.distribution[2]));
        strategies.push(new Strategy(3, 'UP', false, this.strategy.distribution[3]));
        this.strategies = strategies;
        return strategies;
      }


      performStrategySwitchCalculation(agentA: Agent, agentB: Agent, payoffObject: TradePayoff, populationInfo: PopulationInfo, initialAgentArray: Agent[]): boolean {
        switch (this.strategy.decisionStrategy) {
          case 'best': {
            this.simpleSwitch(agentA, agentB, payoffObject);
            break;
          }
          case 'original-payoff': {        
            // Wahrscheinlichkeit wird für jeden Agenten berechnet
            this.originalSwitchPayoff(agentA, agentB, populationInfo);
            break;
          }

          case 'original-wealth': {        
            // Wahrscheinlichkeit wird für jeden Agenten berechnet
            this.originalSwitchWealth(agentA, agentB, payoffObject, populationInfo, false);
            break;
          }
          case 'original-wealth-communication-network': {        
            // Wahrscheinlichkeit wird für jeden Agenten berechnet, mit kommunikation
            this.originalSwitchWealth(agentA, agentB, payoffObject, populationInfo, true, initialAgentArray);
            break;
          }
          default: {
            console.log("### Wrong Decision Strategy ###");
            return false;
          }
        }
    
        return true;
      }
    
    
      // der Agent mit dem niedrigeren Payoff übernimmt die Strategy des Agenten mit dem höheren
      // es kann nur einer der beiden Agenten Strategie wechseln
      simpleSwitch(agentA: Agent, agentB: Agent, payoffs: TradePayoff): void {
        if (payoffs.payoffA < payoffs.payoffB) {
          agentA.strategy = agentB.strategy;
        } else if (payoffs.payoffA > payoffs.payoffB) {
          agentB.strategy = agentA.strategy;
        }
      }
    
      /**
       * Nachgebaute originale Strategieentscheidung aus dem Paper. Die Fittness (Reichtum) der Agenten werden verglichen
       * @param agentA 
       * @param agentB 
       * @param payoffs 
       * @param populationInfo 
       */
      originalSwitchWealth(agentA: Agent, agentB: Agent, payoffs: TradePayoff, populationInfo: PopulationInfo, communication: boolean, agentsAtStartOfStep?: Agent[]) {
        // if (payoffs.payoffA === 0 || payoffs.payoffB === 0) { return; }
    
        // Zur Identifizierung die Strategien speichern
        const aStrategyName = agentA.strategy.name + '';
        const bStrategyName = agentB.strategy.name + '';
    
        // Maximum von 0 und der Differenz der beiden Reichtümer im letzten Schritt
        const wA = Math.max(0, (agentB.wealth - payoffs.payoffB) - (agentA.wealth - payoffs.payoffA));
    
        const wB = Math.max(0, (agentA.wealth - payoffs.payoffA) - (agentB.wealth - payoffs.payoffB));
        
    
        const maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
    
        // wahrscheinlichkeit eines Strategiewechsel
        let probabilityA = wA / maxNetWealthDifference || 0;
        let probabilityB = wB / maxNetWealthDifference || 0;

        if (communication) {          
          /**
           * wenn Kommunikation an ist, wird die Wahrscheinlichkeit erhöht zu der Strategie zu wechseln,
           * die von den Nachbarn am meisten gewählt wurde
           */
          if (this.getNeighborsMostChosenStrategies(agentA, agentsAtStartOfStep).includes(bStrategyName) && probabilityA > 0) {
            // modify Probability of A to switch
            probabilityA += this.communicationModifier;            
          }

          if (this.getNeighborsMostChosenStrategies(agentB, agentsAtStartOfStep).includes(aStrategyName) && probabilityB > 0) {
            // modify Probability of B to switch
            probabilityB += this.communicationModifier;
          }
        }
    
        // agent a switcht zu agent b Strategy
        if (Math.random() < probabilityA) {          
          agentA.strategy = this.strategies.find(strategy => strategy.name === bStrategyName);
        }
    
        // agent b switcht zu agent a Strategy
        if (Math.random() < probabilityB) {
          agentB.strategy = this.strategies.find(strategy => strategy.name === aStrategyName);
        }
      }
    
    
    /**
     * Nutzt den letzten Payoff im Vergleich zu maximal möglichen Payoff. Nicht gut, da das Verhältniss immer Größer wird (letzter Payoff < max Payoff * runs)
     * @param agentA 
     * @param agentB 
     * @param populationInfo 
     */
      originalSwitchPayoff(agentA: Agent, agentB: Agent, populationInfo: PopulationInfo): void {
        const aStrategyName = agentA.strategy.name + '';
        const bStrategyName = agentB.strategy.name + '';
        
        // Payoff von t-1 (eigentlich t-2 da der handel durch ist) bekommen. Im ersten Handel ist er nicht da => 0
        const aPayoff = agentA.payoffs.length > 1 ? agentA.payoffs[agentA.payoffs.length - 2] : 0;
        const bPayoff = agentB.payoffs.length > 1 ? agentB.payoffs[agentB.payoffs.length - 2] : 0;
    
    
        // Maximal möglicher Unterschied aller bisherigen Handel
        const maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
    
        // wahrscheinlichkeit eines Strategiewechsel
        const probabilityA = Math.max(0, bPayoff - aPayoff) / maxNetWealthDifference || 0;
        const probabilityB = Math.max(0, aPayoff - bPayoff) / maxNetWealthDifference || 0;
    
        // console.log(aPayoff, bPayoff, maxNetWealthDifference);
        
    
        // agent a switcht to agent b Strategy
        if (Math.random() < probabilityA) {
          
          agentA.strategy = this.strategies.find(strategy => strategy.name === bStrategyName);
        }
    
        // agent b switcht to agent a Strategy
        if (Math.random() < probabilityB) {
          agentB.strategy = this.strategies.find(strategy => strategy.name === aStrategyName);
        }
      }

      getNeighborsMostChosenStrategies(agent: Agent, agents?: Agent[]): string[] {
        const neighbors: Agent[] = [];
        let TP = 0;
        let UP = 0;
        let TC = 0;
        let UC = 0;

        /**
         * Wahrscheinlichkeit, dass die direkten Nachbarn ausgewertet werden.
         * Ansonsten werden alle Nachbarn (ausser der eigene Agent) eines direkten Nachbarn ausgewertet
         */
        const takeDirectNeighbor = Math.random() < this.communicationPathWeight;

        if (takeDirectNeighbor) {
          agent.communicationNode.neighbors.forEach(n => {
            if (!agents) {
              neighbors.push(this.networkService.getAgentFromNodeID(n));
            } else {
              // agents array wurde übergeben
              const neighbor = agents.find(a => a.node.id === n);
              neighbors.push(neighbor);
            }
            
          })
        } else {

          // Nachbaragenten bekommen
          const travelTo: Agent[] = [];
          agent.communicationNode.neighbors.forEach(n => {
            travelTo.push(this.networkService.getAgentFromNodeID(n));
          });
          // zufälligen Nachbaragenten auswählen
          const index = Math.floor(Math.random() * travelTo.length);

          // Nachbarn des gewählten Agenten in Array pushen. Ausser den eigenen.
          travelTo[index].communicationNode.neighbors.forEach(n => {
            // alle Nachbarn des Nachbarn ausser den eigenen Agenten auswerten
            if (n !== agent.communicationNode.id) {
              if (!agents) {
              neighbors.push(this.networkService.getAgentFromNodeID(n));
            } else {
              // agents array wurde übergeben
              const neighbor = agents.find(a => a.node.id === n);
              neighbors.push(neighbor);
            }
            }
            
          })
        }

        // Strategien der Nachbarn zählen
        neighbors.forEach(n => {
          if (n.strategy.name === 'TP') { TP++; }
          else if (n.strategy.name === 'UP') { UP++; }
          else if (n.strategy.name === 'TC') { TC++; }
          else if (n.strategy.name === 'UC') { UC++; }
        });

        // Anzahl der am meisten gewählten Strategie nehmen.
        const max = Math.max(TP, UP, TC, UC);
        const result: string[] = [];
        // alle Strategien die am meisten gewählt wurden in Array pushen und zurückgeben
        if (TP === max) {result.push('TP'); }
        if (UP === max) {result.push('UP'); }
        if (TC === max) {result.push('TC'); }
        if (UC === max) {result.push('UC'); }

        return result;
      }
}


interface DecisionStrategy {
    distribution: number[];
    decisionStrategy: string;
}