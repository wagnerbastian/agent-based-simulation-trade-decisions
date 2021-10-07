import { Agent } from "../model/agent";
import { Strategy } from "../model/strategy";

export class SimulationService {

    initAgents(numberOfAgents: number, strategies: Strategy[] ): any {
        const agents: Agent[] = [];
        for (let index = 0; index < numberOfAgents; index ++) {
            const a = new Agent(index);          
            if (numberOfAgents * strategies[0].distribution > index) {
                a.strategy = strategies[0];
            } else if (numberOfAgents * strategies[1].distribution > index) {
                a.strategy = strategies[1];
            } else if (numberOfAgents * strategies[2].distribution > index) {
                a.strategy = strategies[2];
            } else if (numberOfAgents * strategies[3].distribution > index) {
                a.strategy = strategies[3];
            }
            agents.push(a);
        }
        return agents;
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