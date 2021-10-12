import { Agent } from "../model/agent";

import * as data from '../parameters.json';
import { DijkstraService } from "./dijkstra.service";

export class NetworkService {
    parameters = (data as any).default;
    nodes: Node[] = [];
    communicationNodes: Node[] = [];
    agents: Agent[];
    graph: any;
    distances: { from: number, to: number, distance: number}[] = [];

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
        this.calculateAllDistances(agents);

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

    calculateAllDistances(agents: Agent[]): void {
        return;
        const start = new Date();
        console.log("-- Calculating all Distances");

        agents.forEach(agent => {
            process.stdout.write(`.`);
            agents.forEach(destination => {
                
                if (agent.index !== destination.index) {
                    const exists = this.distances.find(dis => {
                        return (dis.from + '' === agent.node.id + '' || dis.to + '' === agent.node.id + '') &&
                        (dis.from + '' === destination.node.id + '' || dis.to + '' === destination.node.id + '')
                    }) != null;
                    if (!exists) {
                        // console.log(agent.node.id, destination.node.id);
                       
                        const path = this.dijkstra.findShortestPath(this.graph, agent.node.id, destination.node.id);
                        
                        this.distances.push({from: agent.node.id, to: destination.node.id, distance: path.path.length});
                        this.distances.push({from: destination.node.id, to: agent.node.id, distance: path.path.length});

                        if (path.path.length > 2 && false) {
                            for (let index = 1; index < path.path.length -1; index++) {
                                const from = agent.node.id;
                                const to = Number(path.path[index]);

                                const exists = this.distances.find(dis => {
                                    return (dis.from + '' === from + '' || dis.to + '' === from + '') &&
                                    (dis.from + '' === to + '' || dis.to + '' === to + '')
                                }) != null;

                                if (!exists) {
                                    this.distances.push({from, to, distance: index})
                                    this.distances.push({to: from, from: to, distance: index})
                                }
                            }
                        }
                        
                    }
                    
                    
                }
            })
            
            
        })
        const end = new Date()
        console.log(this.distances.length);
        console.log("\n-- Finished calculating all Distances, Duration in s:",(end.getTime() - start.getTime()) / 1000);
    }

    getdistanceBetweenAgents(from: Agent, to: Agent): number {
        let distance = this.distances.find(dis => {
            return dis.from + '' === from.node.id + '' && dis.to + '' === to.node.id + ''
        });
        if (distance) { return distance.distance; }

        const path = this.dijkstra.findShortestPath(this.graph, from.node.id, to.node.id);
        this.distances.push({from: from.node.id, to: to.node.id, distance: path.distance});
        return path.distance;
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