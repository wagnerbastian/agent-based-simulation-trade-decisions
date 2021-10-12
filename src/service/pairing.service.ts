import {
    Agent,
    AgentPair
} from "../model/agent";
import * as data from '../parameters.json';
import { DijkstraService } from "./dijkstra.service";
import {
    NetworkService
} from "./network.service";

export class PairingService {
    parameters = (data as any).default;
    networkService: NetworkService;


    // wählt 2 zufällige Agenten aus, die noch nicht gehandelt haben
    simplePairAgents(agents: Agent[]): AgentPair {
        const availableAgents = agents.filter(agent => !agent.didTradeInThisStep);
        if (availableAgents.length > 1) {

            // einen zufälligen Agenten auswählen
            const a = availableAgents[Math.floor(Math.random() * availableAgents.length)];

            // gewählten Agenten aus dem Array entfernen
            const elIndex = availableAgents.indexOf(a);
            availableAgents.splice(elIndex, 1);

            // Agenten aus den restlichen auswählen
            const b = availableAgents[Math.floor(Math.random() * availableAgents.length)];

            // zwei Agenten zurückgeben
            return {
                a,
                b
            };

        } else {
            // objekt mit null agenten zurückgeben
            return {
                a: null,
                b: null
            };
        }
    }

    /**
     * 
     * @param agents agenten
     * @returns Agentenpaar oder Paar aus null
     */
    networkPairAgentsForTrade(agents: Agent[], onlyTradeable: boolean): AgentPair {

            for (let index = 0; index < agents.length; index++) {

                // Agenten der noch nicht gehandelt hat suchen
                if (!agents[index].didTradeInThisStep) {
                const a = agents[index];
                let b = null;
                // suche Partner aus den nachbarn
                try {
                    b = this.searchTradePartner(a, onlyTradeable, agents);
                } catch(e) {
                    
                }
    
                return { a, b };
                }
            }
    
            // alle Agenten haben gehandelt
            return {a: null, b: null};
        
    }

    dijkstraPair(agents: Agent[]): AgentPair {
        for (let index = 0; index < agents.length; index++) {

            // Agenten der noch nicht gehandelt hat suchen
            if (!agents[index].didTradeInThisStep) {
            const a = agents[index];
            let b = null;
            // suche Partner aus den nachbarn
            try {
                b = this.searchTradePartnerDijkstra(a, agents);
            } catch(e) {
                
            }

            return { a, b };
            }
        }

        // alle Agenten haben gehandelt
        return {a: null, b: null};
    }


    searchTradePartnerDijkstra(agent: Agent, agents: Agent[]): Agent {
        const possibleAgents: any[] = agents.filter(a => !a.didTradeInThisStep && a.index !== agent.index);
        const distances: {distance: number, path: number[]}[] = [];
        possibleAgents.forEach(a => {
            distances.push(this.networkService.dijkstra.findShortestPath(this.networkService.graph, agent.node.id, a.node.id));
        });

        let partner = distances[0];
        distances.forEach(d => {
            if (partner.distance > d.distance) { partner = d; }
        });

        return this.networkService.getAgentFromNodeID(partner.path[partner.path.length -1]);
    }

    searchTradePartner(agent: Agent, onlyTradeable: boolean, agents: Agent[]): Agent {
        // Wenn der Wert höher als das Kantengewicht ist, geht der Agent eins weiter, sonst handelt er mit seinem Nachbarn.
        const moves = Math.random() > this.parameters.edgeWeight;

        // zufälligen Nachbarn aussuchen mit dem gehandelt oder weiter gegangen wird
        
        if (onlyTradeable) {
            return this.getTradableNeighbor(agent.node.id, agent.node.neighbors, agent.strategy.name, onlyTradeable, agents);
        }


        if (!moves) {
            const partner = this.getTradableNeighbor(agent.node.id, agent.node.neighbors, agent.strategy.name, onlyTradeable, agents);

            // Wenn mit einem Partner gehandelt werden kann, wird dieser zurückgegeben.
            if (partner != null) {
                return partner;
            } else {
                // Alle Nachbarn haben gehandelt
                // zu zufälligen Nachbarn laufen und dort suchen
                const neighborIndex = Math.floor(Math.random() * agent.node.neighbors.length);
                const neighbor = this.networkService.getAgentFromNodeID(agent.node.neighbors[neighborIndex]);
                return this.searchTradePartner(neighbor, onlyTradeable, agents);

            }
        } else {
            // zu zufälligen Nachbarn laufen und dort suchen
            const neighborIndex = Math.floor(Math.random() * agent.node.neighbors.length);
            const neighbor = this.networkService.getAgentFromNodeID(agent.node.neighbors[neighborIndex]);
            return this.searchTradePartner(neighbor, onlyTradeable, agents);
        }
    }

    /**
     * gibt einen Nachbaragenten zurück, falls einer frei ist
     * @param neighbors IDs der Nachbar Nodes
     * @returns Agent wenn einer da ist mit dem gehandelt werden kann. Null, wenn mit allen gehandelt wurde
     */
    getTradableNeighbor(agentNodeID: number, neighbors: number[], agentStrategyName: string, onlyTradeable: boolean, agents: Agent[]): Agent {
       if (!onlyTradeable) {
            // Nach Nachbarn suchen die noch nicht gehandelt haben
        const possibleNeighbors: Agent[] = [];
        neighbors.forEach(n => {
            const a = this.networkService.getAgentFromNodeID(n);
            if (!a.didTradeInThisStep) {
                    possibleNeighbors.push(a);
                
            }

        });

        if (possibleNeighbors.length > 0) {
            // es ist ein Nachbar da der handeln kann
            // zufälligen Nachbarn zurückgeben.
            const index = Math.floor(Math.random() * possibleNeighbors.length);
            return possibleNeighbors[index];
        }
        return null;
       } else {
           // nur partner suchen mit denen gehandelt werden kann...
            const possibleTradePartners = agents.filter(agent => agent.node.id !== agentNodeID && !agent.didTradeInThisStep && this.canTradeWith(agentStrategyName, agent.strategy.name));
            const distances: {distance: number, path: number[]}[] = [];
            possibleTradePartners.forEach(p => {
                distances.push(this.networkService.dijkstra.findShortestPath(this.networkService.graph, agentNodeID, p.node.id));
            });

            let partner = distances[0];
            distances.forEach(element => {
                if (element.distance < partner.distance) {
                    partner = element;
                }
            });
            return this.networkService.getAgentFromNodeID(partner.path[partner.path.length - 1])
       }
    }

    // gibt true zurück wenn einer ein Consumer und der andere ein Provider ist
    canTradeWith(agentAStrategyName: string, agentBStrategyName: string): boolean {
        return (agentAStrategyName.includes('P') && agentBStrategyName.includes('C') || agentAStrategyName.includes('C') && agentBStrategyName.includes('P'));
    }


}