import { Agent } from "../model/agent";

import * as data from '../parameters.json';

export class NetworkService {
    parameters = (data as any).default;
    nodes: Node[] = [];
    agents: Agent[];


    /**
     * Erstellt für jeden Agenten einen Node und vergibt Nachbarn
     * @param agents agenten
     */
    createNetwork(agents: Agent[]): void {
        this.agents = agents;

        // jedem Agenten einen Node erstellen
        let index = 0;
        agents.forEach(agent => {
            agent.node = new Node(index);
            agent.node.agent = agent.index;
            this.nodes.push(agent.node);
            index++;
        });

        agents.forEach(agent => {
            this.setupNeighbors(agent, agents)
        });
    }


    setupNeighbors(agent: Agent, agents: Agent[]): void {
        if (agent.node.neighbors.length === 0) {
            // neuer Agent ohne Nachbarn

            // Anzahl Nachbarn wird zufällig generiert
            const neighbors = Math.round(Math.random() * this.parameters.maxNeighbors + 0.5);

            // zufällige Anzahl an Nachbarn vergeben
            for (let index = 0; index < neighbors; index ++) {
                // filtern nach Agenten die noch nicht "voll" sind und diesen Agenten noch nicht als Nachbar haben
                const possibleNeighbors: Agent[] = agents.filter(a => a.index != agent.index && agent.node.neighbors.length < this.parameters.maxNeighbors && !agent.node.neighbors.includes(a.node.id));
                if (possibleNeighbors.length > 0) {
                    const neighbor = possibleNeighbors[Math.floor(Math.random() * possibleNeighbors.length)];
                    neighbor.node.neighbors.push(agent.node.id);
                    agent.node.neighbors.push(neighbor.node.id);
                }
            }
        }
    }

    getNodeFromAgent(agent: Agent): Node {
        const result = this.nodes.find(n => n.agent === agent.index);
        return result;
    }

    getAgentFromNode(node: Node): Agent {
        const result = this.agents.find(a => a.node.id === node.id);
        return result;
    }
}





export class Node {
    id: number;
    agent: number;
    neighbors: number[] = [];
    
    constructor(id: number) {
        this.id = id;
    }


    getAgent(): number {
        return this.agent;
    }

    getNeighbors(): number[] {
        return this.neighbors;
    }
}