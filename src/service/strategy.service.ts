import { Agent } from '../model/agent';
import { PopulationInfo } from '../model/population-info';
import { Strategy } from '../model/strategy';
import { TradePayoff } from '../model/trade';
import * as parameters from '../parameters.json';

export class StrategyService {
    strategy = (parameters as any).default.decisionStrategy as DecisionStrategy;
    strategies: Strategy[];


    initStrategies(): Strategy[] {
        const strategies = [];
        strategies.push(new Strategy(0, 'TC', true, this.strategy.distribution[0]));
        strategies.push(new Strategy(1, 'UC', true, this.strategy.distribution[1]));
        strategies.push(new Strategy(2, 'TP', false, this.strategy.distribution[2]));
        strategies.push(new Strategy(3, 'UP', false, this.strategy.distribution[3]));
        this.strategies = strategies;
        return strategies;
      }


      performStrategySwitchCalculation(agentA: Agent, agentB: Agent, payoffObject: TradePayoff, populationInfo: PopulationInfo): any {
        switch (this.strategy.type) {
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
            this.originalSwitchWealth(agentA, agentB, payoffObject, populationInfo);
            break;
          }
        }
    
        return null;
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
      originalSwitchWealth(agentA: Agent, agentB: Agent, payoffs: TradePayoff, populationInfo: PopulationInfo) {
        // if (payoffs.payoffA === 0 || payoffs.payoffB === 0) { return; }
    
        // Zur Identifizierung die Strategien speichern
        const aStrategyName = agentA.strategy.name + '';
        const bStrategyName = agentB.strategy.name + '';
    
        // Maximum von 0 und der Differenz der beiden Reichtümer im letzten Schritt
        const wA = Math.max(0, (agentB.wealth - payoffs.payoffB) - (agentA.wealth - payoffs.payoffA));
    
        const wB = Math.max(0, (agentA.wealth - payoffs.payoffA) - (agentB.wealth - payoffs.payoffB));
    
        const maxNetWealthDifference = populationInfo.maxPossibleIndividualWealth - populationInfo.minPossibleIndividualWealth;
    
        // wahrscheinlichkeit eines Strategiewechsel
        const probabilityA = wA / maxNetWealthDifference || 0;
        const probabilityB = wB / maxNetWealthDifference || 0;
    
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

}


interface DecisionStrategy {
    distribution: number[];
    type: string;
}