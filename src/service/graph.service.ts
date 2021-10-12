import { Agent } from "../model/agent";
import { DijkstraService } from "./dijkstra.service";

export class GraphService {
    dijkstra = new DijkstraService();
    graph: any;
    distances: { from: number, to: number, distance: number}[] = [];


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



    getdistanceBetweenAgents(from: Agent, to: Agent): number {
        let distance = this.distances.find(dis => {
            return dis.from + '' === from.node.id + '' && dis.to + '' === to.node.id + ''
        });
        if (distance) { return distance.distance; }

        const path = this.dijkstra.findShortestPath(this.graph, from.node.id, to.node.id);
        this.distances.push({from: from.node.id, to: to.node.id, distance: path.distance});
        return path.distance;
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

}