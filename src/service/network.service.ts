import { Agent } from "../model/agent";

import * as data from '../parameters.json';
import { DijkstraService } from "./dijkstra.service";

export class NetworkService {
    parameters = (data as any).default;
    nodes: Node[] = [];
    communicationNodes: Node[] = [];
    agents: Agent[];
    graph: any;

    dijkstra = new DijkstraService();


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
            this.setupNeighbors(agent, agents);
        });

        this.generateGraphForDistance(agents);

        console.log(this.dijkstra.findShortestPath(this.graph, 1, 8));
        
        
    }
    /**
     * Kommunaikationsnetzwerk wird erstellt und Nachbarn zugewiesen
     */
    createCommunicationNetwork(agents: Agent[]): void {
        // jedem Agenten einen Node erstellen
        let index = 0;
        agents.forEach(agent => {
            agent.communicationNode = new Node(index);
            agent.communicationNode.agent = agent.index;
            this.communicationNodes.push(agent.node);
            index++;
        });

        agents.forEach(agent => {
            this.setupCommunicationNeighbors(agent, agents)
        });
    }

    /**
     * Nachbarn für die Kommunikation werden vergeben.
     */
    setupCommunicationNeighbors(agent: Agent, agents: Agent[]): void {
        if (agent.communicationNode.neighbors.length === 0) {
            // neuer Agent ohne Nachbarn

            // Anzahl Nachbarn wird zufällig generiert
            const neighbors = Math.round(Math.random() * this.parameters.maxCommunicationNeighbors + 0.5);

            // zufällige Anzahl an Nachbarn vergeben
            for (let index = 0; index < neighbors; index ++) {
                // filtern nach Agenten die noch nicht "voll" sind und diesen Agenten noch nicht als Nachbar haben
                const possibleNeighbors: Agent[] = agents.filter(a => a.index != agent.index && agent.communicationNode.neighbors.length < this.parameters.maxNeighbors && !agent.communicationNode.neighbors.includes(a.node.id));
                if (possibleNeighbors.length > 0) {
                    const neighbor = possibleNeighbors[Math.floor(Math.random() * possibleNeighbors.length)];
                    neighbor.communicationNode.neighbors.push(agent.communicationNode.id);
                    agent.communicationNode.neighbors.push(neighbor.communicationNode.id);
                }
            }
        }
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
        } else if (agent.node.neighbors.length < this.parameters.minNeighbors) {
            // Anzahl Nachbarn wird zufällig generiert
            const neighbors = Math.round(Math.random() * this.parameters.maxNeighbors + 0.5) - agent.node.neighbors.length;

            if (neighbors > 0) {
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
    }

    getNodeFromAgent(agent: Agent): Node {
        const result = this.nodes.find(n => n.agent === agent.index);
        return result;
    }

    getAgentFromNode(node: Node): Agent {
        const result = this.agents.find(a => a.node.id === node.id);
        return result;
    }

    getAgentFromNodeID(nodeID: number): Agent {
        const result = this.agents.find(a => a.node.id === nodeID);
        return result;
    }

    generateGraphForDistance(agents: Agent[]) {
        console.log("- starting graph building")
        let graph: any = {};
        // A: { start: 1, C: 1, D: 1 },
        agents.forEach(agent => {
            let node: any = {}
            agent.node.neighbors.forEach(n => {
                node[n] = 1;
            });
            graph[agent.node.id] = node;
        });

        this.graph = graph;
        console.log("- finished graph building")
    }

}





export class Node {
    id: number;
    agent: number;
    neighbors: number[] = [];
    paths: Path[] = [];
    
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

export interface Path {
    destination: Node;
    start: Node;
    weight: number;
}